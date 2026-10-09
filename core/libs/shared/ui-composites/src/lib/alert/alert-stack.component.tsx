import { useState } from 'react';
import * as Toast from '@radix-ui/react-toast';
import type { AlertContent, AlertPosition, Animation } from '@inithium/shared-contracts';
import type { IconName } from '@inithium/shared-ui-components';
import { Alert } from './alert.component';
import { alertStackStyleSheet } from './alert-stack.styles';

/** How long an alert stays before closing by itself, in ms. */
const DEFAULT_DURATION = 5000;
/** How long the gap takes to close after an alert leaves, in ms (matches the stylesheet). */
const COLLAPSE_MS = 200;

/** An alert in the stack: its content, an id, and whether it's still open (false while it animates out). */
export type StackedAlertItem = AlertContent & { id: string; open: boolean };

export type AlertStackProps = {
  alerts: StackedAlertItem[];
  /** Called when an alert should close: its timer ran out, or it was dismissed or swiped away. */
  onDismiss: (id: string) => void;
  /** Called once a closed alert has animated out, to remove it. */
  onRemove: (id: string) => void;
  /** Default 'bottom-right'. */
  position?: AlertPosition;
  /** Follows an alert's action link, e.g. with the app's router. Default: a full page load. */
  onNavigate?: (href: string) => void;
  /** The region's name for screen readers. Default 'Notifications'. */
  label?: string;
};

/** Each position's default entrance and exit: alerts arrive from, and leave towards, the nearest edge. */
function positionAnimation(position: AlertPosition): Animation {
  const [vertical, horizontal] = position.split('-');
  const [entrance, exit] =
    horizontal === 'right'
      ? ['fadeInRight', 'fadeOutRight']
      : horizontal === 'left'
        ? ['fadeInLeft', 'fadeOutLeft']
        : vertical === 'top'
          ? ['fadeInDown', 'fadeOutUp']
          : ['fadeInUp', 'fadeOutDown'];
  return { entrance: { name: entrance, speed: 'fast' }, exit: { name: exit, speed: 'fast' } } as Animation;
}

/**
 * Shows alerts in a corner of the screen (decisions 0056 and 0066), using Radix's toast for timing, pausing on
 * hover, swiping away, the F8 shortcut and screen-reader announcements. Place one at the app root and feed it the
 * global queue with `useAlerts().stackProps` from @inithium/shared-data-access.
 */
export function AlertStack({
  alerts,
  onDismiss,
  onRemove,
  position = 'bottom-right',
  onNavigate = (href) => window.location.assign(href),
  label = 'Notifications',
}: AlertStackProps) {
  const [vertical, horizontal] = position.split('-');
  const swipeDirection = horizontal === 'right' ? 'right' : horizontal === 'left' ? 'left' : vertical === 'top' ? 'up' : 'down';

  return (
    <Toast.Provider swipeDirection={swipeDirection} label={label}>
      {/* React hoists this to <head> and keeps one copy however many stacks render. */}
      <style href="inithium-alert-stack" precedence="default">
        {alertStackStyleSheet}
      </style>
      {alerts.map((alert) => (
        <StackedAlert
          key={alert.id}
          alert={alert}
          defaultAnimation={positionAnimation(position)}
          onDismiss={onDismiss}
          onRemove={onRemove}
          onNavigate={onNavigate}
        />
      ))}
      <Toast.Viewport className="ui-alert-viewport" data-position={position} />
    </Toast.Provider>
  );
}

function StackedAlert({
  alert,
  defaultAnimation,
  onDismiss,
  onRemove,
  onNavigate,
}: {
  alert: StackedAlertItem;
  defaultAnimation: Animation;
  onDismiss: (id: string) => void;
  onRemove: (id: string) => void;
  onNavigate: (href: string) => void;
}) {
  const { id, open, duration = DEFAULT_DURATION, urgent, animation, action, icon, ...content } = alert;
  const [collapsed, setCollapsed] = useState(false);

  return (
    // Radix stays open while the alert animates out; Redux's `open` drives the animation.
    <Toast.Root
      asChild
      open
      duration={duration ?? Infinity}
      type={urgent ? 'foreground' : 'background'}
      onOpenChange={(next) => !next && onDismiss(id)}
    >
      <li className="ui-alert-item" data-collapsed={collapsed ? '' : undefined}>
        <div>
          <Alert
            {...content}
            // Stored icon names are checked for format only; Icon renders an empty box for an unknown one.
            icon={icon as IconName | undefined}
            action={
              action && {
                label: action.label,
                onClick: () => {
                  onNavigate(action.href);
                  onDismiss(id);
                },
              }
            }
            onDismiss={() => onDismiss(id)}
            show={open}
            animation={animation ?? defaultAnimation}
            onExitEnd={() => {
              setCollapsed(true);
              setTimeout(() => onRemove(id), COLLAPSE_MS);
            }}
          />
        </div>
      </li>
    </Toast.Root>
  );
}
