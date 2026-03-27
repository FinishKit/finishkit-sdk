import type { ApiClient } from '../client.js'
import type {
  IntelligencePackRequest,
  IntelligencePackResponse,
  FindingsSyncRequest,
  FindingsSyncResponse,
} from '../types.js'

export class IntelligenceResource {
  constructor(private readonly client: ApiClient) {}

  /**
   * Request a bespoke intelligence pack for a detected technology stack.
   * The pack contains stack-specific analysis prompts, framework rules,
   * security advisories, and community patterns.
   */
  async getPack(request: IntelligencePackRequest): Promise<IntelligencePackResponse> {
    return this.client.request<IntelligencePackResponse>('/api/intelligence/packs', {
      method: 'POST',
      body: request,
    })
  }

  /**
   * Sync findings from an agent-path analysis back to the FinishKit dashboard.
   * Creates a project (if needed), a run record, and inserts findings.
   * Returns the dashboard URL and billing info.
   */
  async syncFindings(request: FindingsSyncRequest): Promise<FindingsSyncResponse> {
    return this.client.request<FindingsSyncResponse>('/api/intelligence/sync', {
      method: 'POST',
      body: request,
    })
  }
}
