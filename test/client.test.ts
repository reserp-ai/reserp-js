import { describe, expect, it, vi } from "vitest";
import {
  Reserp,
  ReserpAbortError,
  ReserpAPIError,
  ReserpTimeoutError,
  VERSION,
} from "../src/index.js";
import type { SearchResponse } from "../src/index.js";

const SUCCESS: SearchResponse = {
  ok: true,
  url: "https://www.google.com/search?q=reserp",
  finalUrl: "https://www.google.com/search?q=reserp",
  results: [{ text: "Reserp", url: "https://reserp.ai" }],
  pagination: {
    start: 0,
    nextStart: 10,
    nextUrl: "https://www.google.com/search?q=reserp&start=10",
  },
  billed: true,
};

function jsonResponse(body: unknown, status = 200, headers?: HeadersInit): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", ...headers },
  });
}

describe("Reserp", () => {
  it("sends the documented API request", async () => {
    const fetch = vi.fn<typeof globalThis.fetch>().mockResolvedValue(jsonResponse(SUCCESS));
    const client = new Reserp({ apiKey: "test_api_key", fetch });

    const response = await client.search({ query: "reserp", gl: "us" });

    expect(response).toEqual(SUCCESS);
    expect(fetch).toHaveBeenCalledOnce();
    const [url, init] = fetch.mock.calls[0]!;
    expect(url).toBe("https://api.reserp.ai/v1/serp");
    expect(init?.method).toBe("POST");
    expect(new Headers(init?.headers).get("authorization")).toBe("Bearer test_api_key");
    expect(new Headers(init?.headers).get("x-reserp-client")).toBe(`reserp-js/${VERSION}`);
    expect(JSON.parse(String(init?.body))).toEqual({
      url: "https://www.google.com/search?q=reserp&gl=us",
    });
  });

  it("uses the API-provided next URL for pagination", async () => {
    const fetch = vi.fn<typeof globalThis.fetch>().mockResolvedValue(jsonResponse(SUCCESS));
    const client = new Reserp({ apiKey: "test_api_key", fetch });

    await client.nextPage(SUCCESS);

    const [, init] = fetch.mock.calls[0]!;
    expect(JSON.parse(String(init?.body))).toEqual({ url: SUCCESS.pagination.nextUrl });
  });

  it("throws a typed API error", async () => {
    const fetch = vi.fn<typeof globalThis.fetch>().mockResolvedValue(
      jsonResponse(
        { ok: false, error: "rate_limited", retryable: true, billed: false },
        429,
        { "retry-after": "15" },
      ),
    );
    const client = new Reserp({ apiKey: "test_api_key", fetch, maxRetries: 0 });

    await expect(client.search({ query: "reserp" })).rejects.toMatchObject({
      name: "ReserpAPIError",
      status: 429,
      code: "rate_limited",
      retryable: true,
      billed: false,
      retryAfterMs: 15_000,
    });
  });

  it("retries retryable errors only when funding was not consumed", async () => {
    const fetch = vi
      .fn<typeof globalThis.fetch>()
      .mockResolvedValueOnce(
        jsonResponse(
          { ok: false, error: "service_unavailable", retryable: true, billed: false },
          503,
          { "retry-after": "0" },
        ),
      )
      .mockResolvedValueOnce(jsonResponse(SUCCESS));
    const client = new Reserp({ apiKey: "test_api_key", fetch, maxRetries: 1 });

    await expect(client.search({ query: "reserp" })).resolves.toEqual(SUCCESS);
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("does not retry an error that was billed", async () => {
    const fetch = vi.fn<typeof globalThis.fetch>().mockResolvedValue(
      jsonResponse(
        { ok: false, error: "service_unavailable", retryable: true, billed: true },
        503,
      ),
    );
    const client = new Reserp({ apiKey: "test_api_key", fetch, maxRetries: 2 });

    await expect(client.search({ query: "reserp" })).rejects.toBeInstanceOf(ReserpAPIError);
    expect(fetch).toHaveBeenCalledOnce();
  });

  it("supports request timeouts", async () => {
    vi.useFakeTimers();
    const fetch = vi.fn<typeof globalThis.fetch>().mockImplementation(
      (_url, init) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")));
        }),
    );
    const client = new Reserp({ apiKey: "test_api_key", fetch, timeoutMs: 10 });
    const request = client.search({ query: "reserp" });
    const rejection = expect(request).rejects.toBeInstanceOf(ReserpTimeoutError);

    await vi.advanceTimersByTimeAsync(10);
    await rejection;
    vi.useRealTimers();
  });

  it("supports caller abort signals", async () => {
    const controller = new AbortController();
    const fetch = vi.fn<typeof globalThis.fetch>().mockImplementation(
      (_url, init) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")));
        }),
    );
    const client = new Reserp({ apiKey: "test_api_key", fetch });
    const request = client.search({ query: "reserp", signal: controller.signal });
    const rejection = expect(request).rejects.toBeInstanceOf(ReserpAbortError);

    controller.abort();
    await rejection;
  });
});
