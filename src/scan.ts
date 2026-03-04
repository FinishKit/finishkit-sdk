import type { ApiClient } from './client.js'
import { FinishKitError, ProjectNotFoundError } from './errors.js'
import type { ProjectsResource } from './resources/projects.js'
import type { RunsResource } from './resources/runs.js'
import type { Run, ScanOptions, ScanResult } from './types.js'

const TERMINAL_STATUSES = new Set(['done', 'failed', 'canceled'])

export async function scan(
  _client: ApiClient,
  projects: ProjectsResource,
  runs: RunsResource,
  options: ScanOptions,
): Promise<ScanResult> {
  const {
    repoOwner,
    repoName,
    runType = 'baseline',
    commitSha,
    idempotencyKey,
    onProgress,
    pollIntervalMs = 2000,
    timeoutMs = 600_000,
  } = options

  // 1. Find the project by repo owner + name (case-insensitive)
  const allProjects = await projects.list()
  const project = allProjects.find(
    (p) =>
      p.repo_owner.toLowerCase() === repoOwner.toLowerCase() &&
      p.repo_name.toLowerCase() === repoName.toLowerCase(),
  )

  if (!project) {
    throw new ProjectNotFoundError(repoOwner, repoName)
  }

  // 2. Create the run
  let run: Run = await runs.create({
    projectId: project.id,
    runType,
    commitSha,
    idempotencyKey,
  })

  // 3. Poll until terminal status or timeout
  const startTime = Date.now()

  while (!TERMINAL_STATUSES.has(run.status)) {
    if (Date.now() - startTime > timeoutMs) {
      throw new FinishKitError(
        'SCAN_TIMEOUT',
        `Scan timed out after ${Math.round(timeoutMs / 1000)}s. Run ID: ${run.id}`,
      )
    }

    await sleep(pollIntervalMs)

    run = await runs.get(run.id)
    onProgress?.(run)
  }

  // 4. Handle terminal statuses
  if (run.status === 'failed') {
    const errorMsg =
      (run.summary as { error?: string } | null)?.error ?? 'Scan failed without details.'
    throw new FinishKitError('RUN_FAILED', errorMsg)
  }

  if (run.status === 'canceled') {
    throw new FinishKitError('RUN_CANCELED', 'Scan was canceled.')
  }

  // 5. Fetch outcomes
  const outcomes = await runs.outcomes(run.id)

  return {
    run,
    findings: outcomes.findings,
    patches: outcomes.patches,
    artifacts: outcomes.artifacts,
    metrics: outcomes.metrics,
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
