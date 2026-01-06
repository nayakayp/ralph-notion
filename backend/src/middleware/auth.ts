import type { Context, Next } from "hono";

// Placeholder auth middleware for BetterAuth integration
// This will be fully implemented when BetterAuth is set up

export interface AuthContext {
  user: {
    id: string;
    email: string;
    name: string | null;
  } | null;
  session: {
    id: string;
    expiresAt: Date;
  } | null;
}

declare module "hono" {
  interface ContextVariableMap {
    auth: AuthContext;
  }
}

export async function authMiddleware(c: Context, next: Next) {
  // Placeholder: Extract and validate auth from request
  // This will be replaced with actual BetterAuth validation

  const authHeader = c.req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    c.set("auth", { user: null, session: null });
    return next();
  }

  // TODO: Implement actual token validation with BetterAuth
  // const token = authHeader.substring(7);
  // const session = await validateSession(token);

  c.set("auth", { user: null, session: null });
  return next();
}

export async function requireAuth(c: Context, next: Next) {
  const auth = c.get("auth");

  if (!auth?.user) {
    return c.json(
      {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication required",
        },
      },
      401
    );
  }

  return next();
}
