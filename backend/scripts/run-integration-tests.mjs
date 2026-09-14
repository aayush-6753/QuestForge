import "dotenv/config";
import { spawnSync } from "node:child_process";
import process from "node:process";
import { URL } from "node:url";

const integrationUrl = process.env.INTEGRATION_DATABASE_URL;

if (!integrationUrl) {
  throw new Error("INTEGRATION_DATABASE_URL is required.");
}

const parsed = new URL(integrationUrl);
const databaseName = decodeURIComponent(parsed.pathname.slice(1));
const isLocal = parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1";

if (!isLocal && !/(?:^|[_-])(test|testing)(?:$|[_-])/i.test(databaseName)) {
  throw new Error("Integration tests require localhost or a database name containing 'test'.");
}

if (integrationUrl === process.env.DATABASE_URL) {
  throw new Error("INTEGRATION_DATABASE_URL must differ from DATABASE_URL.");
}

const env = {
  ...process.env,
  NODE_ENV: "test",
  DATABASE_URL: integrationUrl,
  DIRECT_URL: process.env.INTEGRATION_DIRECT_URL || integrationUrl,
};
const executable = process.platform === "win32" ? "npx.cmd" : "npx";

function run(args) {
  const result = spawnSync(executable, args, { env, stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

run([
  "prisma",
  "db",
  "execute",
  "--file",
  "scripts/integration-bootstrap.sql",
  "--schema",
  "prisma/schema.prisma",
]);
run(["prisma", "migrate", "deploy", "--schema", "prisma/schema.prisma"]);
run(["vitest", "run", "--config", "vitest.integration.config.ts"]);
