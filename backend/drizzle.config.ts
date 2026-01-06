import type { Config } from "drizzle-kit";

export default {
  schema: "./src/db/schema/*",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url:
      process.env.DATABASE_URL ||
      `postgresql://${process.env.DATABASE_USER || "postgres"}:${process.env.DATABASE_PASSWORD || "postgres"}@${process.env.DATABASE_HOST || "localhost"}:${process.env.DATABASE_PORT || "5432"}/${process.env.DATABASE_NAME || "notionv2"}`,
  },
  verbose: true,
  strict: true,
} satisfies Config;
