import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { ApiError } from './api-errors.js';

interface ErrorResponse {
  status: 'error';
  message: string;
  errors?: Array<{ field: string; message: string }>;
  stack?: string;
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof ZodError) {
    const errors = err.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));

    const response: ErrorResponse = {
      status: 'error',
      message: 'Validation failed',
      errors,
    };

    res.status(400).json(response);
    return;
  }

  if (err instanceof ApiError) {
    const response: ErrorResponse = {
      status: 'error',
      message: err.message,
    };

    if (process.env.NODE_ENV === 'development') {
      response.stack = err.stack;
    }

    res.status(err.statusCode).json(response);
    return;
  }

  console.error('[Error Handler] Unhandled error:', err);

  const response: ErrorResponse = {
    status: 'error',
    message:
      process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : (err as Error).message,
  };

  if (process.env.NODE_ENV === 'development' && err instanceof Error) {
    response.stack = err.stack;
  }

  res.status(500).json(response);
}

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({
    status: 'error',
    message: 'Route not found',
  });
}
