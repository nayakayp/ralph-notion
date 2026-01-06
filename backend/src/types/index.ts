// API Response Types

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  requestId?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

export interface PaginatedApiResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// Request Context Types
export interface RequestContext {
  requestId: string;
  userId?: string;
  sessionId?: string;
  startTime: number;
}

// Common Entity Types
export interface Timestamps {
  createdAt: Date;
  updatedAt: Date;
}

export interface SoftDelete extends Timestamps {
  deletedAt: Date | null;
}

// Re-export schema types
export * from "../db/schema/auth";
