import { describe, expect, it, vi } from "vitest";
import { Reserp } from "../src/index.js";
import type { SearchResponse, StructuredResponse } from "../src/index.js";

const SEARCH_SUCCESS: SearchResponse = {
  ok: true,
  request: { url: "https://www.google.com/search?q=reserp" },
  page: { url: "https://www.google.com/search?q=reserp&sei=test" },
  results: [{ url: "https://reserp.ai", text: "Reserp" }],
  pagination: { next_url: "https://www.google.com/search?q=reserp&start=10" },
  billed: true,
  billing_source: "prepaid",
};

const STRUCTURED_SUCCESS: StructuredResponse = {
  ok: true,
  request: { url: "https://www.google.com/search?q=reserp" },
  page: {
    url: "https://www.google.com/search?q=reserp&sei=test",
    query: "reserp",
    title: "reserp - Google Search",
    surface: "web",
    state: "results",
    overlays: [],
    spelling: null,
  },
  blocks: [
    {
      type: "organic",
      position: 1,
      title: "Search results",
      url: null,
      domain: null,
      text: "",
      links: [],
      items: [
        {
          position: 1,
          title: "Reserp",
          url: "https://reserp.ai",
          domain: "reserp.ai",
          displayed_url: null,
          source: null,
          date: null,
          snippet: "Google Search API",
          highlights: [],
          rating: null,
          review_count: null,
          extensions: [],
          sitelinks: [],
        },
      ],
      facts: [],
    },
  ],
  pagination: { next_url: "https://www.google.com/search?q=reserp&start=10" },
  billed: true,
  billing_source: "prepaid",
};

function jsonResponse(body: unknown, status = 200, headers?: HeadersInit): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", ...headers },
  });
}

describe("Reserp", () => {
  it("sends one v2 Search request and returns the native response", async () => {
    const nativeResponse = jsonResponse(SEARCH_SUCCESS);
    const fetch = vi.fn<typeof globalThis.fetch>().mockResolvedValue(nativeResponse);
    const client = new Reserp({ apiKey: "test_api_key", fetch });
    const controller = new AbortController();
    const request = { url: "not-validated-by-the-sdk" };

    const response = await client.search(request, {
      headers: { authorization: "Bearer ignored", "x-request-id": "job-123" },
      redirect: "manual",
      signal: controller.signal,
    });

    expect(response).toBe(nativeResponse);
    expect(response.bodyUsed).toBe(false);
    await expect(response.json()).resolves.toEqual(SEARCH_SUCCESS);
    expect(fetch).toHaveBeenCalledOnce();
    const [url, init] = fetch.mock.calls[0]!;
    expect(url).toBe("https://api.reserp.ai/v2/serp/search");
    expect(init?.method).toBe("POST");
    expect(new Headers(init?.headers).get("authorization")).toBe("Bearer test_api_key");
    expect(new Headers(init?.headers).get("x-request-id")).toBe("job-123");
    expect(init?.redirect).toBe("manual");
    expect(init?.signal).toBe(controller.signal);
    expect(JSON.parse(String(init?.body))).toEqual(request);
  });

  it("keeps urls() as a deprecated Search alias", async () => {
    const fetch = vi
      .fn<typeof globalThis.fetch>()
      .mockResolvedValue(jsonResponse(SEARCH_SUCCESS));
    const client = new Reserp({ apiKey: "test_api_key", fetch });

    await client.urls({ url: "https://www.google.com/search?q=reserp" });

    expect(fetch).toHaveBeenCalledOnce();
    expect(fetch.mock.calls[0]?.[0]).toBe("https://api.reserp.ai/v2/serp/search");
  });

  it("sends one v2 structured request and returns the native response", async () => {
    const nativeResponse = jsonResponse(STRUCTURED_SUCCESS);
    const fetch = vi.fn<typeof globalThis.fetch>().mockResolvedValue(nativeResponse);
    const client = new Reserp({ apiKey: "test_api_key", fetch });

    const response = await client.structured({
      url: "https://www.google.com/search?q=reserp",
    });

    expect(response).toBe(nativeResponse);
    await expect(response.json()).resolves.toEqual(STRUCTURED_SUCCESS);
    expect(fetch).toHaveBeenCalledOnce();
    expect(fetch.mock.calls[0]?.[0]).toBe(
      "https://api.reserp.ai/v2/serp/structured",
    );
  });

  it("returns API errors unchanged and never retries", async () => {
    const fetch = vi.fn<typeof globalThis.fetch>().mockResolvedValue(
      jsonResponse(
        {
          ok: false,
          error: "rate_limited",
          retryable: true,
          billed: false,
          billing_source: null,
        },
        429,
        { "retry-after": "15" },
      ),
    );
    const client = new Reserp({ apiKey: "test_api_key", fetch });

    const response = await client.search({
      url: "https://www.google.com/search?q=reserp",
    });

    expect(response.status).toBe(429);
    expect(response.headers.get("retry-after")).toBe("15");
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: "rate_limited",
      retryable: true,
      billed: false,
      billing_source: null,
    });
    expect(fetch).toHaveBeenCalledOnce();
  });

  it("passes transport failures through unchanged", async () => {
    const failure = new TypeError("network unavailable");
    const fetch = vi.fn<typeof globalThis.fetch>().mockRejectedValue(failure);
    const client = new Reserp({ apiKey: "test_api_key", fetch });

    await expect(
      client.search({ url: "https://www.google.com/search?q=reserp" }),
    ).rejects.toBe(failure);
    expect(fetch).toHaveBeenCalledOnce();
  });
});
