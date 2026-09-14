import { z } from "zod";

const envSchema = z.object({
  VITE_SUPABASE_URL: z.string().url("VITE_SUPABASE_URL must be a valid URL"),
  VITE_SUPABASE_ANON_KEY: z.string().min(1, "VITE_SUPABASE_ANON_KEY is required"),
  VITE_API_BASE_URL: z.string().url("VITE_API_BASE_URL must be a valid URL"),
});

const fallbackEnv = {
  VITE_SUPABASE_URL: "https://example.supabase.co",
  VITE_SUPABASE_ANON_KEY: "missing-supabase-anon-key",
  VITE_API_BASE_URL: "http://localhost:3001",
};

export function loadEnv(values: Record<string, unknown>) {
  const parsed = envSchema.safeParse(values);

  if (!parsed.success) {
    const details = parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ");
    throw new Error(`Invalid client environment: ${details}`);
  }

  return parsed.data;
}

const testFallback: Partial<typeof fallbackEnv> = import.meta.env.MODE === "test" ? fallbackEnv : {};

export const env = loadEnv({
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || testFallback.VITE_SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || testFallback.VITE_SUPABASE_ANON_KEY,
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL || testFallback.VITE_API_BASE_URL,
});
