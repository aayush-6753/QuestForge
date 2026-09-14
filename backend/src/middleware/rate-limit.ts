import rateLimit from "express-rate-limit";
import type { Request, Response } from "express";

export function sendRateLimitError(req: Request, res: Response) {
  res.status(429).json({
    error: {
      code: "RATE_LIMITED",
      message: "Too many requests. Please try again shortly.",
      requestId: req.requestId,
    },
  });
}

export const apiRateLimit = rateLimit({
  windowMs: 60_000,
  limit: 120,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  handler: sendRateLimitError,
});
