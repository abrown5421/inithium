import { ErrorRequestHandler } from 'express';

interface SerializedError {
  name:    string;
  message: string;
  stack?:  string;
}

const serializeError = (err: unknown): SerializedError => {
  if (err instanceof Error) {
    return {
      name:    err.name,
      message: err.message,
      stack:   process.env.NODE_ENV !== 'production' ? err.stack : undefined,
    };
  }
  return { name: 'UnknownError', message: String(err) };
};

const resolveStatus = (err: unknown): number => {
  if (err !== null && typeof err === 'object' && 'status' in err) {
    const s = (err as { status: unknown }).status;
    if (typeof s === 'number' && s >= 400 && s < 600) return s;
  }
  return 500;
};

export const errorMiddleware: ErrorRequestHandler = (err, _req, res, next) => {
  if (res.headersSent) {
    next(err);
    return;
  }

  const status    = resolveStatus(err);
  const serialized = serializeError(err);

  console.error(
    JSON.stringify({
      level:   'error',
      status,
      name:    serialized.name,
      message: serialized.message,
      stack:   serialized.stack,
      ts:      new Date().toISOString(),
    })
  );

  res.status(status).json({
    success: false,
    error:   serialized.message,
  });
};
