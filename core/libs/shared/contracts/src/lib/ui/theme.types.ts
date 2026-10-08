import type { z } from 'zod';
import type { themeConfigSchema } from './theme.schema';

export type ThemeConfig = z.infer<typeof themeConfigSchema>;
