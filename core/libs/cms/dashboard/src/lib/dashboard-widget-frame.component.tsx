import { Suspense, type ReactNode } from 'react';
import type { DashboardWidgetWidth } from '@inithium/shared-contracts';
import { Button, Container, Icon, Loader, Text, Tooltip } from '@inithium/shared-ui-components';
import { Menu, type MenuItem } from '@inithium/shared-ui-composites';
import type { DashboardWidgetDefinition } from './dashboard-widget.types';
import { WidgetErrorBoundary } from './widget-error-boundary.component';

const WIDTH_LABELS: Record<DashboardWidgetWidth, string> = {
  '1/4': 'Quarter width',
  '1/3': 'Third width',
  '2/3': 'Two thirds width',
  '3/4': 'Three quarters width',
  full: 'Full width',
};

export type DashboardWidgetFrameProps = {
  definition: DashboardWidgetDefinition;
  width: DashboardWidgetWidth;
  /** Null at either end of the dashboard. */
  onMoveEarlier: (() => void) | null;
  onMoveLater: (() => void) | null;
  onResize: (width: DashboardWidgetWidth) => void;
  onRemove: () => void;
  children: ReactNode;
};

/**
 * A widget's card (decision 0120): its header (icon, title, ← → to swap it with its neighbours, and a menu of its
 * widths and Remove) over its body, which scrolls if it doesn't fit. The body loads and fails on its own.
 */
export function DashboardWidgetFrame({ definition, width, onMoveEarlier, onMoveLater, onResize, onRemove, children }: DashboardWidgetFrameProps) {
  const menu: MenuItem[] = [
    { heading: 'Width' },
    ...definition.widths.map(
      (option): MenuItem => ({
        label: WIDTH_LABELS[option],
        icon: option === width ? 'check' : undefined,
        disabled: option === width,
        onSelect: () => onResize(option),
      }),
    ),
    'separator',
    { label: 'Remove', icon: 'trash-2', danger: true, onSelect: onRemove },
  ];
  const iconButton = { variant: 'ghost', color: { color: 'surface', intensity: 800 }, padding: { x: 6 } } as const;

  return (
    <Container
      as="section"
      aria-label={definition.label}
      flex={{ direction: 'column' }}
      height="full"
      radius={{ all: 12 }}
      borderWidth={{ all: 1 }}
      borderColor={{ color: 'surface', intensity: 500, opacity: 30 }}
      bgColor={{ color: 'surface', intensity: 50 }}
      shadow="sm"
      overflow={{ all: 'hidden' }}
    >
      <Container
        as="header"
        flex={{ direction: 'row', align: 'center', gap: 8 }}
        padding={{ left: 16, right: 8, y: 8 }}
        borderWidth={{ bottom: 1 }}
        borderColor={{ color: 'surface', intensity: 500, opacity: 30 }}
      >
        <Icon name={definition.icon} size={18} textColor={{ color: 'primary', intensity: 600 }} />
        <Container flexItem={{ grow: 1 }} minWidth={0}>
          <Text as="h2" fontSize={15} fontWeight={600} truncate={1} textColor={{ color: 'surface', intensity: 900 }}>
            {definition.label}
          </Text>
        </Container>
        <Tooltip content="Move earlier">
          <Button {...iconButton} leadingIcon="chevron-left" aria-label={`Move ${definition.label} earlier`} disabled={!onMoveEarlier} onClick={() => onMoveEarlier?.()} />
        </Tooltip>
        <Tooltip content="Move later">
          <Button {...iconButton} leadingIcon="chevron-right" aria-label={`Move ${definition.label} later`} disabled={!onMoveLater} onClick={() => onMoveLater?.()} />
        </Tooltip>
        <Menu items={menu} align="end" aria-label={`${definition.label} options`}>
          <Button {...iconButton} leadingIcon="ellipsis" aria-label={`${definition.label} options`} />
        </Menu>
      </Container>
      <Container flexItem={{ grow: 1 }} minHeight={0} overflow={{ y: 'auto' }} padding={{ all: 16 }} flex={{ direction: 'column' }}>
        <WidgetErrorBoundary label={definition.label}>
          <Suspense
            fallback={
              <Container flex={{ align: 'center', justify: 'center' }} flexItem={{ grow: 1 }}>
                <Loader label={`Loading ${definition.label}`} />
              </Container>
            }
          >
            {children}
          </Suspense>
        </WidgetErrorBoundary>
      </Container>
    </Container>
  );
}
