import { z } from 'zod';

/** When a Slider shows its value above the thumb (decision 0063). */
export const sliderValueLabels = ['auto', 'always', 'off'] as const;

export const sliderValueLabelSchema = z.enum(sliderValueLabels);

/** A tick on a Slider's track, optionally labelled underneath. */
export const sliderMarkSchema = z.object({ value: z.number(), label: z.string().optional() }).strict();

/** `true` for a tick at every step, or a list of ticks. */
export const sliderMarksSchema = z.union([z.literal(true), z.array(sliderMarkSchema)]);

export type SliderMark = z.infer<typeof sliderMarkSchema>;
