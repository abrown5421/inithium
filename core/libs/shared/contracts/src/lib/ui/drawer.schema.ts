import { z } from 'zod';

/** Which screen edge a Drawer slides in from (decision 0071). */
export const drawerSides = ['right', 'left', 'top', 'bottom'] as const;

export const drawerSideSchema = z.enum(drawerSides);

export type DrawerSide = z.infer<typeof drawerSideSchema>;
