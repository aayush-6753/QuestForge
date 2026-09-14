type LogContext = Record<string, unknown>;

const sensitiveKey = /authorization|cookie|password|secret|token|database_?url|direct_?url/i;

function sanitize(value: unknown, key = "", seen = new WeakSet<object>()): unknown {
  if (sensitiveKey.test(key)) return "[REDACTED]";
  if (value instanceof Error) {
    const code = "code" in value && typeof value.code === "string" ? value.code : undefined;
    return { name: value.name, message: value.message, ...(code ? { code } : {}) };
  }
  if (!value || typeof value !== "object") return value;
  if (seen.has(value)) return "[Circular]";
  seen.add(value);
  if (Array.isArray(value)) return value.map((item) => sanitize(item, key, seen));
  return Object.fromEntries(Object.entries(value).map(([childKey, child]) => [childKey, sanitize(child, childKey, seen)]));
}

function clean(context?: LogContext) {
  return context ? sanitize(context) : {};
}

export const logger = {
  info(message: string, context?: LogContext) {
    console.info(message, clean(context));
  },
  warn(message: string, context?: LogContext) {
    console.warn(message, clean(context));
  },
  error(message: string, context?: LogContext) {
    console.error(message, clean(context));
  },
};
