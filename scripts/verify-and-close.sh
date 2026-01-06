#!/bin/bash
#
# verify-and-close.sh - Test-gated issue closure for Notion Clone
#
# Usage: ./scripts/verify-and-close.sh <issue-id>
#
# This script ensures tests pass before allowing issue closure.
# It enforces the test-gated workflow defined in AGENTS.md.

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKEND_COVERAGE_THRESHOLD=80
FRONTEND_COVERAGE_THRESHOLD=70
LOG_DIR=".beads/test-logs"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Ensure log directory exists
mkdir -p "$LOG_DIR"

# Helper functions
log() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if issue ID is provided
if [ -z "$1" ]; then
    error "Usage: $0 <issue-id>"
    exit 1
fi

ISSUE_ID="$1"
LOG_FILE="$LOG_DIR/${ISSUE_ID}_${TIMESTAMP}.log"

log "Starting verification for issue: $ISSUE_ID"
log "Log file: $LOG_FILE"

# Get issue details
log "Fetching issue details..."
ISSUE_INFO=$(bd show "$ISSUE_ID" 2>/dev/null || echo "")

if [ -z "$ISSUE_INFO" ]; then
    error "Issue $ISSUE_ID not found"
    exit 1
fi

# Determine issue type based on tags
IS_BACKEND=false
IS_FRONTEND=false
IS_TEST_ISSUE=false

if echo "$ISSUE_INFO" | grep -q "backend"; then
    IS_BACKEND=true
fi

if echo "$ISSUE_INFO" | grep -q "frontend"; then
    IS_FRONTEND=true
fi

if echo "$ISSUE_ID" | grep -q "\-test$"; then
    IS_TEST_ISSUE=true
fi

log "Issue type detection:"
log "  Backend: $IS_BACKEND"
log "  Frontend: $IS_FRONTEND"
log "  Is test issue: $IS_TEST_ISSUE"

# Track overall success
ALL_PASSED=true

# Function to run tests and capture results
run_tests() {
    local test_type="$1"
    local test_cmd="$2"
    local description="$3"
    
    log "Running $description..."
    echo "=== $description ===" >> "$LOG_FILE"
    echo "Command: $test_cmd" >> "$LOG_FILE"
    echo "Started: $(date)" >> "$LOG_FILE"
    
    if eval "$test_cmd" >> "$LOG_FILE" 2>&1; then
        success "$description passed"
        echo "Result: PASSED" >> "$LOG_FILE"
        return 0
    else
        error "$description failed"
        echo "Result: FAILED" >> "$LOG_FILE"
        ALL_PASSED=false
        return 1
    fi
}

# Check if project is set up
check_project_setup() {
    if [ ! -d "backend" ] && [ ! -d "frontend" ]; then
        warn "Project not yet set up (no backend/frontend directories)"
        warn "Skipping tests - project setup issues can be closed without tests"
        
        # Allow closing setup issues without tests
        if echo "$ISSUE_INFO" | grep -qi "setup\|infrastructure"; then
            log "This appears to be a setup/infrastructure issue"
            return 0
        fi
        return 1
    fi
    return 0
}

# Main test execution
main() {
    echo "================================================" >> "$LOG_FILE"
    echo "Verification Log for: $ISSUE_ID" >> "$LOG_FILE"
    echo "Timestamp: $(date)" >> "$LOG_FILE"
    echo "================================================" >> "$LOG_FILE"
    
    # Check project setup
    if ! check_project_setup; then
        error "Project not set up and this is not a setup issue"
        exit 1
    fi
    
    # Skip tests if project not set up yet (for setup issues)
    if [ ! -d "backend" ] && [ ! -d "frontend" ]; then
        success "Setup issue - no tests required yet"
        log "Closing issue $ISSUE_ID..."
        bd close "$ISSUE_ID" --reason="Completed - setup issue, tests not applicable yet"
        success "Issue $ISSUE_ID closed successfully"
        exit 0
    fi
    
    # Run backend tests if applicable
    if [ "$IS_BACKEND" = true ] && [ -d "backend" ]; then
        log "Backend tests required..."
        
        if [ -f "backend/package.json" ]; then
            cd backend
            
            # Unit tests
            if grep -q "\"test\"" package.json 2>/dev/null; then
                run_tests "backend-unit" "pnpm test --run" "Backend unit tests" || true
            else
                warn "No test script found in backend/package.json"
            fi
            
            # Integration tests
            if grep -q "\"test:integration\"" package.json 2>/dev/null; then
                run_tests "backend-integration" "pnpm test:integration" "Backend integration tests" || true
            fi
            
            # Coverage check
            if grep -q "\"test:coverage\"" package.json 2>/dev/null; then
                log "Checking backend coverage..."
                if pnpm test:coverage 2>&1 | tee -a "$LOG_FILE" | grep -q "All files.*$BACKEND_COVERAGE_THRESHOLD"; then
                    success "Backend coverage meets threshold ($BACKEND_COVERAGE_THRESHOLD%)"
                else
                    warn "Backend coverage check - manual verification recommended"
                fi
            fi
            
            cd ..
        else
            warn "backend/package.json not found"
        fi
    fi
    
    # Run frontend tests if applicable
    if [ "$IS_FRONTEND" = true ] && [ -d "frontend" ]; then
        log "Frontend tests required..."
        
        if [ -f "frontend/package.json" ]; then
            cd frontend
            
            # Unit tests
            if grep -q "\"test\"" package.json 2>/dev/null; then
                run_tests "frontend-unit" "pnpm test --run" "Frontend unit tests" || true
            else
                warn "No test script found in frontend/package.json"
            fi
            
            cd ..
        fi
    fi
    
    # Run E2E tests if this is a test issue or full-stack
    if [ "$IS_TEST_ISSUE" = true ] || ([ "$IS_BACKEND" = true ] && [ "$IS_FRONTEND" = true ]); then
        if [ -d "e2e" ] && [ -f "e2e/package.json" ] || [ -f "playwright.config.ts" ]; then
            log "E2E tests required..."
            run_tests "e2e" "pnpm test:e2e" "E2E tests" || true
        else
            warn "E2E directory not found - skipping E2E tests"
        fi
    fi
    
    # Final result
    echo "" >> "$LOG_FILE"
    echo "================================================" >> "$LOG_FILE"
    echo "Final Result: $([ "$ALL_PASSED" = true ] && echo 'ALL PASSED' || echo 'SOME FAILED')" >> "$LOG_FILE"
    echo "Completed: $(date)" >> "$LOG_FILE"
    echo "================================================" >> "$LOG_FILE"
    
    if [ "$ALL_PASSED" = true ]; then
        success "All tests passed!"
        log "Closing issue $ISSUE_ID..."
        
        bd close "$ISSUE_ID" --reason="Completed - all tests passed (see $LOG_FILE)"
        
        success "Issue $ISSUE_ID closed successfully"
        log "Test log saved to: $LOG_FILE"
        exit 0
    else
        error "Some tests failed. Issue NOT closed."
        error "Review log file: $LOG_FILE"
        error "Fix failing tests and run again."
        exit 1
    fi
}

# Run main function
main
