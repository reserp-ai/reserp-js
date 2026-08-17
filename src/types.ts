export type ReserpErrorCode =
  | "invalid_request"
  | "authentication_failed"
  | "free_allowance_exhausted"
  | "request_not_allowed"
  | "rate_limited"
  | "internal_error"
  | "search_failed"
  | "service_unavailable";

export interface Result {
  text?: string;
  url?: string;
  children?: Result[];
}

export interface Pagination {
  start: number;
  nextStart: number;
  nextUrl: string;
}

export interface SearchResponse {
  ok: true;
  url: string;
  finalUrl: string;
  results: Result[];
  pagination: Pagination;
  billed: boolean;
}

export interface ErrorResponse {
  ok: false;
  error: ReserpErrorCode;
  retryable: boolean;
  billed: boolean;
}

export type GoogleParameterValue = string | number | null | undefined;

export interface SearchInput {
  /** The Google search query. */
  query: string;
  /** Two-letter Google country code, such as `us` or `ae`. */
  gl?: string;
  /** Google interface language, such as `en` or `ja`. */
  hl?: string;
  /** One-based results page. Page 1 omits `start`; page 2 uses `start=10`. */
  page?: number;
  /** Additional Google parameters, such as `tbs` or `tbm`. */
  params?: Readonly<Record<string, GoogleParameterValue>>;
}

export interface RequestOptions {
  /** Abort the request with a standard AbortSignal. */
  signal?: AbortSignal | undefined;
  /** Per-attempt timeout in milliseconds. Use 0 to disable the timeout. */
  timeoutMs?: number | undefined;
  /** Number of retries after the initial request. */
  maxRetries?: number | undefined;
}

export type SearchOptions = SearchInput & RequestOptions;

export interface ReserpOptions {
  apiKey: string;
  /** Override only for testing or an explicitly supported Reserp endpoint. */
  baseUrl?: string;
  /** Default per-attempt timeout in milliseconds. Defaults to 30 seconds. */
  timeoutMs?: number;
  /** Default retry count. Defaults to 2. */
  maxRetries?: number;
  /** Custom Fetch implementation, primarily for testing. */
  fetch?: typeof globalThis.fetch;
}
