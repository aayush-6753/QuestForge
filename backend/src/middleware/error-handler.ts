import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import { ApiError } from "../utils/api-error.js";

function isInvalidJson(error: unknown): error is SyntaxError & { type: "entity.parse.failed" } {
  return error instanceof SyntaxError && "type" in error && error.type === "entity.parse.failed";
}

export function errorHandler(error: unknown, req: Request, res: Response, _next: NextFunction) {
  const apiError =
    error instanceof ApiError
      ? error
      : isInvalidJson(error)
        ? new ApiError(400, "INVALID_JSON", "Request body contains invalid JSON.")
      : new ApiError(500, "INTERNAL_SERVER_ERROR", "Something went wrong.");

  if (apiError.statusCode >= 500) {
    logger.error("Unhandled API error", {
      requestId: req.requestId,
      error,
    });
  }

  res.status(apiError.statusCode).json({
    error: {
      code: apiError.code,
      message: apiError.message,
      requestId: req.requestId,
      ...(env.NODE_ENV === "production" ? {} : { details: apiError.details }),
    },
  });
}
