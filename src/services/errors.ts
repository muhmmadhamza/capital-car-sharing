import { ApiError } from "@/lib/api-client";

export type ServiceErrorCode =
  | "invalid_credentials"
  | "email_taken"
  | "unauthenticated"
  | "forbidden"
  | "not_found"
  | "not_cancellable"
  | "invalid_input"
  | "conflict"
  | "network"
  /** The backend has no endpoint for this yet. Nothing was changed. */
  | "unavailable";

/**
 * Error thrown by every service in src/services. HTTP failures from the API
 * client are converted with `toServiceError`, so the UI never has to care
 * about status codes.
 */
export class ServiceError extends Error {
  constructor(
    public readonly code: ServiceErrorCode,
    message: string,
    /** Form field the error belongs to, when there is one. */
    public readonly field?: string,
  ) {
    super(message);
    this.name = "ServiceError";
  }
}

export const isServiceError = (e: unknown): e is ServiceError => e instanceof ServiceError;

/** Message that is safe to show to a user. */
export function errorMessage(e: unknown): string {
  if (isServiceError(e)) return e.message;
  if (e instanceof ApiError) {
    const converted = toServiceError(e);
    if (isServiceError(converted)) return converted.message;
  }
  return "Something went wrong. Please try again.";
}

/** Turns an API client error into a ServiceError. Anything else is returned as-is. */
export function toServiceError(e: unknown, fallback: ServiceErrorCode = "invalid_input"): unknown {
  if (!(e instanceof ApiError)) return e;
  if (e.status === 0) return new ServiceError("network", e.message);
  if (e.status === 401) return new ServiceError("unauthenticated", e.message);
  if (e.status === 403) return new ServiceError("forbidden", e.message);
  if (e.status === 404) return new ServiceError("not_found", e.message);
  if (e.status === 409) return new ServiceError(/e-?mail/i.test(e.message) ? "email_taken" : "conflict", e.message, /e-?mail/i.test(e.message) ? "email" : undefined);
  if (e.status >= 500) return new ServiceError("network", "The server had a problem. Please try again in a moment.");
  return new ServiceError(fallback, e.errors?.[0] ?? e.message);
}

/** Runs an API call and rethrows failures as ServiceError. */
export async function guard<T>(call: () => Promise<T>, fallback: ServiceErrorCode = "invalid_input"): Promise<T> {
  try {
    return await call();
  } catch (e) {
    throw toServiceError(e, fallback);
  }
}

/**
 * For operations the UI offers but the backend does not expose yet. The user
 * sees an honest message and nothing is changed or pretended.
 */
export function unavailable(what: string): never {
  throw new ServiceError("unavailable", `${what} isn't available yet because the server doesn't support it. Nothing was changed.`);
}

/**
 * Login failures: a rejected email/password (or a blocked account) is "invalid_credentials"
 * with the API's own message; connection problems stay connection problems.
 */
export function toLoginError(e: unknown): unknown {
  if (e instanceof ApiError && [400, 401, 403, 404, 422].includes(e.status)) {
    return new ServiceError("invalid_credentials", e.status === 401 ? "Incorrect email or password." : e.message);
  }
  return toServiceError(e);
}
