import { z } from 'zod';
import { animationSchema } from './animation.schema';
import { solidColorValueSchema } from './colors.schema';
import { iconNameSchema } from './icon.schema';

/** Where an AlertStack shows its alerts (decision 0066). */
export const alertPositions = ['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right'] as const;

export const alertPositionSchema = z.enum(alertPositions);

export type AlertPosition = z.infer<typeof alertPositionSchema>;

/** A link in an alert, e.g. { label: 'View', href: '/friends' }. The app's router follows it. */
export const alertActionSchema = z.object({ label: z.string().min(1), href: z.string().min(1) }).strict();

/**
 * One alert's content (decision 0066): plain data, so it can travel through Redux (e.g. from a real-time event)
 * and be stored.
 */
export const alertContentSchema = z
  .object({
    /** The text. */
    message: z.string().min(1),
    /** A bold line above the message. */
    title: z.string().optional(),
    /** Text, border and icon in its 600 step, background in its 100 step. Default 'primary'. */
    color: solidColorValueSchema.optional(),
    /** A Lucide icon before the text. */
    icon: iconNameSchema.optional(),
    /** A round picture before the text instead of the icon, e.g. a sender's avatar. */
    image: z.object({ src: z.string().min(1), alt: z.string().optional() }).strict().optional(),
    /** A link shown under the message. */
    action: alertActionSchema.optional(),
    /** How long before it closes by itself, in ms; null keeps it until dismissed. Default 5000. */
    duration: z.number().positive().nullable().optional(),
    /** Interrupts screen readers instead of waiting, e.g. for failures. Default false. */
    urgent: z.boolean().optional(),
    /** Entrance and exit. Default: from the stack's position, e.g. fadeInRight and fadeOutRight on the right. */
    animation: animationSchema.optional(),
  })
  .strict();

export type AlertAction = z.infer<typeof alertActionSchema>;
export type AlertContent = z.infer<typeof alertContentSchema>;

/** An AlertStack's storable props. */
export const alertStackPropsSchema = z.object({ position: alertPositionSchema.optional() }).strict();
