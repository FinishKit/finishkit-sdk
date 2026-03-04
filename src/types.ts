// ---------------------------------------------------------------------------
// Primitive union types
// ---------------------------------------------------------------------------

export type RunStatus = 'queued' | 'running' | 'done' | 'failed' | 'canceled'
export type RunType = 'baseline' | 'pr' | 'manual_patch'
export type FindingCategory = 'blockers' | 'security' | 'deploy' | 'stability' | 'tests' | 'ui'
export type FindingSeverity = 'critical' | 'high' | 'medium' | 'low'
export type RunEventType = 'phase' | 'log' | 'file' | 'command' | 'finding' | 'patch' | 'metric'
export type RunEventLevel = 'info' | 'warn' | 'error' | 'success'
export type RunEventPhase =
  | 'clone'
  | 'detect'
  | 'analyze'
  | 'patch'
  | 'verify'
  | 'pr'
  | 'finalize'

// ---------------------------------------------------------------------------
// Core entity interfaces (mirrors DB Row types with typed unions)
// ---------------------------------------------------------------------------

export interface Project {
  id: string
  user_id: string
  provider: string
  repo_owner: string
  repo_name: string
  repo_id: number | null
  github_installation_id: number | null
  default_branch: string
  detected_stack: Record<string, unknown> | null
  settings: Record<string, unknown>
  last_scanned_at: string | null
  created_at: string
  updated_at: string
}

export interface Run {
  id: string
  project_id: string
  run_type: RunType
  status: RunStatus
  progress: number
  commit_sha: string | null
  pr_number: number | null
  pr_url: string | null
  started_at: string | null
  finished_at: string | null
  summary: Record<string, unknown> | null
  token_input: number
  token_output: number
  compute_seconds: number
  estimated_cost_usd: string
  idempotency_key: string | null
  created_at: string
  correlation_id: string | null
  focus: Record<string, unknown> | null
  queue_receipt: Record<string, unknown> | null
}

export interface Finding {
  id: string
  run_id: string
  title: string
  category: FindingCategory
  severity: FindingSeverity
  detail_md: string
  file_path: string | null
  line_start: number | null
  line_end: number | null
  suggested_fix: Record<string, unknown> | null
  confidence: number | null
  fingerprint: string | null
  pr_task: Record<string, unknown> | null
  created_at: string
}

export interface Patch {
  id: string
  run_id: string
  finding_id: string | null
  diff: string
  branch_name: string
  apply_status: string
  verify_status: string
  verify_summary: Record<string, unknown> | null
  pr_url: string | null
  created_at: string
}

export interface RunEvent {
  id: string
  run_id: string
  type: RunEventType
  level: RunEventLevel
  phase: RunEventPhase | null
  message: string | null
  data: Record<string, unknown> | null
  ts: string
  created_at: string
}

export interface Artifact {
  id: string
  run_id: string
  kind: string
  url: string
  size_bytes: number | null
  checksum_sha256: string | null
  meta: Record<string, unknown> | null
  created_at: string
}

// ---------------------------------------------------------------------------
// Composite / result types
// ---------------------------------------------------------------------------

export interface ScanMetrics {
  findingsCount: number
  patchCount: number
  artifactCount: number
  avgConfidence: number | null
}

export interface ScanResult {
  run: Run
  findings: Finding[]
  patches: Patch[]
  artifacts: Artifact[]
  metrics: ScanMetrics
}

// ---------------------------------------------------------------------------
// Request / option types
// ---------------------------------------------------------------------------

export interface ScanOptions {
  repoOwner: string
  repoName: string
  runType?: RunType
  commitSha?: string
  idempotencyKey?: string
  onProgress?: (run: Run) => void
  pollIntervalMs?: number
  timeoutMs?: number
}

export interface CreateRunOptions {
  projectId: string
  runType: RunType
  commitSha?: string
  prNumber?: number
  prUrl?: string
  focus?: Record<string, unknown>
  idempotencyKey?: string
}

export interface ListRunsOptions {
  projectId?: string
  status?: RunStatus
  runType?: RunType
  createdFrom?: string
  createdTo?: string
  limit?: number
}

export interface ListEventsOptions {
  since?: string
  limit?: number
}

export interface FinishKitOptions {
  apiKey: string
  baseUrl?: string
}
