# Agent Instructions

This project uses **bd** (beads) for issue tracking. Run `bd onboard` to get started.

## Quick Reference

```bash
bd ready              # Find available work
bd show <id>          # View issue details
bd update <id> --status in_progress  # Claim work
bd close <id>         # Complete work
bd sync               # Sync with git
```

---

## 🚨 TEST-GATED WORKFLOW (MANDATORY)

**ALL feature issues require passing tests before closure.** This is NON-NEGOTIABLE.

### Issue Types & Dependencies

This project uses a **two-issue pattern** for every feature:

1. **Feature Issue** (`notionv2-clone-xxx`) - Implementation work
2. **Test Issue** (`notionv2-clone-xxx-test`) - Test suite for that feature

**Dependency Chain:**
```
Feature A → Test A → Feature B → Test B → Feature C → ...
```

A feature issue can only be closed when:
- All code is implemented
- A corresponding test issue exists
- The test issue is assigned as a dependency to the NEXT feature

A test issue can only be closed when:
- ALL tests pass (unit, integration, E2E as applicable)
- Test coverage meets minimum thresholds
- `./scripts/verify-and-close.sh <issue-id>` succeeds

### Mandatory Test Requirements

#### For Backend Features:
```bash
# Required tests:
- Unit tests (Vitest) - test individual functions/services
- Integration tests - test API endpoints with real database
- Use test database, NOT production data

# Minimum coverage: 80%
# Run before closing:
pnpm test:backend
pnpm test:backend:coverage
```

#### For Frontend Features:
```bash
# Required tests:
- Unit tests (Vitest) - test components in isolation
- Integration tests - test component interactions
- E2E tests (Playwright) - test real user flows

# Minimum coverage: 70%
# Run before closing:
pnpm test:frontend
pnpm test:e2e
```

#### For Full-Stack Features:
```bash
# Required: ALL of the above
# Run before closing:
pnpm test:all
pnpm test:e2e
```

### Verification Script

**NEVER close an issue without running:**
```bash
./scripts/verify-and-close.sh <issue-id>
```

This script:
1. Identifies the issue type (feature or test)
2. Runs appropriate test suites
3. Checks coverage thresholds
4. Only closes if ALL checks pass
5. Logs results to `.beads/test-logs/`

### Test File Naming Convention

```
# Backend tests
backend/src/routes/__tests__/auth.test.ts
backend/src/services/__tests__/workspace.test.ts
backend/src/routes/__tests__/auth.integration.test.ts

# Frontend tests
frontend/src/components/__tests__/Sidebar.test.tsx
frontend/src/hooks/__tests__/useAuth.test.ts

# E2E tests
e2e/auth.spec.ts
e2e/workspace.spec.ts
e2e/pages.spec.ts
```

### Test Issue Template

When you create a test issue, include:
```markdown
## Test Scope
- Feature issue: notionv2-clone-xxx
- Components/endpoints to test: [list]

## Test Checklist
- [ ] Unit tests written
- [ ] Integration tests written (if applicable)
- [ ] E2E tests written (if applicable)
- [ ] All tests passing
- [ ] Coverage threshold met
- [ ] verify-and-close.sh passes

## Test Files Created
- [ ] path/to/test1.test.ts
- [ ] path/to/test2.test.ts

## Commands to Run
pnpm test:backend (or frontend/e2e)
```

---

## Landing the Plane (Session Completion)

**When ending a work session**, you MUST complete ALL steps below. Work is NOT complete until `git push` succeeds.

**MANDATORY WORKFLOW:**

1. **File issues for remaining work** - Create issues for anything that needs follow-up
2. **Run quality gates** (if code changed) - Tests, linters, builds
3. **Update issue status** - Close finished work, update in-progress items
4. **PUSH TO REMOTE** - This is MANDATORY:
   ```bash
   git pull --rebase
   bd sync
   git push
   git status  # MUST show "up to date with origin"
   ```
5. **Clean up** - Clear stashes, prune remote branches
6. **Verify** - All changes committed AND pushed
7. **Hand off** - Provide context for next session

**CRITICAL RULES:**
- Work is NOT complete until `git push` succeeds
- NEVER stop before pushing - that leaves work stranded locally
- NEVER say "ready to push when you are" - YOU must push
- If push fails, resolve and retry until it succeeds


<!-- bv-agent-instructions-v1 -->

---

## Beads Workflow Integration

This project uses [beads_viewer](https://github.com/Dicklesworthstone/beads_viewer) for issue tracking. Issues are stored in `.beads/` and tracked in git.

### Essential Commands

```bash
# View issues (launches TUI - avoid in automated sessions)
bv

# CLI commands for agents (use these instead)
bd ready              # Show issues ready to work (no blockers)
bd list --status=open # All open issues
bd show <id>          # Full issue details with dependencies
bd create --title="..." --type=task --priority=2
bd update <id> --status=in_progress
bd close <id> --reason="Completed"
bd close <id1> <id2>  # Close multiple issues at once
bd sync               # Commit and push changes
```

### Workflow Pattern

1. **Start**: Run `bd ready` to find actionable work
2. **Claim**: Use `bd update <id> --status=in_progress`
3. **Work**: Implement the task
4. **Complete**: Use `bd close <id>`
5. **Sync**: Always run `bd sync` at session end

### Key Concepts

- **Dependencies**: Issues can block other issues. `bd ready` shows only unblocked work.
- **Priority**: P0=critical, P1=high, P2=medium, P3=low, P4=backlog (use numbers, not words)
- **Types**: task, bug, feature, epic, question, docs
- **Blocking**: `bd dep add <issue> <depends-on>` to add dependencies

### Session Protocol

**Before ending any session, run this checklist:**

```bash
git status              # Check what changed
git add <files>         # Stage code changes
bd sync                 # Commit beads changes
git commit -m "..."     # Commit code
bd sync                 # Commit any new beads changes
git push                # Push to remote
```

### Best Practices

- Check `bd ready` at session start to find available work
- Update status as you work (in_progress → closed)
- Create new issues with `bd create` when you discover tasks
- Use descriptive titles and set appropriate priority/type
- Always `bd sync` before ending session

<!-- end-bv-agent-instructions -->
