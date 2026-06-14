/**
 * Base application error class with HTTP status code.
 */
export class AppError extends Error {
  /**
   * @param statusCode - HTTP status code
   * @param message - Error message
   */
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * Error for invalid user input (400).
 */
export class ValidationError extends AppError {
  /**
   * @param message - Validation error description
   */
  constructor(message: string) {
    super(400, message);
    this.name = 'ValidationError';
  }
}

/**
 * Error when a requested resource is not found (404).
 */
export class NotFoundError extends AppError {
  /**
   * @param message - Resource not found description
   */
  constructor(message: string = 'Resource not found') {
    super(404, message);
    this.name = 'NotFoundError';
  }
}

/**
 * Error for external service failures (502).
 */
export class ExternalServiceError extends AppError {
  /**
   * @param message - External service error description
   */
  constructor(message: string = 'External service error') {
    super(502, message);
    this.name = 'ExternalServiceError';
  }
}

/**
 * Error for authentication failures (401).
 */
export class UnauthorizedError extends AppError {
  /**
   * @param message - Authentication error description
   */
  constructor(message: string = 'Authentication required') {
    super(401, message);
    this.name = 'UnauthorizedError';
  }
}

/**
 * Error for forbidden access (403).
 */
export class ForbiddenError extends AppError {
  /**
   * @param message - Forbidden access description
   */
  constructor(message: string = 'Access denied') {
    super(403, message);
    this.name = 'ForbiddenError';
  }
}

/**
 * Error for duplicate resource conflicts (409).
 */
export class ConflictError extends AppError {
  /**
   * @param message - Conflict description
   */
  constructor(message: string = 'Resource already exists') {
    super(409, message);
    this.name = 'ConflictError';
  }
}
