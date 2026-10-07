export type ServiceErrorCode =
  | "invalid_credentials"
  | "email_taken"
  | "unauthenticated"
  | "not_found"
  | "not_cancellable"
  | "invalid_input"
  | "network";

/**
 * Error thrown by every service in src/services. The Node.js API should return
 * `{ code, message, field? }` with a 4xx status so the HTTP repositories can
 * rebuild the same error and the UI never has to care where it came from.
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

/** Message that is safe to show to a customer. */
export function errorMessage(e: unknown): string {
  return isServiceError(e) ? e.message : "Something went wrong. Please try again.";
}
