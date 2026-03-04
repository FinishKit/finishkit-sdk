import type { ApiClient } from '../client.js'
import type {
  Artifact,
  CreateRunOptions,
  Finding,
  ListEventsOptions,
  ListRunsOptions,
  Patch,
  Run,
  RunEvent,
  ScanMetrics,
} from '../types.js'

interface RunResponse {
  run: Run
}

interface RunListResponse {
  runs: Run[]
}

interface CreateRunResponse {
  run: Run
  queue: { mode: string; receipt: unknown }
  idempotencyReplayed: boolean
}

interface RunOutcomesResponse {
  findings: Finding[]
  patches: Patch[]
  artifacts: Artifact[]
  metrics: ScanMetrics
}

interface RunEventsResponse {
  events: RunEvent[]
  polling: { limit: number; since?: string }
}

export class RunsResource {
  constructor(private readonly client: ApiClient) {}

  /** Create a new run. */
  async create(opts: CreateRunOptions): Promise<Run> {
    const response = await this.client.request<CreateRunResponse>('/api/runs', {
      method: 'POST',
      body: opts,
    })
    return response.run
  }

  /** Get a single run by ID. */
  async get(runId: string): Promise<Run> {
    const response = await this.client.request<RunResponse>(`/api/runs/${runId}`)
    return response.run
  }

  /** List runs, with optional filters. */
  async list(opts?: ListRunsOptions): Promise<Run[]> {
    const query: Record<string, string | number | boolean | undefined> = {}
    if (opts?.projectId) query.projectId = opts.projectId
    if (opts?.status) query.status = opts.status
    if (opts?.runType) query.runType = opts.runType
    if (opts?.createdFrom) query.createdFrom = opts.createdFrom
    if (opts?.createdTo) query.createdTo = opts.createdTo
    if (opts?.limit !== undefined) query.limit = opts.limit

    const response = await this.client.request<RunListResponse>('/api/runs', { query })
    return response.runs
  }

  /** Get the outcomes (findings, patches, artifacts, metrics) for a completed run. */
  async outcomes(
    runId: string,
  ): Promise<{ findings: Finding[]; patches: Patch[]; artifacts: Artifact[]; metrics: ScanMetrics }> {
    return this.client.request<RunOutcomesResponse>(`/api/runs/${runId}/outcomes`)
  }

  /** Get events for a run, with optional cursor-based pagination. */
  async events(
    runId: string,
    opts?: ListEventsOptions,
  ): Promise<{ events: RunEvent[]; polling: { limit: number; since?: string } }> {
    const query: Record<string, string | number | boolean | undefined> = {}
    if (opts?.since) query.since = opts.since
    if (opts?.limit !== undefined) query.limit = opts.limit

    return this.client.request<RunEventsResponse>(`/api/runs/${runId}/events`, { query })
  }

  /** Cancel a running or queued run. */
  async cancel(runId: string, reason?: string): Promise<Run> {
    const response = await this.client.request<RunResponse>(`/api/runs/${runId}/cancel`, {
      method: 'POST',
      body: reason ? { reason } : {},
    })
    return response.run
  }
}
