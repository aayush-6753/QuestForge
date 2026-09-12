import type { Request } from "express";
import type { z } from "zod";
import { ApiError } from "./api-error.js";

export function validateRequest<TSchema extends z.ZodTypeAny>(schema: TSchema, value: unknown): z.infer<TSchema> {
  const parsed = schema.safeParse(value);

  if (!parsed.success) {
    throw new ApiError(400, "VALIDATION_ERROR", "Request validation failed.", parsed.error.flatten());
  }

  return parsed.data;
}

export function requireAuthContext(req: Request) {
  if (!req.auth) {
    throw new ApiError(401, "UNAUTHORIZED", "Authentication is required.");
  }

  return req.auth;
}
