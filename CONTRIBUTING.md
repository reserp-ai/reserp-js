# Contributing

Thank you for helping improve the Reserp JavaScript SDK.

## Development

Node.js 20 or later is required.

```bash
npm ci
npm run check
```

Changes should include tests for new behavior. Keep the SDK dependency-free at runtime unless a dependency provides a clear, reviewed benefit.

Keep the client transparent. It should send one documented API request and return the native transport response without retries, backoff, timeout policy, batching, concurrency control, URL validation, response transformation, or custom error mapping. Workload orchestration belongs to the caller.

Never commit API keys, access tokens, customer search URLs, or production response data. Tests and examples must use synthetic credentials and public, non-sensitive queries.

## Pull requests

Keep pull requests focused and explain any user-visible behavior change. All lint, type, test, and build checks must pass.
