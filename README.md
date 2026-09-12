<p align="center">
  <a href="https://reserp.ai">
    <img src="https://reserp.ai/icon-512.png" alt="Reserp Google Search API" width="112" height="112">
  </a>
</p>

# Reserp JavaScript and TypeScript SDK

[![npm version](https://img.shields.io/npm/v/%40reserp%2Fsdk.svg)](https://www.npmjs.com/package/@reserp/sdk)
[![CI](https://github.com/reserp-ai/reserp-js/actions/workflows/ci.yml/badge.svg)](https://github.com/reserp-ai/reserp-js/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

The official minimal JavaScript and TypeScript client for [Reserp v2](https://reserp.ai/docs), a Google Search API with two stable response shapes:

- `search()` calls [`POST /v2/serp/search`](https://reserp.ai/docs/search) for flat, page-ordered, deduplicated results in `results[]`.
- `structured()` calls [`POST /v2/serp/structured`](https://reserp.ai/docs/structured) for best-effort extraction of typed, page-ordered SERP blocks in `blocks[]`.

[Website](https://reserp.ai) · [API documentation](https://reserp.ai/docs) · [OpenAPI 3.1](https://reserp.ai/openapi.json) · [Postman](https://www.postman.com/reserp-ai/reserp-google-search-api) · [Pricing](https://reserp.ai/pricing)

## Design

Each SDK call makes exactly one API request and returns the native Fetch `Response` unchanged. The package adds no retry, timeout, URL-building, validation, pagination, transformation, cache, batch, queue, or concurrency policy. It has zero runtime dependencies and supports ESM and CommonJS.

## Installation

```bash
npm install @reserp/sdk
```

Node.js 20 or later is required.

## Search results

```js
import { Reserp } from "@reserp/sdk";

const reserp = new Reserp({ apiKey: process.env.RESERP_API_KEY });
const response = await reserp.search({
  url: "https://www.google.com/search?q=best+pizza+in+dubai&gl=ae&hl=en",
});
const data = await response.json();

if (data.ok) {
  for (const item of data.results) console.log(item.text, item.url);
} else {
  console.error(response.status, data.error, data.retryable, data.billed);
}
```

The deprecated `urls()` method is a compatibility alias for `search()` and uses the stable Search endpoint.

## Structured results

```js
const response = await reserp.structured({
  url: "https://www.google.com/search?q=wireless+earbuds&gl=us&hl=en&tbm=shop",
});
const data = await response.json();

if (data.ok) {
  for (const block of data.blocks) {
    console.log(block.position, block.type, block.title);
  }

  for (const block of data.blocks.filter((block) => block.type === "organic")) {
    for (const item of block.items) {
      console.log(item.position, item.title, item.url);
    }
  }
}
```

The generated TypeScript declarations cover every block and item family in the canonical OpenAPI schema. Narrow on `block.type` to access type-specific fields.

## Native transport control

The second argument is passed to Fetch after the SDK supplies the method, authorization header, content type, and JSON body:

```js
const response = await reserp.search(
  { url: "https://www.google.com/search?q=semiconductors&gl=us&hl=en&tbs=qdr:w" },
  {
    signal: AbortSignal.timeout(20_000),
    redirect: "manual",
    headers: { "x-request-id": "your-job-id" },
  },
);
```

You can inject a Fetch-compatible transport with the constructor's `fetch` option. Transport failures remain native Fetch errors. HTTP error responses remain native responses; inspect the status, headers, and JSON body.

## Direct HTTP equivalents

```bash
curl https://api.reserp.ai/v2/serp/search \
  --request POST \
  --header "Authorization: Bearer $RESERP_API_KEY" \
  --header "Content-Type: application/json" \
  --data '{"url":"https://www.google.com/search?q=photonic+computing&gl=us&hl=en"}'

curl https://api.reserp.ai/v2/serp/structured \
  --request POST \
  --header "Authorization: Bearer $RESERP_API_KEY" \
  --header "Content-Type: application/json" \
  --data '{"url":"https://www.google.com/search?q=photonic+computing&gl=us&hl=en"}'
```

## Pagination and errors

Every successful response contains `pagination.next_url`. Send that URL back as the next request body's `url`; its presence does not guarantee that another page contains results. Do not calculate pagination from `results.length`, `blocks.length`, or any block's item count.

Error bodies expose `error`, `message`, `doc_url`, `retryable`, `billed`, and `billing_source`. Use `message` and `doc_url` for diagnostics; message wording may change, so branch on the stable `error` code and `retryable` flag. If your application retries, use `retryable` as the authority and honor `Retry-After` on HTTP 429. The SDK never retries automatically.

## Migrating

From SDK 0.3, replace `urls()` with `search()`, `/v2/serp/urls` with `/v2/serp/search`, and `data.urls` with `data.results`. `urls()` remains as a deprecated method alias, but its response now follows the stable Search contract.

If you used the structured beta, replace `schema_version`, grouped `results`, `features`, `page_position`, and `metadata` with the stable, page-ordered `blocks[]` model. Each block has `type` and `position`; block-specific entries live in `items[]`.

When migrating directly from v1, other notable renames are `url` → `request.url`, `finalUrl` → `page.url`, `pagination.nextUrl` → `pagination.next_url`, and `billingSource` → `billing_source`.

## License

MIT
