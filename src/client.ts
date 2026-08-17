import {
  ReserpAbortError,
  ReserpAPIError,
  ReserpConnectionError,
  ReserpTimeoutError,
  ReserpUnexpectedResponseError,
} from "./errors.js";
import type {
  ErrorResponse,
  RequestOptions,
  ReserpErrorCode,
  ReserpOptions,
  SearchOptions,
  SearchResponse,
} from "./types.js";
import { buildGoogleSearchUrl, validateGoogleSearchUrl } from "./url.js";

const DEFAULT_BASE_URL = "https://api.reserp.ai";
const DEFAULT_TIMEOUT_MS = 30_000;
const DEFAULT_MAX_RETRIES = 2;
const ERROR_CODES = new Set<ReserpErrorCode>([
  "invalid_request",
  "authentication_failed",
  "free_allowance_exhausted",
  "request_not_allowed",
  "rate_limited",
  "internal_error",
  "search_failed",
  "service_unavailable",
]);

export const VERSION = "0.1.0";

export class Reserp {
  readonly #apiKey: string;
  readonly #baseUrl: string;
  readonly #timeoutMs: number;
  readonly #maxRetries: number;
  readonly #fetch: typeof globalThis.fetch;

  constructor(options: ReserpOptions) {
    if (!options || typeof options !== "object") {
      throw new TypeError("Reserp options must be an object.");
    }

    if (typeof options.apiKey !== "string" || options.apiKey.trim() === "") {
      throw new TypeError("apiKey must be a non-empty string.");
    }

    const fetchImplementation = options.fetch ?? globalThis.fetch;
    if (typeof fetchImplementation !== "function") {
      throw new TypeError("A Fetch implementation is required.");
    }

    this.#apiKey = options.apiKey.trim();
    this.#baseUrl = normalizeBaseUrl(options.baseUrl ?? DEFAULT_BASE_URL);
    this.#timeoutMs = validateNonNegativeInteger(
      options.timeoutMs ?? DEFAULT_TIMEOUT_MS,
      "timeoutMs",
    );
    this.#maxRetries = validateNonNegativeInteger(
      options.maxRetries ?? DEFAULT_MAX_RETRIES,
      "maxRetries",
    );
    this.#fetch = fetchImplementation;
  }

  /** Search Google using ergonomic query, country, language, and page options. */
  search(options: SearchOptions): Promise<SearchResponse> {
    const { signal, timeoutMs, maxRetries, ...input } = options;
    return this.searchUrl(buildGoogleSearchUrl(input), { signal, timeoutMs, maxRetries });
  }

  /** Search using a complete https://www.google.com/search URL. */
  async searchUrl(url: string | URL, options: RequestOptions = {}): Promise<SearchResponse> {
    const validatedUrl = validateGoogleSearchUrl(url);
    const timeoutMs = validateNonNegativeInteger(options.timeoutMs ?? this.#timeoutMs, "timeoutMs");
    const maxRetries = validateNonNegativeInteger(
      options.maxRetries ?? this.#maxRetries,
      "maxRetries",
    );

    for (let attempt = 0; ; attempt += 1) {
      const requestSignal = createRequestSignal(options.signal, timeoutMs);
      let response: Response;
      let payload: unknown;

      try {
        response = await this.#fetch(`${this.#baseUrl}/v1/serp`, {
          method: "POST",
          headers: {
            accept: "application/json",
            authorization: `Bearer ${this.#apiKey}`,
            "content-type": "application/json",
            "x-reserp-client": `reserp-js/${VERSION}`,
          },
          body: JSON.stringify({ url: validatedUrl }),
          signal: requestSignal.signal,
        });
        payload = await readJson(response);
      } catch (cause) {
        requestSignal.cleanup();
        if (requestSignal.didTimeOut()) {
          throw new ReserpTimeoutError(timeoutMs, cause);
        }
        if (options.signal?.aborted) {
          throw new ReserpAbortError(cause);
        }
        throw new ReserpConnectionError(cause);
      }

      requestSignal.cleanup();

      if (response.ok && isSearchResponse(payload)) {
        return payload;
      }

      if (!isErrorResponse(payload)) {
        throw new ReserpUnexpectedResponseError(response.status);
      }

      const error = new ReserpAPIError(
        response.status,
        payload,
        parseRetryAfter(response.headers.get("retry-after")),
      );

      // Never retry a request that may already have consumed funding.
      if (attempt >= maxRetries || !error.retryable || error.billed) {
        throw error;
      }

      const delayMs = error.retryAfterMs ?? backoffDelay(attempt);
      try {
        await wait(delayMs, options.signal);
      } catch (cause) {
        throw new ReserpAbortError(cause);
      }
    }
  }

  /** Follow the authoritative next URL returned by the API. */
  nextPage(response: SearchResponse, options: RequestOptions = {}): Promise<SearchResponse> {
    return this.searchUrl(response.pagination.nextUrl, options);
  }
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return undefined;
  }
}

