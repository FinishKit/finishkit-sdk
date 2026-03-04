import {
  AuthenticationError,
  BillingError,
  FinishKitError,
  NotFoundError,
  RateLimitError,
  ValidationError,
} from './errors.js'

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  body?: unknown
  query?: Record<string, string | number | boolean | undefined>
}

export class ApiClient {
  private readonly apiKey: string
  private readonly baseUrl: string

  constructor(apiKey: string, baseUrl: string) {
    this.apiKey = apiKey
    this.baseUrl = baseUrl.replace(/\/$/, '')
  }

  async request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
    const { method = 'GET', body, query } = opts

    // Build URL with query params
    const url = new URL(path, this.baseUrl)
    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value !== undefined) {
          url.searchParams.set(key, String(value))
        }
      }
    }

    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.apiKey}`,
    }

    if (body !== undefined && (method === 'POST' || method === 'PATCH')) {
      headers['Content-Type'] = 'application/json'
    }

    const response = await fetch(url.toString(), {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })

    if (response.ok) {
      // 204 No Content
      if (response.status === 204) {
        return undefined as T
      }
      return response.json() as Promise<T>
    }

    // Parse error body
    let errorCode = 'INTERNAL_ERROR'
    let errorMessage = `Request failed with status ${response.status}`

    try {
      const errorBody = (await response.json()) as { code?: string; message?: string }
      if (errorBody.code) errorCode = errorBody.code
      if (errorBody.message) errorMessage = errorBody.message
    } catch {
      // Ignore JSON parse errors — use defaults above
    }

    switch (response.status) {
      case 401:
        throw new AuthenticationError(errorMessage)
      case 402:
        throw new BillingError(errorMessage)
      case 404:
        throw new NotFoundError(errorMessage)
      case 429: {
        const retryAfterHeader = response.headers.get('Retry-After')
        const retryAfter = retryAfterHeader ? parseInt(retryAfterHeader, 10) : undefined
        throw new RateLimitError(errorMessage, Number.isFinite(retryAfter) ? retryAfter : undefined)
      }
      case 400:
        throw new ValidationError(errorMessage)
      default:
        throw new FinishKitError(errorCode, errorMessage, response.status)
    }
  }
}
