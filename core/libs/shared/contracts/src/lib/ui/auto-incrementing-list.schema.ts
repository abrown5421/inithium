import { z } from 'zod';

/** How an AutoIncrementingList lines its buttons up with each row's content (decision 0070). */
export const autoIncrementingListAligns = ['end', 'center'] as const;

export const autoIncrementingListAlignSchema = z.enum(autoIncrementingListAligns);
