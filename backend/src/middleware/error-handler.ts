import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import { ApiError } from "../utils/api-error.js";

export function errorHandler(error: unknown, req: Request, res: Response, _next: NextFunction) {
  const apiError =
    error instanceof ApiError
      ? error
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
