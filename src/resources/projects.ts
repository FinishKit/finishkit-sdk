import type { ApiClient } from '../client.js'
import type { Project } from '../types.js'

interface ProjectListResponse {
  projects: Project[]
}

interface ProjectResponse {
  project: Project
}

export class ProjectsResource {
  constructor(private readonly client: ApiClient) {}

  /** List all projects for the authenticated user. */
  async list(): Promise<Project[]> {
    const response = await this.client.request<ProjectListResponse>('/api/projects')
    return response.projects
  }

  /** Get a single project by ID. */
  async get(projectId: string): Promise<Project> {
    const response = await this.client.request<ProjectResponse>(`/api/projects/${projectId}`)
    return response.project
  }
}
