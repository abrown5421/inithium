import { AnimationObject } from "./animation.types.js";

export type AlertSeverity =
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'primary'
  | 'secondary'
  | 'accent'

  export type AlertPosition =
  | 'top-right'
  | 'top-left'
  | 'bottom-right'
  | 'bottom-left'

  export interface AlertProps {
    severity: AlertSeverity;
    open: boolean;
    animationObject: AnimationObject
    message: string;
    position: AlertPosition;
  }