# @finishkit/sdk

[![npm version](https://img.shields.io/npm/v/@finishkit/sdk.svg)](https://www.npmjs.com/package/@finishkit/sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/node/v/@finishkit/sdk.svg)](https://nodejs.org)

TypeScript SDK for the FinishKit API. Scan GitHub repos with LLM-powered analysis to find security vulnerabilities, deployment blockers, stability issues, and code quality problems.

## Install

```bash
npm install @finishkit/sdk
```

## Quick Start

```typescript
import { FinishKit, ProjectNotFoundError } from '@finishkit/sdk'

const fk = new FinishKit({ apiKey: process.env.FINISHKIT_API_KEY! })

const result = await fk.scan({
  repoOwner: 'myorg',
  repoName: 'myrepo',
})

console.log(`Found ${result.findings.length} issues`)
for (const finding of result.findings) {
  console.log(`[${finding.severity}] ${finding.title}`)
}
```

Get your API key at [finishkit.app/dashboard/settings](https://finishkit.app/dashboard/settings) under the Developer tab.

## API Reference

### Constructor

```typescript
const fk = new FinishKit({
  apiKey: 'fk_live_...',     // Required. Set via FINISHKIT_API_KEY env var.
  baseUrl: 'https://finishkit.app',  // Optional. Default shown.
})
```

### fk.scan(options) - Full Lifecycle

The primary method. Finds the project, triggers a scan, polls until complete, and returns results.

```typescript
const result = await fk.scan({
  repoOwner: 'myorg',          // Required
  repoName: 'myrepo',          // Required
  runType: 'baseline',         // Optional: 'baseline' | 'pr' | 'manual_patch'
  commitSha: 'abc123',         // Optional: specific commit to scan
  idempotencyKey: 'unique-id', // Optional: safe retries
  onProgress: (run) => {       // Optional: called on each poll
    console.log(run.status, run.progress + '%')
  },
  pollIntervalMs: 2000,        // Optional: poll frequency (default 2s)
  timeoutMs: 600000,           // Optional: max wait time (default 10min)
})
// Returns: { run, findings, patches, artifacts, metrics }
```

Note: `scan()` does NOT create projects. The repository must be connected to FinishKit via the dashboard first. Throws `ProjectNotFoundError` if not found.

### fk.projects

```typescript
const { projects } = await fk.projects.list()
const { project } = await fk.projects.get(projectId)
```

### fk.runs

```typescript
const { run } = await fk.runs.create({
  projectId: 'uuid',
  runType: 'baseline',
  commitSha: 'abc123',     // Optional
  idempotencyKey: 'key',   // Optional
})

const { run } = await fk.runs.get(runId)
const { findings, patches, artifacts, metrics } = await fk.runs.outcomes(runId)
const { events } = await fk.runs.events(runId, { since: isoString, limit: 100 })
await fk.runs.cancel(runId)
```

## Types

```typescript
type RunStatus = 'queued' | 'running' | 'done' | 'failed' | 'canceled'
type RunType = 'baseline' | 'pr' | 'manual_patch'
type FindingCategory = 'blockers' | 'security' | 'deploy' | 'stability' | 'tests' | 'ui'
type FindingSeverity = 'critical' | 'high' | 'medium' | 'low'

interface Finding {
  id: string
  title: string
  category: FindingCategory
  severity: FindingSeverity
  detail_md: string           // Full explanation in Markdown
  file_path: string | null    // Affected file path (relative to repo root)
  line_start: number | null   // Starting line number
  line_end: number | null     // Ending line number
  suggested_fix: object | null
}

interface ScanResult {
  run: Run
  findings: Finding[]
  patches: Patch[]
  artifacts: Artifact[]
  metrics: ScanMetrics
}
```

## Error Handling

```typescript
import {
  FinishKitError,
  AuthenticationError,   // 401 - invalid or expired API key
  BillingError,          // 402 - plan limit reached
  NotFoundError,         // 404 - resource not found
  RateLimitError,        // 429 - too many requests
  ValidationError,       // 400 - invalid request parameters
  ProjectNotFoundError,  // Project not linked to FinishKit
} from '@finishkit/sdk'

try {
  const result = await fk.scan({ repoOwner: 'org', repoName: 'repo' })
} catch (err) {
  if (err instanceof ProjectNotFoundError) {
    // Repository not connected. Direct user to finishkit.app/dashboard
  } else if (err instanceof AuthenticationError) {
    // Invalid API key
  } else if (err instanceof BillingError) {
    // Plan limit reached - upgrade at finishkit.app/dashboard/settings
  } else if (err instanceof RateLimitError) {
    // Wait err.retryAfter seconds before retrying
  } else if (err instanceof FinishKitError) {
    // Other API error - err.code and err.statusCode available
  }
}
```

## For AI Agents

If you are an AI assistant (Claude, Copilot, Cursor, etc.) helping a developer use FinishKit:

**Setup**
```bash
npm install @finishkit/sdk
```
```bash
export FINISHKIT_API_KEY=fk_live_...
```

**Minimal working example**
```typescript
import { FinishKit, ProjectNotFoundError } from '@finishkit/sdk'

const fk = new FinishKit({ apiKey: process.env.FINISHKIT_API_KEY! })

try {
  const result = await fk.scan({ repoOwner: 'myorg', repoName: 'myrepo' })
  const critical = result.findings.filter(f => f.severity === 'critical')
  console.log(`${critical.length} critical issues found`)
} catch (err) {
  if (err instanceof ProjectNotFoundError) {
    console.log('Connect the repo at https://finishkit.app/dashboard first')
  }
}
```

**Key facts:**
- Env var: `FINISHKIT_API_KEY` (format: `fk_live_` followed by 32 alphanumeric chars)
- `scan()` blocks until complete (2-8 minutes typical). Use `onProgress` callback for updates.
- Projects must be created via the dashboard - the API key auth path cannot create projects
- `run.current_phase` is available at runtime but not in TypeScript types - use `(run as any).current_phase` or a local interface extension if needed
- All error types are named exports from `@finishkit/sdk`
- Rate limits: 10 scans/hour, 60 GET requests/min. Respect `Retry-After` on 429 responses.

## Requirements

- Node.js 18+ (or Deno, Bun, any runtime with native `fetch`)
- A FinishKit account with at least one project connected

## License

MIT. See [LICENSE](LICENSE).
