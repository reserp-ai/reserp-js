# Reserp for JavaScript and TypeScript

The official JavaScript and TypeScript SDK for the [Reserp Google Search API](https://reserp.ai/docs).

Reserp returns the visible result blocks from Google Search through one stable JSON schema. Every account includes 5,000 free requests each month, with no credit card required.

## Installation

```bash
npm install reserp
```

Node.js 20 or later is required. This package has zero runtime dependencies.

## Quick start

```ts
import { Reserp } from "reserp";

const reserp = new Reserp({
  apiKey: process.env.RESERP_API_KEY!,
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

```ts
const secondPage = await reserp.search({
  query: "photonic computing",
  page: 2,
});
```

You can also follow the authoritative pagination URL returned by the API:

```ts
const first = await reserp.search({ query: "photonic computing" });
const second = await reserp.nextPage(first);
```

Do not derive pagination from `results.length`. A response can contain organic listings, news, carousels, sitelinks, and nested result blocks.

## Google parameters

Use `params` for additional Google parameters such as `tbs` and `tbm`:

```ts
const news = await reserp.search({
  query: "semiconductor manufacturing",
  params: {
    tbm: "nws",
    tbs: "qdr:w",
  },
});
```

For complete control, submit a full Google Search URL:

```ts
const response = await reserp.searchUrl(
  "https://www.google.com/search?q=semiconductor+manufacturing&gl=us&hl=en&tbs=qdr:w",
);
```

All Google URL parameters pass through unchanged except parameters documented as unsupported by Reserp. The `num` parameter is currently unsupported.

## Errors and retries

API failures throw `ReserpAPIError` with the stable public error code and billing state:

```ts
import { ReserpAPIError } from "reserp";

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

```ts
const reserp = new Reserp({
  apiKey: process.env.RESERP_API_KEY!,
  maxRetries: 1,
  timeoutMs: 20_000,
});

await reserp.search({
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
