import type {
  ReserpOptions,
  ReserpResponse,
  SearchRequest,
  SearchRequestOptions,
} from "./types.js";

const DEFAULT_ENDPOINT = "https://api.reserp.ai/v1/serp";

export class Reserp {
  readonly #apiKey: string;
  readonly #endpoint: string | URL;
  readonly #fetch: typeof globalThis.fetch;

  constructor(options: ReserpOptions) {
    this.#apiKey = options.apiKey;
    this.#endpoint = options.endpoint ?? DEFAULT_ENDPOINT;
    this.#fetch = options.fetch ?? globalThis.fetch;
  }

  /** Send exactly one request to the Reserp Search API. */
  search(
    request: SearchRequest,
    options: SearchRequestOptions = {},
  ): Promise<ReserpResponse> {
    const headers = new Headers(options.headers);
    if (!headers.has("accept")) headers.set("accept", "application/json");
    headers.set("authorization", `Bearer ${this.#apiKey}`);
    headers.set("content-type", "application/json");

    return this.#fetch(this.#endpoint, {
      ...options,
      method: "POST",
      headers,
      body: JSON.stringify(request),
    }) as Promise<ReserpResponse>;
  }
}
