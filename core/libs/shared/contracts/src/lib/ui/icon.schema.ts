import { z } from 'zod';

/**
 * A Lucide icon name in kebab-case, e.g. 'arrow-right' (decision 0050). The schema checks the format only, so
 * contracts stay free of React and of Lucide's 2,000+ icon list; in code, Icon's prop type is Lucide's exact
 * IconName union, and an unknown stored name renders as an empty box of the right size.
 */
export const iconNameSchema = z
  .string()
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, { error: "Icon names are Lucide's kebab-case names, e.g. 'arrow-right'" });
