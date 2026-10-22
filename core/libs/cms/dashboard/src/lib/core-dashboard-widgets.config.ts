import { defineDashboardWidget, type DashboardWidgetDefinition } from './dashboard-widget.types';
import { MemberGrowthWidget, memberGrowthSettingsSchema } from './widgets/member-growth-widget.component';
import { SetupChecklistWidget, setupChecklistSettingsSchema } from './widgets/setup-checklist-widget.component';

/** Core's dashboard widgets (decision 0120), listed before the registry's. Both start on the default dashboard. */
export const coreDashboardWidgets: DashboardWidgetDefinition[] = [
  defineDashboardWidget({
    type: 'member-growth',
    label: 'Members',
    description: 'How many members the site has, and how that’s grown over a range you choose.',
    icon: 'users',
    permission: 'users.view',
    widths: ['1/3', '2/3', '3/4', 'full'],
    defaultWidth: '1/3',
    settingsSchema: memberGrowthSettingsSchema,
    defaultSettings: { range: 'month' },
    component: MemberGrowthWidget,
  }),
  defineDashboardWidget({
    type: 'setup-checklist',
    label: 'Setup checklist',
    description: 'The steps a new site should take: its name, logo, colours, fonts and more.',
    icon: 'list-checks',
    permission: 'settings.edit',
    widths: ['1/4', '1/3', '2/3', '3/4', 'full'],
    defaultWidth: '1/3',
    settingsSchema: setupChecklistSettingsSchema,
    defaultSettings: {},
    component: SetupChecklistWidget,
  }),
];
