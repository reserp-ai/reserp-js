<p align="center">
  <a href="https://reserp.ai">
    <img src="https://reserp.ai/icon-512.png" alt="Reserp Google Search API" width="112" height="112">
  </a>
</p>

# Reserp JavaScript and TypeScript SDK

[![npm version](https://img.shields.io/npm/v/%40reserp%2Fsdk.svg)](https://www.npmjs.com/package/@reserp/sdk)
[![CI](https://github.com/reserp-ai/reserp-js/actions/workflows/ci.yml/badge.svg)](https://github.com/reserp-ai/reserp-js/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

The official minimal JavaScript and TypeScript client for [Reserp v2](https://reserp.ai/docs), a Google Search API with two response shapes:

- `urls()` / `search()` calls [`POST /v2/serp/urls`](https://reserp.ai/docs/urls) for a flat, page-ordered, deduplicated URL-and-text index.
- `structured()` calls [`POST /v2/serp/structured`](https://reserp.ai/docs/structured) for typed result families, SERP features, and explicit positions.

[Website](https://reserp.ai) · [API documentation](https://reserp.ai/docs) · [OpenAPI 3.1](https://reserp.ai/openapi.json) · [Postman](https://www.postman.com/reserp-ai/reserp-google-search-api) · [Pricing](https://reserp.ai/pricing)

## Design

Each SDK call makes exactly one API request and returns the native Fetch `Response` unchanged. The package adds no retry, timeout, URL-building, validation, pagination, transformation, cache, batch, queue, or concurrency policy. It has zero runtime dependencies and supports ESM and CommonJS.

## Installation

```bash
npm install @reserp/sdk
```

Node.js 20 or later is required.

## URL index

```js
import { Reserp } from "@reserp/sdk";

const reserp = new Reserp({ apiKey: process.env.RESERP_API_KEY });
const response = await reserp.urls({
  url: "https://www.google.com/search?q=best+pizza+in+dubai&gl=ae&hl=en",
});
const data = await response.json();

if (data.ok) {
  for (const item of data.urls) console.log(item.text, item.url);
} else {
  console.error(response.status, data.error, data.retryable, data.billed);
}
```

`search()` is an alias for `urls()` and also uses the v2 URL-index endpoint.

## Structured results

```js
const response = await reserp.structured({
  url: "https://www.google.com/search?q=wireless+earbuds&gl=us&hl=en&tbm=shop",
});
const data = await response.json();

if (data.ok) {
  for (const result of data.results.organic) {
    console.log(result.position, result.title, result.url);
  }
  for (const feature of data.features) {
    console.log(feature.page_position, feature.type);
  }
}
```

## Native transport control

The second argument is passed to Fetch after the SDK supplies the method, authorization header, content type, and JSON body:

```js
const response = await reserp.urls(
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
curl https://api.reserp.ai/v2/serp/urls \
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

Every successful response contains `pagination.next_url`. Send that URL back as the next request body's `url`; its presence does not guarantee that another page contains results. Do not calculate pagination from `urls.length` or a structured result-family length.

Error bodies expose `error`, `retryable`, `billed`, and `billing_source`. If your application retries, use `retryable` as the authority and honor `Retry-After` on HTTP 429. The SDK never retries automatically.

## Migrating from v1

For URL-and-text workflows, replace the v1 recursive `results[]` tree with v2 `urls[]`. Other notable renames are `url` → `request.url`, `finalUrl` → `page.url`, `pagination.nextUrl` → `pagination.next_url`, and `billingSource` → `billing_source`. Ranking and SERP-analysis workflows should use `structured()` and the appropriate typed result family.

## License

MIT
