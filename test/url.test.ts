import { describe, expect, it } from "vitest";
import { buildGoogleSearchUrl, validateGoogleSearchUrl } from "../src/index.js";

describe("buildGoogleSearchUrl", () => {
  it("builds a first-page URL without start", () => {
    const url = new URL(
      buildGoogleSearchUrl({
        query: "best pizza in dubai",
        gl: "ae",
        hl: "en",
      }),
    );

    expect(url.origin).toBe("https://www.google.com");
    expect(url.pathname).toBe("/search");
    expect(url.searchParams.get("q")).toBe("best pizza in dubai");
    expect(url.searchParams.get("gl")).toBe("ae");
    expect(url.searchParams.get("hl")).toBe("en");
    expect(url.searchParams.has("start")).toBe(false);
  });

  it("converts a one-based page into Google's start offset", () => {
    const url = new URL(buildGoogleSearchUrl({ query: "reserp", page: 3 }));
    expect(url.searchParams.get("start")).toBe("20");
  });

  it("passes additional Google parameters", () => {
    const url = new URL(
      buildGoogleSearchUrl({
        query: "reserp",
        params: { tbs: "qdr:w", tbm: "nws", ignored: undefined },
      }),
    );
    expect(url.searchParams.get("tbs")).toBe("qdr:w");
    expect(url.searchParams.get("tbm")).toBe("nws");
    expect(url.searchParams.has("ignored")).toBe(false);
  });

  it.each([0, -1, 1.5])("rejects invalid page %s", (page) => {
    expect(() => buildGoogleSearchUrl({ query: "reserp", page })).toThrow(
      "page must be a positive integer",
    );
  });

  it("rejects reserved and unsupported params", () => {
    expect(() => buildGoogleSearchUrl({ query: "reserp", params: { start: 10 } })).toThrow(
      "top-level page",
    );
    expect(() => buildGoogleSearchUrl({ query: "reserp", params: { num: 100 } })).toThrow(
      "num parameter is not supported",
    );
  });
});
describe("validateGoogleSearchUrl", () => {
  it("accepts a complete supported Google search URL", () => {
    expect(
      validateGoogleSearchUrl("https://www.google.com/search?q=reserp&gl=us&start=10"),
    ).toBe("https://www.google.com/search?q=reserp&gl=us&start=10");
  });

  it.each([
    "http://www.google.com/search?q=reserp",
    "https://google.com/search?q=reserp",
    "https://www.google.com/images?q=reserp",
    "https://example.com/search?q=reserp",
  ])("rejects unsupported URL %s", (url) => {
    expect(() => validateGoogleSearchUrl(url)).toThrow("https://www.google.com/search");
  });

  it("rejects missing queries and invalid offsets", () => {
    expect(() => validateGoogleSearchUrl("https://www.google.com/search?gl=us")).toThrow(
      "non-empty q",
    );
    expect(() => validateGoogleSearchUrl("https://www.google.com/search?q=x&start=11")).toThrow(
      "multiple of 10",
    );
  });
});
