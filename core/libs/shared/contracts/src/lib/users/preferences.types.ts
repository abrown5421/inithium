import type { z } from 'zod';
import type { colorSchemeSchema, updatePreferencesRequestSchema, userPreferencesSchema } from './preferences.schema';

export type ColorScheme = z.infer<typeof colorSchemeSchema>;
export type UserPreferences = z.infer<typeof userPreferencesSchema>;
export type UpdatePreferencesRequest = z.infer<typeof updatePreferencesRequestSchema>;
