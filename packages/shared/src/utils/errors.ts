export class AppError extends Error {
  constructor(
    public override message: string,
    public statusCode: number = 500,
    public details?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export function toApiError(error: unknown): {
  error: string;
  statusCode: number;
} {
  if (isAppError(error)) {
    return { error: error.message, statusCode: error.statusCode };
  }
  if (error instanceof Error) {
    return { error: error.message, statusCode: 500 };
  }
  return { error: 'An unknown error occurred', statusCode: 500 };
}
