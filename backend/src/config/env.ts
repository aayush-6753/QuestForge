import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3001),
  DATABASE_URL: z.string().url(),
  DIRECT_URL: z.string().url(),
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  CLIENT_ORIGIN: z.string().optional(),
  CLIENT_ORIGINS: z.string().default("http://localhost:5173,http://localhost:5174"),
}).transform((value) => {
  const originSource = value.CLIENT_ORIGIN?.trim() ? value.CLIENT_ORIGIN : value.CLIENT_ORIGINS;
  const clientOrigins = originSource
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  return {
    ...value,
    CLIENT_ORIGINS: clientOrigins,
  };
});

const testDefaults = {
  DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/life_rpg_test",
  DIRECT_URL: "postgresql://postgres:postgres@localhost:5432/life_rpg_test",
  SUPABASE_URL: "https://example.supabase.co",
  SUPABASE_ANON_KEY: "test-anon-key",
  CLIENT_ORIGINS: "http://localhost:5173,http://localhost:5174",
};

export function loadEnv(source: NodeJS.ProcessEnv = process.env) {
  const normalized =
    source.NODE_ENV === "test"
      ? {
          ...testDefaults,
          ...source,
        }
      : source;

  const parsed = envSchema.safeParse(normalized);

  if (!parsed.success) {
    const details = parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ");
    throw new Error(`Invalid server environment: ${details}`);
  }

  const invalidClientOrigin = parsed.data.CLIENT_ORIGINS.find((origin) => !z.string().url().safeParse(origin).success);

  if (invalidClientOrigin) {
    throw new Error(`Invalid server environment: CLIENT_ORIGINS: Invalid url (${invalidClientOrigin})`);
  }

  return parsed.data;
}

export const env = loadEnv();
