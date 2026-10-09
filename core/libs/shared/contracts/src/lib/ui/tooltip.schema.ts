import { z } from 'zod';

/** Which side of its element a Tooltip appears on (decision 0064). It flips when there's no room. */
export const tooltipSides = ['top', 'bottom', 'left', 'right'] as const;

/** Where a Tooltip lines up along that side. */
export const tooltipAligns = ['center', 'start', 'end'] as const;

export const tooltipSideSchema = z.enum(tooltipSides);
export const tooltipAlignSchema = z.enum(tooltipAligns);
