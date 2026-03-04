/**
 * SDK smoke test — run from the finishkit-sdk/ directory:
 *
 *   FINISHKIT_API_KEY=fk_live_... node test.mjs
 *
 * Without a key it still exercises the constructor guard and error types.
 */

import {
  FinishKit,
  AuthenticationError,
  ProjectNotFoundError,
  BillingError,
  RateLimitError,
} from './dist/index.mjs'

const apiKey = "fk_live_471r4l316d5b0n4l5p5f2z5j1w6a6w6k"
const baseUrl = process.env.FK_BASE_URL ?? 'http://localhost:3000'
const repoOwner = process.env.FK_REPO_OWNER
const repoName = process.env.FK_REPO_NAME

// ─── Test 1: empty key guard ─────────────────────────────────────────────────
console.log('\n── Test 1: empty apiKey throws immediately')
try {
  new FinishKit({ apiKey: '' })
  console.error('  FAIL — should have thrown')
  process.exit(1)
} catch (e) {
  console.log('  PASS:', e.message)
}

// ─── Test 2: missing key guard ────────────────────────────────────────────────
console.log('\n── Test 2: missing apiKey throws immediately')
try {
  // @ts-ignore intentional bad call
  new FinishKit({})
  console.error('  FAIL — should have thrown')
  process.exit(1)
} catch (e) {
  console.log('  PASS:', e.message)
}

// ─── Need real key for remaining tests ───────────────────────────────────────
if (!apiKey) {
  console.log('\nNo FINISHKIT_API_KEY set — skipping live tests.')
  console.log('Re-run with:  FINISHKIT_API_KEY=fk_live_... node test.mjs\n')
  process.exit(0)
}

const fk = new FinishKit({ apiKey, baseUrl })
console.log('\n── Client created OK, key prefix:', apiKey.slice(0, 12) + '…')
console.log('   baseUrl:', baseUrl)

// ─── Test 3: list projects ────────────────────────────────────────────────────
console.log('\n── Test 3: fk.projects.list()')
try {
  const projects = await fk.projects.list()
  console.log(`  PASS — ${projects.length} project(s)`)
  projects.forEach((p) =>
    console.log(`    • ${p.repo_owner}/${p.repo_name}  (id: ${p.id.slice(0, 8)}…)`)
  )
} catch (e) {
  if (e instanceof AuthenticationError) {
    console.error('  FAIL (auth):', e.message)
    process.exit(1)
  }
  throw e
}

// ─── Test 4: scan a specific repo (optional) ─────────────────────────────────
if (repoOwner && repoName) {
  console.log(`\n── Test 4: fk.scan({ repoOwner: '${repoOwner}', repoName: '${repoName}' })`)
  console.log('  (this polls until the scan finishes — may take a few minutes)')
  try {
    const result = await fk.scan({
      repoOwner,
      repoName,
      onProgress: (run) =>
        process.stdout.write(`\r  status: ${run.status}  progress: ${run.progress}%   `),
    })
    console.log(`\n  PASS — ${result.findings.length} findings, ${result.patches.length} patches`)
    const byCat = result.findings.reduce((acc, f) => {
      acc[f.category] = (acc[f.category] ?? 0) + 1
      return acc
    }, {})
    Object.entries(byCat).forEach(([cat, n]) => console.log(`    ${cat}: ${n}`))
  } catch (e) {
    if (e instanceof ProjectNotFoundError) {
      console.error('  FAIL (no project):', e.message)
    } else if (e instanceof BillingError) {
      console.error('  FAIL (billing):', e.message)
    } else if (e instanceof RateLimitError) {
      console.error(`  FAIL (rate limited, retry after ${e.retryAfter}s):`, e.message)
    } else {
      throw e
    }
    process.exit(1)
  }
} else {
  console.log('\n── Test 4: skipped (set FK_REPO_OWNER and FK_REPO_NAME to run a live scan)')
}

console.log('\nAll tests passed.\n')
