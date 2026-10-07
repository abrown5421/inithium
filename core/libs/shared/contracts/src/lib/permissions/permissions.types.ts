import type { z } from 'zod';
import type { permissionSchema } from './permissions.schema';

export type Permission = z.infer<typeof permissionSchema>;
