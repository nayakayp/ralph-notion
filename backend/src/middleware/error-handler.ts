import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { ZodError } from "zod";
import { AppError } from "../utils/errors";

export function errorHandler(err: Error, c: Context) {
  const requestId = c.get("requestId") || "unknown";

  // Log the error
  console.error(`[${requestId}] Error:`, err);

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    return c.json(
      {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Validation failed",
          details: err.errors.map((e) => ({
            field: e.path.join("."),
            message: e.message,
          })),
        },
        requestId,
      },
      400
    );
  }

  // Handle custom AppError
  if (err instanceof AppError) {
    return c.json(
      {
        success: false,
        error: {
          code: err.code,
          message: err.message,
          details: err.details,
        },
        requestId,
      },
      err.statusCode
    );
  }

  // Handle Hono HTTPException
  if (err instanceof HTTPException) {
    return c.json(
      {
        success: false,
        error: {
          code: "HTTP_ERROR",
          message: err.message,
        },
        requestId,
      },
      err.status
    );
  }

  // Handle unknown errors
  const isDev = process.env.NODE_ENV === "development";
  return c.json(
    {
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: isDev ? err.message : "An unexpected error occurred",
        ...(isDev && { stack: err.stack }),
      },
      requestId,
    },
    500
  );
}
