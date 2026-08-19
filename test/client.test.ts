import { describe, expect, it, vi } from "vitest";
import { Reserp } from "../src/index.js";
import type { SearchResponse } from "../src/index.js";

const SUCCESS: SearchResponse = {
  ok: true,
  url: "https://www.google.com/search?q=reserp",
  finalUrl: "https://www.google.com/search?q=reserp",
  results: [{ url: "https://reserp.ai" }],
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
  it("sends the exact API body and returns the native response", async () => {
    const nativeResponse = jsonResponse(SUCCESS);
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
    await expect(response.json()).resolves.toEqual(SUCCESS);
    expect(fetch).toHaveBeenCalledOnce();
    const [url, init] = fetch.mock.calls[0]!;
    expect(url).toBe("https://api.reserp.ai/v1/serp");
    expect(init?.method).toBe("POST");
    expect(new Headers(init?.headers).get("authorization")).toBe("Bearer test_api_key");
    expect(new Headers(init?.headers).get("x-request-id")).toBe("job-123");
    expect(init?.redirect).toBe("manual");
    expect(init?.signal).toBe(controller.signal);
    expect(JSON.parse(String(init?.body))).toEqual(request);
  });

  it("returns API errors unchanged and never retries", async () => {
    const fetch = vi.fn<typeof globalThis.fetch>().mockResolvedValue(
      jsonResponse(
        { ok: false, error: "rate_limited", retryable: true, billed: false },
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
    });
    expect(fetch).toHaveBeenCalledOnce();
  });

  it("preserves retryable errors when billing already settled", async () => {
    const fetch = vi.fn<typeof globalThis.fetch>().mockResolvedValue(
      jsonResponse(
        { ok: false, error: "search_failed", retryable: true, billed: true },
        502,
      ),
    );
    const client = new Reserp({ apiKey: "test_api_key", fetch });

    const response = await client.search({
      url: "https://www.google.com/search?q=reserp",
    });

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: "search_failed",
      retryable: true,
      billed: true,
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
