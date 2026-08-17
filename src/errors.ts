import type { ErrorResponse, ReserpErrorCode } from "./types.js";

const ERROR_MESSAGES: Record<ReserpErrorCode, string> = {
  invalid_request: "The search request is invalid.",
  authentication_failed: "The Reserp API key is invalid or missing.",
  free_allowance_exhausted: "The monthly Free allowance is exhausted.",
  request_not_allowed: "This account or request is not permitted.",
  rate_limited: "The Reserp API rate limit was reached.",
  internal_error: "The Reserp API encountered an internal error.",
  search_failed: "Google search could not be completed.",
  service_unavailable: "The Reserp API is temporarily unavailable.",
};

export class ReserpError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "ReserpError";
  }
}

export class ReserpAPIError extends ReserpError {
  readonly status: number;
  readonly code: ReserpErrorCode;
  readonly retryable: boolean;
  readonly billed: boolean;
  readonly retryAfterMs?: number;

  constructor(status: number, response: ErrorResponse, retryAfterMs?: number) {
    super(`${ERROR_MESSAGES[response.error]} (HTTP ${status}, ${response.error})`);
    this.name = "ReserpAPIError";
    this.status = status;
    this.code = response.error;
    this.retryable = response.retryable;
    this.billed = response.billed;
    if (retryAfterMs !== undefined) {
      this.retryAfterMs = retryAfterMs;
    }
  }
}

export class ReserpUnexpectedResponseError extends ReserpError {
  readonly status: number;

  constructor(status: number) {
    super(`The Reserp API returned an unexpected response (HTTP ${status}).`);
    this.name = "ReserpUnexpectedResponseError";
    this.status = status;
  }
}

export class ReserpConnectionError extends ReserpError {
  constructor(cause: unknown) {
    super("Could not connect to the Reserp API.", { cause });
    this.name = "ReserpConnectionError";
  }
}

export class ReserpTimeoutError extends ReserpError {
  readonly timeoutMs: number;

  constructor(timeoutMs: number, cause?: unknown) {
    super(`The Reserp API request timed out after ${timeoutMs}ms.`, { cause });
    this.name = "ReserpTimeoutError";
    this.timeoutMs = timeoutMs;
  }
}

export class ReserpAbortError extends ReserpError {
  constructor(cause?: unknown) {
    super("The Reserp API request was aborted.", { cause });
    this.name = "ReserpAbortError";
  }
}
