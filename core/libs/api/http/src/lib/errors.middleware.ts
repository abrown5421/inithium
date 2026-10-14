import type { ErrorRequestHandler, RequestHandler } from 'express';

/** An error a route throws to answer with its status; a 4xx may name the form field it's about. */
export type HttpError = Error & { status?: number; field?: string };

/** Answers any /api path no router handled with a JSON 404, never the SPA. */
export const apiNotFound: RequestHandler = (_req, res) => {
  res.status(404).send({ message: 'Not found' });
};

/**
 * Turns an error thrown by an /api route into its response: a 4xx keeps its message (and `field`, so the form can mark
 * it); anything else is logged and answered with a generic 500, so internals never reach the browser.
 */
export const apiErrorHandler: ErrorRequestHandler = (error: HttpError, _req, res, _next) => {
  const status = error.status && error.status < 500 ? error.status : 500;
  if (status === 500) console.error('[ error ]', error);
  res.status(status).send(status === 500 ? { message: 'Something went wrong' } : { message: error.message, ...(error.field ? { field: error.field } : {}) });
};
