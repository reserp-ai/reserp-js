import type { SearchInput } from "./types.js";

const GOOGLE_SEARCH_ORIGIN = "https://www.google.com";
const RESERVED_PARAMETERS = new Set(["q", "gl", "hl", "start", "num"]);

export function buildGoogleSearchUrl(input: SearchInput): string {
  if (!input || typeof input !== "object") {
    throw new TypeError("Search input must be an object.");
  }

  const query = requireNonEmptyString(input.query, "query");
  const page = input.page ?? 1;

  if (!Number.isSafeInteger(page) || page < 1) {
    throw new RangeError("page must be a positive integer.");
  }

  const url = new URL("/search", GOOGLE_SEARCH_ORIGIN);
  url.searchParams.set("q", query);

  if (input.gl !== undefined) {
    url.searchParams.set("gl", requireNonEmptyString(input.gl, "gl"));
  }

  if (input.hl !== undefined) {
    url.searchParams.set("hl", requireNonEmptyString(input.hl, "hl"));
  }

  if (page > 1) {
    url.searchParams.set("start", String((page - 1) * 10));
  }

  for (const [key, value] of Object.entries(input.params ?? {})) {
    if (value === null || value === undefined) {
      continue;
    }

    if (key.trim() === "") {
      throw new TypeError("Google parameter names cannot be empty.");
    }

    if (RESERVED_PARAMETERS.has(key)) {
      throw new TypeError(
        key === "num"
          ? "The Google num parameter is not supported by Reserp."
          : `Use the top-level ${parameterField(key)} option instead of params.${key}.`,
      );
    }

    if (typeof value === "number" && !Number.isFinite(value)) {
      throw new TypeError(`params.${key} must be a finite number or string.`);
    }

    url.searchParams.set(key, String(value));
  }

  return validateGoogleSearchUrl(url);
}

export function validateGoogleSearchUrl(input: string | URL): string {
  let url: URL;

  try {
    url = new URL(input.toString());
  } catch {
    throw new TypeError("url must be a valid absolute URL.");
  }

  if (
    url.protocol !== "https:" ||
    url.hostname !== "www.google.com" ||
    url.port !== "" ||
    url.pathname !== "/search"
  ) {
    throw new TypeError("url must begin with https://www.google.com/search.");
  }

  if (!url.searchParams.get("q")?.trim()) {
    throw new TypeError("url must contain a non-empty q parameter.");
  }

  if (url.searchParams.has("num")) {
    throw new TypeError("The Google num parameter is not supported by Reserp.");
  }

  const start = url.searchParams.get("start");
  if (start !== null) {
    const numericStart = Number(start);
    if (!/^\d+$/.test(start) || !Number.isSafeInteger(numericStart) || numericStart % 10 !== 0) {
      throw new RangeError("The Google start parameter must be a non-negative multiple of 10.");
    }
  }

  const normalized = url.toString();
  if (normalized.length > 10_000) {
    throw new RangeError("url must be 10,000 characters or fewer.");
  }

  return normalized;
}

function requireNonEmptyString(value: unknown, name: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new TypeError(`${name} must be a non-empty string.`);
  }
  return value;
}

function parameterField(parameter: string): string {
  if (parameter === "q") return "query";
  if (parameter === "start") return "page";
  return parameter;
}
