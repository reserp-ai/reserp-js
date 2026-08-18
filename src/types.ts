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

export interface SearchRequest {
  /** Complete Google Search URL accepted by the public API. */
  url: string;
}

export type APIResponse = SearchResponse | ErrorResponse;

/** Native Fetch options, excluding the method and JSON body owned by this endpoint. */
export type SearchRequestOptions = Omit<RequestInit, "body" | "method">;

/** The native Fetch Response with a typed API JSON body. */
export interface ReserpResponse extends Response {
  clone(): ReserpResponse;
  json(): Promise<APIResponse>;
}

export interface ReserpOptions {
  apiKey: string;
  /** Override the complete API endpoint, primarily for testing. */
  endpoint?: string | URL;
  /** Use a caller-supplied Fetch-compatible transport. */
  fetch?: typeof globalThis.fetch;
}
