import type {
  ReserpOptions,
  StructuredReserpResponse,
  SearchRequest,
  SearchRequestOptions,
  UrlIndexReserpResponse,
} from "./types.js";

const DEFAULT_URL_INDEX_ENDPOINT = "https://api.reserp.ai/v2/serp/urls";
const DEFAULT_STRUCTURED_ENDPOINT = "https://api.reserp.ai/v2/serp/structured";

export class Reserp {
  readonly #apiKey: string;
  readonly #urlIndexEndpoint: string | URL;
  readonly #structuredEndpoint: string | URL;
  readonly #fetch: typeof globalThis.fetch;

  constructor(options: ReserpOptions) {
    this.#apiKey = options.apiKey;
    this.#urlIndexEndpoint =
      options.urlIndexEndpoint ?? options.endpoint ?? DEFAULT_URL_INDEX_ENDPOINT;
    this.#structuredEndpoint =
      options.structuredEndpoint ?? DEFAULT_STRUCTURED_ENDPOINT;
    this.#fetch = options.fetch ?? globalThis.fetch;
  }

  /** Send one request and return the v2 URL-index response unchanged. */
  urls(
    request: SearchRequest,
    options: SearchRequestOptions = {},
  ): Promise<UrlIndexReserpResponse> {
    return this.#request(this.#urlIndexEndpoint, request, options) as Promise<UrlIndexReserpResponse>;
  }

  /** Send one request and return the v2 structured response unchanged. */
  structured(
    request: SearchRequest,
    options: SearchRequestOptions = {},
  ): Promise<StructuredReserpResponse> {
    return this.#request(this.#structuredEndpoint, request, options) as Promise<StructuredReserpResponse>;
  }

  /** Alias for urls(), retained as the default search workflow. */
  search(
    request: SearchRequest,
    options: SearchRequestOptions = {},
  ): Promise<UrlIndexReserpResponse> {
    return this.urls(request, options);
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