function isSearchResponse(value: unknown): value is SearchResponse {
  if (!isRecord(value) || value.ok !== true) return false;
  if (
    typeof value.url !== "string" ||
    typeof value.finalUrl !== "string" ||
    !Array.isArray(value.results) ||
    typeof value.billed !== "boolean" ||
    !isRecord(value.pagination)
  ) {
    return false;
  }

  return (
    Number.isSafeInteger(value.pagination.start) &&
    Number.isSafeInteger(value.pagination.nextStart) &&
    typeof value.pagination.nextUrl === "string"
  );
}

function isErrorResponse(value: unknown): value is ErrorResponse {
  return (
    isRecord(value) &&
    value.ok === false &&
    typeof value.error === "string" &&
    ERROR_CODES.has(value.error as ReserpErrorCode) &&
    typeof value.retryable === "boolean" &&
    typeof value.billed === "boolean"
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeBaseUrl(value: string): string {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new TypeError("baseUrl must be a valid absolute URL.");
  }

  if (url.username || url.password || url.search || url.hash) {
    throw new TypeError("baseUrl cannot contain credentials, a query, or a fragment.");
  }

  return url.toString().replace(/\/$/, "");
}

function validateNonNegativeInteger(value: number, name: string): number {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new RangeError(`${name} must be a non-negative integer.`);
  }
  return value;
}

function parseRetryAfter(value: string | null): number | undefined {
  if (value === null) return undefined;

  const seconds = Number(value);
  if (Number.isFinite(seconds) && seconds >= 0) {
    return Math.ceil(seconds * 1_000);
  }

  const date = Date.parse(value);
  if (Number.isNaN(date)) return undefined;
  return Math.max(0, date - Date.now());
}

function backoffDelay(attempt: number): number {
  const base = Math.min(500 * 2 ** attempt, 30_000);
  return base + Math.floor(Math.random() * 250);
}

function createRequestSignal(externalSignal: AbortSignal | undefined, timeoutMs: number) {
  const controller = new AbortController();
  let timedOut = false;
  let timeout: ReturnType<typeof setTimeout> | undefined;

  const abortFromExternal = () => controller.abort(externalSignal?.reason);

  if (externalSignal?.aborted) {
    abortFromExternal();
  } else {
    externalSignal?.addEventListener("abort", abortFromExternal, { once: true });
  }

  if (timeoutMs > 0) {
    timeout = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, timeoutMs);
  }

  return {
    signal: controller.signal,
    didTimeOut: () => timedOut,
    cleanup: () => {
      if (timeout !== undefined) clearTimeout(timeout);
      externalSignal?.removeEventListener("abort", abortFromExternal);
    },
  };
}

function wait(milliseconds: number, signal?: AbortSignal): Promise<void> {
  if (signal?.aborted) {
    return Promise.reject(signal.reason);
  }

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      signal?.removeEventListener("abort", abort);
      resolve();
    }, milliseconds);

    const abort = () => {
      clearTimeout(timeout);
      reject(signal?.reason);
    };

    signal?.addEventListener("abort", abort, { once: true });
  });
}
