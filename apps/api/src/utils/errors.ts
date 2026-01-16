export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super(message, 401, 'AUTH_ERROR');
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Authorization failed') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
  }
}

export class ZeevApiError extends AppError {
  constructor(message: string, public originalError?: unknown) {
    super(message, 502, 'ZEEV_API_ERROR');
  }
}

export function errorHandler(error: unknown): { statusCode: number; message: string; code?: string } {
  if (error instanceof AppError) {
    return {
      statusCode: error.statusCode,
      message: error.message,
      code: error.code,
    };
  }
  
  if (error instanceof Error) {
    return {
      statusCode: 500,
      message: error.message || 'Internal server error',
    };
  }
  
  return {
    statusCode: 500,
    message: 'Internal server error',
  };
}
