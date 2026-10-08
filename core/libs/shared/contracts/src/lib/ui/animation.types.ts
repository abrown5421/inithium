import type { z } from 'zod';
import type {
  animationDelaySchema,
  animationSchema,
  animationSpeedSchema,
  attentionAnimationSchema,
  entranceAnimationSchema,
  exitAnimationSchema,
} from './animation.schema';

export type Animation = z.infer<typeof animationSchema>;
export type EntranceAnimation = z.infer<typeof entranceAnimationSchema>;
export type ExitAnimation = z.infer<typeof exitAnimationSchema>;
export type AttentionAnimation = z.infer<typeof attentionAnimationSchema>;
export type AnimationSpeed = z.infer<typeof animationSpeedSchema>;
export type AnimationDelay = z.infer<typeof animationDelaySchema>;
