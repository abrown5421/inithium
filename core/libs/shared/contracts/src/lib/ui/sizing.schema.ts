import { z } from 'zod';

/**
 * A size: pixels, 'full' (the parent), 'screen' (the viewport), an 'n/d' fraction,
 * 'auto', or 'fit' (fit-content). See decision 0042.
 */
export const sizeValueSchema = z.union([
  z.number().min(0),
  z.enum(['full', 'screen', 'auto', 'fit']),
  z.string().regex(/^[1-9]\d*\/[1-9]\d*$/, { error: "Fractions are written 'n/d', e.g. '1/2'" }),
]);
