# Changelog

All notable changes to this project will be documented in this file.

## [0.2.0] - 2026-08-18

- Reduced the SDK to a transparent, single-request wrapper over `POST /v1/serp`.
- Return the native Fetch `Response`, including its status, headers, and exact API payload.
- Pass native Fetch request controls through without adding SDK retry, backoff, or timeout policy.
- Removed URL construction, client-side URL validation, pagination orchestration, response validation, and custom SDK errors.

## [0.1.2] - 2026-08-18

- Synchronized the exported client version and request header with the package version.

## [0.1.1] - 2026-08-18

- Replaced the mutable free-request allowance with evergreen getting-started copy.

## [0.1.0] - 2026-08-17

- Initial JavaScript and TypeScript SDK implementation.
- Typed search responses and API errors.
- One-based pagination and raw Google Search URL support.
- Safe retries, timeouts, and abort signals.

[0.2.0]: https://github.com/reserp-ai/reserp-js/compare/v0.1.2...HEAD
[0.1.2]: https://github.com/reserp-ai/reserp-js/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/reserp-ai/reserp-js/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/reserp-ai/reserp-js/releases/tag/v0.1.0
