# Contributing to @finishkit/sdk

## Prerequisites
- Node.js 18+
- npm 9+

## Local Setup
```bash
git clone https://github.com/finishkit/sdk
cd sdk
npm install
npm run build
npm run typecheck
```

## Development
- Source files are in `src/`
- Build output goes to `dist/` via tsup
- `npm run build` - compile TypeScript to ESM + CJS + .d.ts
- `npm run typecheck` - TypeScript type check without emitting

## Making Changes
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-change`
3. Make your changes in `src/`
4. Run `npm run typecheck` to verify types
5. Run `npm run build` and verify `dist/` looks correct
6. Submit a pull request

## Code Style
- TypeScript strict mode - no `any` without explicit cast
- No external runtime dependencies (zero-dep principle)
- All public API surface must be exported from `src/index.ts`
- Error classes must extend `FinishKitError`

## Releasing
See `docs/release-management.md` in the main FinishKit repository.
