import { useState } from 'react';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { MAX_DASHBOARD_WIDGETS, type DashboardWidget } from '@inithium/shared-contracts';
import { useAlerts, useGetCurrentUserQuery, useGetMyDashboardQuery, useSaveMyDashboardMutation } from '@inithium/shared-data-access';
import { hasPermission } from '@inithium/shared-permissions';
import { Container, Icon, Loader, Text } from '@inithium/shared-ui-components';
import { AddWidgetDialog } from './add-widget-dialog.component';
import {
  addWidget,
  DEFAULT_DASHBOARD,
  moveWidget,
  removeWidget,
  resizeWidget,
  shownWidgets,
  updateWidgetSettings,
  widgetSettings,
  widgetWidth,
} from './dashboard-layout.service';
import { dashboardStyleSheet } from './dashboard.styles';
import type { DashboardWidgetDefinition } from './dashboard-widget.types';
import { DashboardWidgetFrame } from './dashboard-widget-frame.component';

export type DashboardScreenProps = {
  /** Every widget the CMS knows: core's (`coreDashboardWidgets`) and the registry's. */
  widgets: readonly DashboardWidgetDefinition[];
};

/**
 * The CMS's landing screen (decisions 0086, 0120): the signed-in user's own dashboard. Widgets sit in a wrapping row
 * at their chosen widths; the add tile always takes the next slot. Every change saves at once.
 */
export function DashboardScreen({ widgets: definitions }: DashboardScreenProps) {
  const { data: user } = useGetCurrentUserQuery();
  const { data, isLoading, isError } = useGetMyDashboardQuery();
  const [save] = useSaveMyDashboardMutation();
  const { show } = useAlerts();
  const [adding, setAdding] = useState(false);

  const allowed = (definition: DashboardWidgetDefinition) => !definition.permission || (user ? hasPermission(user.role, definition.permission) : false);
  const stored = data?.widgets ?? DEFAULT_DASHBOARD;
  const shown = shownWidgets(stored, definitions, allowed);
  const shownIds = new Set(shown.map(({ widget }) => widget.id));
  const isShown = (widget: DashboardWidget) => shownIds.has(widget.id);

  const change = (next: DashboardWidget[]) => {
    save(next)
      .unwrap()
      .catch(() => show({ color: 'red', icon: 'circle-alert', title: 'Your dashboard couldn’t be saved', message: 'Check your connection and try again.', urgent: true }));
  };

  if (isLoading) {
    return (
      <Container flex={{ align: 'center', justify: 'center' }} padding={{ y: 48 }}>
        <Loader label="Loading your dashboard" />
      </Container>
    );
  }

  return (
    <>
      {/* React hoists this to <head> and keeps one copy. */}
      <style href="inithium-cms-dashboard" precedence="default">
        {dashboardStyleSheet}
      </style>
      {/* The sidebar names the screen; the heading is for screen readers, so two rows of widgets fit above the fold. */}
      <VisuallyHidden.Root asChild>
        <h1>Dashboard</h1>
      </VisuallyHidden.Root>
      {isError && (
        <Text as="p" textColor={{ color: 'red', intensity: 600 }} margin={{ bottom: 16 }}>
          Your dashboard couldn’t be loaded, so you’re seeing the default one.
        </Text>
      )}
      {/* Plain list: its cells' widths and heights are calc()s the style props can't express (decision 0092). */}
      <ul className="cms-dashboard" aria-label="Widgets">
        {shown.map(({ widget, definition }, index) => {
          const width = widgetWidth(widget, definition);
          const Widget = definition.component;
          return (
            <li key={widget.id} className="cms-dashboard-cell" data-width={width}>
              <DashboardWidgetFrame
                definition={definition}
                width={width}
                onMoveEarlier={index > 0 ? () => change(moveWidget(stored, widget.id, -1, isShown)) : null}
                onMoveLater={index < shown.length - 1 ? () => change(moveWidget(stored, widget.id, 1, isShown)) : null}
                onResize={(next) => change(resizeWidget(stored, widget.id, next))}
                onRemove={() => change(removeWidget(stored, widget.id))}
              >
                <Widget settings={widgetSettings(widget, definition)} width={width} onSettingsChange={(settings) => change(updateWidgetSettings(stored, widget.id, settings))} />
              </DashboardWidgetFrame>
            </li>
          );
        })}
        {stored.length < MAX_DASHBOARD_WIDGETS && (
          <li className="cms-dashboard-cell" data-width="1/3">
            <button type="button" className="cms-dashboard-add" aria-haspopup="dialog" onClick={() => setAdding(true)}>
              {/* Plain span: the tile's own internals, styled by its stylesheet. */}
              <span className="cms-dashboard-add-plus">
                <Icon name="plus" size={26} />
              </span>
              <Text as="span" fontWeight={600}>
                Add widget
              </Text>
            </button>
          </li>
        )}
      </ul>
      <AddWidgetDialog
        open={adding}
        definitions={definitions.filter(allowed)}
        onAdd={(definition) => {
          setAdding(false);
          change(addWidget(stored, definition));
        }}
        onClose={() => setAdding(false)}
      />
    </>
  );
}
