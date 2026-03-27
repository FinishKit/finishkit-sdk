import { ApiClient } from './client.js'
import { IntelligenceResource } from './resources/intelligence.js'
import { ProjectsResource } from './resources/projects.js'
import { RunsResource } from './resources/runs.js'
import { scan } from './scan.js'
import type { FinishKitOptions, ScanOptions, ScanResult } from './types.js'

export class FinishKit {
  readonly intelligence: IntelligenceResource
  readonly projects: ProjectsResource
  readonly runs: RunsResource
  private readonly client: ApiClient

  constructor({ apiKey, baseUrl = 'https://www.finishkit.app' }: FinishKitOptions) {
    if (!apiKey || !apiKey.trim()) {
      throw new Error(
        'FinishKit: apiKey is required. Get one at https://finishkit.app/dashboard/settings?tab=developer',
      )
    }
    this.client = new ApiClient(apiKey, baseUrl)
    this.intelligence = new IntelligenceResource(this.client)
    this.projects = new ProjectsResource(this.client)
    this.runs = new RunsResource(this.client)
  }

  /**
   * Convenience method: find a project by repo, trigger a scan, poll until complete,
   * and return the outcomes in a single call.
   *
   * Throws `ProjectNotFoundError` if no project matches the given repo.
   * Does NOT create projects — use the FinishKit dashboard for that.
   */
  scan(options: ScanOptions): Promise<ScanResult> {
    return scan(this.client, this.projects, this.runs, options)
  }
}

// Re-export everything for tree-shaking consumers
export * from './types.js'
export * from './errors.js'
