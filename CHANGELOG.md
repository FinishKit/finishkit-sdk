# Changelog

All notable changes to `@finishkit/sdk` will be documented here.
This project adheres to [Semantic Versioning](https://semver.org/).

## [0.1.0] - 2026-03-04

### Added
- Initial release
- `FinishKit` client class with `.projects` and `.runs` namespaces
- `scan()` convenience method - full scan lifecycle in one call
- `projects.list()`, `projects.get()` methods
- `runs.create()`, `runs.get()`, `runs.outcomes()`, `runs.events()`, `runs.cancel()` methods
- Typed error classes: `AuthenticationError`, `BillingError`, `RateLimitError`, `NotFoundError`, `ValidationError`, `ProjectNotFoundError`
- Zero runtime dependencies - uses native `fetch` (Node 18+, Deno, Bun, browsers)
- ESM + CJS + TypeScript declaration files via tsup
