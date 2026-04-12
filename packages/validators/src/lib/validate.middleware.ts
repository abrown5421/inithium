import { RequestHandler } from 'express';
import { z } from 'zod';

const formatZodError = (err: z.ZodError): string =>
  err.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join(', ');

export const validate =
  (schema: z.ZodTypeAny): RequestHandler =>
  (req, res, next) => {
    const result = schema.safeParse({
      body:   req.body,
      query:  req.query,
      params: req.params,
    }) as z.SafeParseReturnType<unknown, unknown>;

    if (!result.success) {
      res.status(422).json({
        success: false,
        error:   formatZodError(result.error),
      });
      return;
    }

    next();
  };
