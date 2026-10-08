import { z } from 'zod';

/** Which side of a Switch its label sits on (decision 0059). `start` puts the label first and the switch at the far end. */
export const switchLabelPlacements = ['end', 'start'] as const;

export const switchLabelPlacementSchema = z.enum(switchLabelPlacements);

export type SwitchLabelPlacement = z.infer<typeof switchLabelPlacementSchema>;
