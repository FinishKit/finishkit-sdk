export class FinishKitError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status?: number,
  ) {
    super(message)
    this.name = 'FinishKitError'
    // Maintain proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

/** 401 — API key is missing, invalid, expired, or revoked. */
export class AuthenticationError extends FinishKitError {
  constructor(message = 'Invalid or expired API key. Get one at https://finishkit.app/dashboard/settings?tab=developer') {
    super('UNAUTHORIZED', message, 401)
    this.name = 'AuthenticationError'
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

/** 429 — Rate limit exceeded. Check `retryAfter` for the backoff delay in seconds. */
export class RateLimitError extends FinishKitError {
  constructor(
    message = 'Rate limit exceeded.',
    public readonly retryAfter?: number,
  ) {
    super('RATE_LIMITED', message, 429)
    this.name = 'RateLimitError'
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

/** 402 — Plan limit reached. Upgrade or purchase a top-up to continue. */
export class BillingError extends FinishKitError {
  constructor(message = 'Run limit reached. Upgrade your plan or purchase a top-up.') {
    super('PAYMENT_REQUIRED', message, 402)
    this.name = 'BillingError'
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

/** 404 — The requested resource was not found. */
export class NotFoundError extends FinishKitError {
  constructor(message = 'Resource not found.') {
    super('NOT_FOUND', message, 404)
    this.name = 'NotFoundError'
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

/** 400 — Request validation failed. */
export class ValidationError extends FinishKitError {
  constructor(message = 'Invalid request parameters.') {
    super('BAD_REQUEST', message, 400)
    this.name = 'ValidationError'
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

/**
 * Thrown by `scan()` when no project matches the given `repoOwner`/`repoName`.
 * Projects must be created via the FinishKit dashboard first.
 */
export class ProjectNotFoundError extends FinishKitError {
  constructor(repoOwner: string, repoName: string) {
    super(
      'PROJECT_NOT_FOUND',
      `No project found for ${repoOwner}/${repoName}. Create it at https://finishkit.app/dashboard.`,
    )
    this.name = 'ProjectNotFoundError'
    Object.setPrototypeOf(this, new.target.prototype)
  }
}
