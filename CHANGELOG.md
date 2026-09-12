# Changelog

All notable changes to this project will be documented in this file.

## [0.4.1] - 2026-09-12

- Add the documented `message` and `doc_url` fields to the error response type.
- Explain error diagnostics and best-effort structured extraction in the README.

## [0.4.0] - 2026-09-09

- Adopt the stable `POST /v2/serp/search` contract and its `results[]` response.
- Adopt the stable structured `blocks[]` model generated from the canonical OpenAPI schema.
- Make `search()` the primary flat-results method and retain `urls()` as a deprecated compatibility alias.
- Remove beta-only response fields from the public types and migration examples.

## [0.3.0] - 2026-09-07

- Make the v2 URL index the default for `urls()` and its `search()` alias.
- Add `structured()` for typed result families, SERP features, and explicit positions.
- Replace the v1 response types with the complete public v2 URL-index, structured-result, metadata, pagination, billing, and error contracts.
- Document the v1-to-v2 field migration while preserving the native one-request Fetch transport.

## [0.2.2] - 2026-08-19

- Documented `Result.text` as optional and non-empty when present, matching the canonical API documentation and OpenAPI schema.
- Clarified that `retryable` alone controls retry eligibility; `billed` reports settlement and does not override it.

## [0.2.1] - 2026-08-18

- Replaced Postman API Network workspace links with the formally published Reserp API documentation.

## [0.2.0] - 2026-08-18

- Reduced the SDK to a transparent, single-request wrapper over `POST /v1/serp`.
- Return the native Fetch `Response`, including its status, headers, and exact API payload.
- Pass native Fetch request controls through without adding SDK retry, backoff, or timeout policy.
- Removed URL construction, client-side URL validation, pagination orchestration, response validation, and custom SDK errors.
- Documented direct `start` offsets for asynchronous pagination and `nextUrl` as a sequential convenience.

## [0.1.2] - 2026-08-18

- Synchronized the exported client version and request header with the package version.

## [0.1.1] - 2026-08-18

- Replaced the mutable free-request allowance with evergreen getting-started copy.

## [0.1.0] - 2026-08-17

- Initial JavaScript and TypeScript SDK implementation.
- Typed search responses and API errors.
- One-based pagination and raw Google Search URL support.
- Safe retries, timeouts, and abort signals.

[0.4.0]: https://github.com/reserp-ai/reserp-js/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/reserp-ai/reserp-js/compare/v0.2.2...v0.3.0
[0.2.2]: https://github.com/reserp-ai/reserp-js/compare/v0.2.1...v0.2.2
[0.2.1]: https://github.com/reserp-ai/reserp-js/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/reserp-ai/reserp-js/compare/v0.1.2...v0.2.0
[0.1.2]: https://github.com/reserp-ai/reserp-js/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/reserp-ai/reserp-js/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/reserp-ai/reserp-js/releases/tag/v0.1.0
