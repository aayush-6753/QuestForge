import type { NextFunction, Request, Response } from "express";
import { supabase } from "../lib/supabase.js";
import { ApiError } from "../utils/api-error.js";

export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const authorization = req.header("authorization");
    const token = authorization?.match(/^Bearer +(\S+)$/i)?.[1];

    if (!token) {
      throw new ApiError(401, "UNAUTHORIZED", "Missing bearer token.");
    }

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      throw new ApiError(401, "UNAUTHORIZED", "Invalid or expired token.");
    }

    req.auth = {
      userId: data.user.id,
      email: data.user.email,
    };

    next();
  } catch (error) {
    next(error);
  }
}
