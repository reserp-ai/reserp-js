import type {
  ReserpOptions,
  SearchReserpResponse,
  StructuredReserpResponse,
  SearchRequest,
  SearchRequestOptions,
} from "./types.js";

const DEFAULT_SEARCH_ENDPOINT = "https://api.reserp.ai/v2/serp/search";
const DEFAULT_STRUCTURED_ENDPOINT = "https://api.reserp.ai/v2/serp/structured";

export class Reserp {
  readonly #apiKey: string;
  readonly #searchEndpoint: string | URL;
  readonly #structuredEndpoint: string | URL;
  readonly #fetch: typeof globalThis.fetch;

  constructor(options: ReserpOptions) {
    this.#apiKey = options.apiKey;
    this.#searchEndpoint =
      options.searchEndpoint ??
      options.urlIndexEndpoint ??
      options.endpoint ??
      DEFAULT_SEARCH_ENDPOINT;
    this.#structuredEndpoint =
      options.structuredEndpoint ?? DEFAULT_STRUCTURED_ENDPOINT;
    this.#fetch = options.fetch ?? globalThis.fetch;
  }

  /** Send one request and return the v2 Search response unchanged. */
  search(
    request: SearchRequest,
    options: SearchRequestOptions = {},
  ): Promise<SearchReserpResponse> {
    return this.#request(this.#searchEndpoint, request, options) as Promise<SearchReserpResponse>;
  }

  /** Send one request and return the v2 structured response unchanged. */
  structured(
    request: SearchRequest,
    options: SearchRequestOptions = {},
  ): Promise<StructuredReserpResponse> {
    return this.#request(this.#structuredEndpoint, request, options) as Promise<StructuredReserpResponse>;
  }

  /** @deprecated Use search(). */
  urls(
    request: SearchRequest,
    options: SearchRequestOptions = {},
  ): Promise<SearchReserpResponse> {
    return this.search(request, options);
  }

  #request(
    endpoint: string | URL,
    request: SearchRequest,
    options: SearchRequestOptions,
  ): Promise<Response> {
    const headers = new Headers(options.headers);
    if (!headers.has("accept")) headers.set("accept", "application/json");
    headers.set("authorization", `Bearer ${this.#apiKey}`);
    headers.set("content-type", "application/json");

    return this.#fetch(endpoint, {
      ...options,
      method: "POST",
      headers,
      body: JSON.stringify(request),
    });
  }
}
