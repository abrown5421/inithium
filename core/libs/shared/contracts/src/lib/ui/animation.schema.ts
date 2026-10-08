import { z } from 'zod';

// animate.css v4 animations, grouped by the slot they can fill (decision 0048).

export const entranceAnimations = [
  'backInDown', 'backInLeft', 'backInRight', 'backInUp',
  'bounceIn', 'bounceInDown', 'bounceInLeft', 'bounceInRight', 'bounceInUp',
  'fadeIn', 'fadeInDown', 'fadeInDownBig', 'fadeInLeft', 'fadeInLeftBig', 'fadeInRight', 'fadeInRightBig',
  'fadeInUp', 'fadeInUpBig', 'fadeInTopLeft', 'fadeInTopRight', 'fadeInBottomLeft', 'fadeInBottomRight',
  'flipInX', 'flipInY',
  'lightSpeedInRight', 'lightSpeedInLeft',
  'rotateIn', 'rotateInDownLeft', 'rotateInDownRight', 'rotateInUpLeft', 'rotateInUpRight',
  'jackInTheBox', 'rollIn',
  'zoomIn', 'zoomInDown', 'zoomInLeft', 'zoomInRight', 'zoomInUp',
  'slideInDown', 'slideInLeft', 'slideInRight', 'slideInUp',
] as const;

export const exitAnimations = [
  'backOutDown', 'backOutLeft', 'backOutRight', 'backOutUp',
  'bounceOut', 'bounceOutDown', 'bounceOutLeft', 'bounceOutRight', 'bounceOutUp',
  'fadeOut', 'fadeOutDown', 'fadeOutDownBig', 'fadeOutLeft', 'fadeOutLeftBig', 'fadeOutRight', 'fadeOutRightBig',
  'fadeOutUp', 'fadeOutUpBig', 'fadeOutTopLeft', 'fadeOutTopRight', 'fadeOutBottomRight', 'fadeOutBottomLeft',
  'flipOutX', 'flipOutY',
  'lightSpeedOutRight', 'lightSpeedOutLeft',
  'rotateOut', 'rotateOutDownLeft', 'rotateOutDownRight', 'rotateOutUpLeft', 'rotateOutUpRight',
  'hinge', 'rollOut',
  'zoomOut', 'zoomOutDown', 'zoomOutLeft', 'zoomOutRight', 'zoomOutUp',
  'slideOutDown', 'slideOutLeft', 'slideOutRight', 'slideOutUp',
] as const;

export const attentionAnimations = [
  'bounce', 'flash', 'pulse', 'rubberBand', 'shakeX', 'shakeY', 'headShake', 'swing', 'tada', 'wobble', 'jello',
  'heartBeat', 'flip',
] as const;

/** animate.css speeds (faster 500ms, fast 800ms, slow 2s, slower 3s), or a duration in ms. Default 1s. */
export const animationSpeedSchema = z.union([z.enum(['faster', 'fast', 'slow', 'slower']), z.number().min(0)]);

/** animate.css delays (1s–5s), or a delay in ms. */
export const animationDelaySchema = z.union([z.enum(['1s', '2s', '3s', '4s', '5s']), z.number().min(0)]);

const timing = {
  speed: animationSpeedSchema.optional(),
  delay: animationDelaySchema.optional(),
};

export const entranceAnimationSchema = z
  .object({
    name: z.enum(entranceAnimations),
    ...timing,
    /** 'mount' plays it when the element appears; 'inView' the first time ~20% of it scrolls into view. */
    when: z.enum(['mount', 'inView']).optional(),
  })
  .strict();

export const exitAnimationSchema = z.object({ name: z.enum(exitAnimations), ...timing }).strict();

export const attentionAnimationSchema = z
  .object({
    name: z.enum(attentionAnimations),
    ...timing,
    repeat: z.union([z.literal([1, 2, 3]), z.literal('infinite')]).optional(),
  })
  .strict();

/** The animation prop. Not a style prop: it takes no breakpoint or state keys. */
export const animationSchema = z
  .object({
    entrance: entranceAnimationSchema.optional(),
    exit: exitAnimationSchema.optional(),
    attention: attentionAnimationSchema.optional(),
  })
  .strict();
