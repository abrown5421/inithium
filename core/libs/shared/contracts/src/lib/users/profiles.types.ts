import type { z } from 'zod';
import type { profileViewerSchema, publicProfileSchema, updateProfileRequestSchema } from './profiles.schema';

export type ProfileViewer = z.infer<typeof profileViewerSchema>;
export type PublicProfile = z.infer<typeof publicProfileSchema>;
export type UpdateProfileRequest = z.infer<typeof updateProfileRequestSchema>;
