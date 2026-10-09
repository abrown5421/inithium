import { isValidElement, type ReactElement, type ReactNode } from 'react';
import * as RadixTooltip from '@radix-ui/react-tooltip';
import type { TooltipSerializableProps } from '@inithium/shared-contracts';
import { resolveTooltipStyles } from '../style-props/style-props.service';

/** Space between the element and the bubble, in px. */
const OFFSET = 6;
/** Closest the bubble gets to the window's edge, in px. */
const EDGE_PADDING = 8;

/** Timing shared by every tooltip (decision 0064): wait 500ms before opening; open instantly within 300ms of another. */
const TOOLTIP_DELAY = 500;
const TOOLTIP_SKIP_DELAY = 300;

export type TooltipProps = Omit<TooltipSerializableProps, 'content'> & {
  /** What the tooltip says: text, or any content such as a keyboard shortcut. */
  content: ReactNode;
  /** The element it describes: one element that accepts a ref and events, e.g. a Button or Icon. */
  children: ReactElement;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};

/**
 * A short description shown when its element is hovered or focused (decisions 0056 and 0064): Radix's accessible
 * tooltip, in a bubble with an arrow, on any side. Wraps the element instead of rendering one. Disabled or loading
 * elements are wrapped in a focusable span, since they send no pointer events.
 */
export function Tooltip({
  content,
  children,
  side = 'top',
  align = 'center',
  color,
  delay,
  arrow = true,
  open,
  defaultOpen,
  onOpenChange,
}: TooltipProps) {
  const props = isValidElement<{ disabled?: boolean; loading?: boolean }>(children) ? children.props : {};
  const trigger =
    props.disabled || props.loading ? (
      <span className="ui-tooltip-disabled" tabIndex={0}>
        {children}
      </span>
    ) : (
      children
    );

  return (
    <RadixTooltip.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange} delayDuration={delay}>
      <RadixTooltip.Trigger asChild>{trigger}</RadixTooltip.Trigger>
      <RadixTooltip.Portal>
        <RadixTooltip.Content
          className="ui-tooltip"
          side={side}
          align={align}
          sideOffset={OFFSET}
          collisionPadding={EDGE_PADDING}
          style={resolveTooltipStyles(color)}
        >
          {content}
          {arrow && <RadixTooltip.Arrow className="ui-tooltip-arrow" width={10} height={5} />}
        </RadixTooltip.Content>
      </RadixTooltip.Portal>
    </RadixTooltip.Root>
  );
}

/** Shares tooltip timing across the app. <UiProvider /> renders it, so apps don't need to. */
export function TooltipProvider({ children }: { children: ReactNode }) {
  return (
    <RadixTooltip.Provider delayDuration={TOOLTIP_DELAY} skipDelayDuration={TOOLTIP_SKIP_DELAY}>
      {children}
    </RadixTooltip.Provider>
  );
}
