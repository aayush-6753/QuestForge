import { env } from "./env";
import { supabase } from "./supabase";

type ApiErrorBody = {
  error?: {
    code?: string;
    message?: string;
    requestId?: string;
  };
};

export class ApiClientError extends Error {
  readonly status: number;
  readonly code: string;
  readonly requestId?: string;

  constructor(status: number, code: string, message: string, requestId?: string) {
    super(message);
    this.status = status;
    this.code = code;
    this.requestId = requestId;
  }
}

type ApiSuccess<T> = {
  data: T;
};

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");

  if (session?.access_token) {
    headers.set("Authorization", `Bearer ${session.access_token}`);
  }

  const response = await fetch(`${env.VITE_API_BASE_URL}${path}`, {
    ...init,
    headers,
  });

  const body = (await response.json().catch(() => ({}))) as ApiSuccess<T> & ApiErrorBody;

  if (!response.ok) {
    throw new ApiClientError(
      response.status,
      body.error?.code ?? "API_ERROR",
      body.error?.message ?? "Request failed.",
      body.error?.requestId,
    );
  }

  return body.data;
}
