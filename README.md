<p align="center">
  <a href="https://reserp.ai">
    <img src="https://reserp.ai/icon-512.png" alt="Reserp Google Search API" width="112" height="112">
  </a>
</p>

# Reserp JavaScript and TypeScript SDK

[![npm version](https://img.shields.io/npm/v/%40reserp%2Fsdk.svg)](https://www.npmjs.com/package/@reserp/sdk)
[![CI](https://github.com/reserp-ai/reserp-js/actions/workflows/ci.yml/badge.svg)](https://github.com/reserp-ai/reserp-js/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

**Google Search data, structured for scale.**

The official minimal JavaScript and TypeScript client for [Reserp](https://reserp.ai), a high-yield Google Search API and SERP API for high-volume, recurring production search workloads.

Reserp returns visible Google Search result blocks as structured JSON, including organic listings, news, carousels, sitelinks, pagination, and nested results in Google's response order. Start for free with no credit card required.

[Website](https://reserp.ai) · [API documentation](https://reserp.ai/docs) · [OpenAPI 3.1](https://reserp.ai/openapi.json) · [Postman](https://www.postman.com/reserp-ai/reserp-google-search-api/overview) · [Pricing](https://reserp.ai/pricing)

## Design

This package is a transparent wrapper over `POST /v1/serp`:

- One SDK call sends exactly one API request.
- The request body is the public API request body.
- The return value is the native Fetch `Response` with a typed JSON body.
- Status codes, response headers, success payloads, and error payloads remain unchanged.
- Native Fetch options such as `signal`, `redirect`, and custom headers pass through.
- The package has zero runtime dependencies and supports ESM and CommonJS.

The client does not retry, back off, impose timeouts, build or validate Google URLs, follow pagination, transform responses, cache data, batch work, or control concurrency. Those decisions remain with the caller.

## Installation

```bash
npm install @reserp/sdk
```

Node.js 20 or later is required.

## Quick start

```js
import { Reserp } from "@reserp/sdk";

const apiKey = process.env.RESERP_API_KEY;

if (!apiKey) {
  throw new Error("RESERP_API_KEY is not set");
}

const reserp = new Reserp({ apiKey });

const response = await reserp.search({
  url: "https://www.google.com/search?q=best+pizza+in+dubai&gl=ae&hl=en",
});

const data = await response.json();

if (!data.ok) {
  console.error(response.status, data.error, data.retryable, data.billed);
} else {
  for (const result of data.results) {
    console.log(result.text, result.url);
  }
}
```

Create an API key in the [Reserp dashboard](https://reserp.ai/dashboard). Keep API keys on your server; never embed one in browser or mobile code.

## Production workloads at scale

For bulk Google Search, recurring SERP collection, SEO monitoring, market intelligence, competitive research, and other business-critical data pipelines, place the API behind infrastructure that owns durability and throughput:

```text
producer -> durable queue -> workers with controlled concurrency -> Reserp API
```

Use Cloud Tasks, SQS, BullMQ, Celery, or an equivalent durable queue. Let one layer own retries and backoff, bound worker concurrency, respect `Retry-After`, persist job state and results, and design for possible duplicate queue delivery. These practices are identical whether a worker uses this transparent client or direct HTTP.

## Native transport control

The second argument is passed to Fetch after the SDK supplies the method, authorization header, content type, and JSON body. Use native platform controls directly:

```js
const response = await reserp.search(
  {
    url: "https://www.google.com/search?q=semiconductor+manufacturing&gl=us&hl=en&tbs=qdr:w",
  },
  {
    signal: AbortSignal.timeout(20_000),
    redirect: "manual",
    headers: {
      "x-request-id": "your-job-id",
    },
  },
);
```

You can also inject any Fetch-compatible transport:

```js
const reserp = new Reserp({
  apiKey,
  fetch: yourFetchImplementation,
});
```

Transport failures and cancellation reject with the native Fetch error. HTTP error responses do not become SDK exceptions; inspect the native status, headers, and API JSON body.

## Direct HTTP equivalent

The SDK call is equivalent to this direct API request:

```bash
curl https://api.reserp.ai/v1/serp \
  --request POST \
  --header "Authorization: Bearer $RESERP_API_KEY" \
  --header "Content-Type: application/json" \
  --data '{"url":"https://www.google.com/search?q=photonic+computing&gl=us&hl=en"}'
```

Use either interface according to your application. Both expose the same Google Search API contract and leave workload behavior under your control.

## Results and pagination

The API preserves visible result blocks and their order rather than forcing every Google SERP feature into a flat organic-results model. A successful response can contain organic listings, news, carousels, sitelinks, and nested `children`.

Follow the API-provided `pagination.nextUrl` for the next page instead of deriving pagination from `results.length`:

```js
if (data.ok) {
  const nextResponse = await reserp.search({
    url: data.pagination.nextUrl,
  });
  const nextPage = await nextResponse.json();
}
```

Standard Google Search parameters such as `q`, `gl`, `hl`, `tbm`, and `tbs` belong in the submitted Google URL. See the [API documentation](https://reserp.ai/docs) for the authoritative request contract.

## Errors and billing signals

API errors use stable JSON fields:

```json
{
  "ok": false,
  "error": "rate_limited",
  "retryable": true,
  "billed": false
}
```

The API response is authoritative. Automatically retry only when `retryable` is `true` and `billed` is `false`, respect `Retry-After` when present, and avoid blindly retrying an ambiguous transport failure whose billing outcome is unknown. The SDK does not make those decisions.

## API resources

- [Google Search API documentation](https://reserp.ai/docs)
- [OpenAPI 3.1 document](https://reserp.ai/openapi.json)
- [Postman workspace](https://www.postman.com/reserp-ai/reserp-google-search-api/overview)
- [Python client on GitHub](https://github.com/reserp-ai/reserp-python)
- [Python package on PyPI](https://pypi.org/project/reserp/)
- [Plans and pricing](https://reserp.ai/pricing)

## License

MIT
