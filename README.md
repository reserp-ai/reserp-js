<p align="center">
  <a href="https://reserp.ai">
    <img src="https://reserp.ai/icon-512.png" alt="Reserp Google Search API" width="112" height="112">
  </a>
</p>

# Reserp JavaScript and TypeScript SDK

[![npm version](https://img.shields.io/npm/v/%40reserp%2Fsdk.svg)](https://www.npmjs.com/package/@reserp/sdk)
[![CI](https://github.com/reserp-ai/reserp-js/actions/workflows/ci.yml/badge.svg)](https://github.com/reserp-ai/reserp-js/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

The official JavaScript and TypeScript SDK for [Reserp](https://reserp.ai), a Google Search API for developers and AI agents.

Retrieve structured Google Search results from Node.js through one stable JSON schema. Start for free with no credit card required.

[Website](https://reserp.ai) · [API documentation](https://reserp.ai/docs) · [OpenAPI 3.1](https://reserp.ai/openapi.json) · [Pricing](https://reserp.ai/pricing)

## Features

- Structured Google Search results through a stable, documented API.
- First-class TypeScript types with JavaScript, ESM, and CommonJS support.
- One-based pagination plus support for authoritative pagination URLs.
- Configurable retries, timeouts, and standard `AbortSignal` cancellation.
- Zero runtime dependencies.

## Installation

```bash
npm install @reserp/sdk
```

Node.js 20 or later is required. This package has zero runtime dependencies.

## Quick start

```js
import { Reserp } from "@reserp/sdk";

const apiKey = process.env.RESERP_API_KEY;

if (!apiKey) {
  throw new Error("RESERP_API_KEY is not set");
}

const reserp = new Reserp({
  apiKey,
});

const response = await reserp.search({
  query: "best pizza in dubai",
  gl: "ae",
  hl: "en",
});

for (const result of response.results) {
  console.log(result.text, result.url);
}
```

Create an API key in the [Reserp dashboard](https://reserp.ai/dashboard). Keep API keys on your server; never embed one in browser or mobile code.

## Pagination

`page` is one-based, so you do not need to calculate Google's `start` offsets:

```js
const secondPage = await reserp.search({
  query: "photonic computing",
  page: 2,
});
```

You can also follow the authoritative pagination URL returned by the API:

```js
const first = await reserp.search({ query: "photonic computing" });
const second = await reserp.nextPage(first);
```

Do not derive pagination from `results.length`. A response can contain organic listings, news, carousels, sitelinks, and nested result blocks.

## Google parameters

Use `params` for additional Google parameters such as `tbs` and `tbm`:

```js
const news = await reserp.search({
  query: "semiconductor manufacturing",
  params: {
    tbm: "nws",
    tbs: "qdr:w",
  },
});
```

For complete control, submit a full Google Search URL:

```js
const response = await reserp.searchUrl(
  "https://www.google.com/search?q=semiconductor+manufacturing&gl=us&hl=en&tbs=qdr:w",
);
```

All Google URL parameters pass through unchanged except parameters documented as unsupported by Reserp. The `num` parameter is currently unsupported.

## Errors and retries

API failures throw `ReserpAPIError` with the stable public error code and billing state:

```js
import { ReserpAPIError } from "@reserp/sdk";

try {
  await reserp.search({ query: "photonic computing" });
} catch (error) {
  if (error instanceof ReserpAPIError) {
    console.error(error.status, error.code, error.retryable, error.billed);
  }
}
```

The SDK retries retryable API responses up to two times by default, respecting `Retry-After` for rate limits. It never automatically retries a response whose `billed` field is true. Network failures are not automatically retried because the client cannot know whether the original request reached the API.

Configure retries and per-attempt timeouts globally or per request:

```js
const configuredReserp = new Reserp({
  apiKey,
  maxRetries: 1,
  timeoutMs: 20_000,
});

await configuredReserp.search({
  query: "photonic computing",
  maxRetries: 0,
  timeoutMs: 10_000,
});
```

Standard `AbortSignal` cancellation is also supported.

## API reference

- [Reserp API documentation](https://reserp.ai/docs)
- [OpenAPI 3.1 document](https://reserp.ai/openapi.json)
- [Pricing](https://reserp.ai/pricing)

## License

MIT
