import { useMemo } from 'react';
import { z } from 'zod';
import { memberGrowthRangeSchema, memberGrowthRanges, type MemberGrowth, type MemberGrowthRange } from '@inithium/shared-contracts';
import { useGetMemberGrowthQuery } from '@inithium/shared-data-access';
import { Container, Loader, Select, Text } from '@inithium/shared-ui-components';
import { Chart } from '@inithium/shared-ui-composites';
import type { DashboardWidgetProps } from '../dashboard-widget.types';

export const memberGrowthSettingsSchema = z.object({ range: memberGrowthRangeSchema });
export type MemberGrowthSettings = z.infer<typeof memberGrowthSettingsSchema>;

const RANGE_LABELS: Record<MemberGrowthRange, string> = {
  week: 'Past week',
  month: 'Past month',
  quarter: 'Past quarter',
  'half-year': 'Past 6 months',
  year: 'Past year',
  all: 'All time',
};

const rangeOptions = memberGrowthRanges.map((range) => ({ value: range, label: RANGE_LABELS[range] }));

/** Each period's label on the x axis: 'Oct 21' for days and weeks (the week's Monday), 'Oct 2026' for months. */
function periodLabels(growth: MemberGrowth): string[] {
  const format = new Intl.DateTimeFormat(undefined, growth.unit === 'month' ? { month: 'short', year: 'numeric', timeZone: 'UTC' } : { month: 'short', day: 'numeric', timeZone: 'UTC' });
  return growth.points.map((point) => format.format(new Date(`${point.date}T00:00:00Z`)));
}

/**
 * The Members widget (decision 0120): members (`user` accounts, staff left out) by join date over a range chosen in
 * the widget, as a running total, with the number who joined in the range.
 */
export function MemberGrowthWidget({ settings, onSettingsChange }: DashboardWidgetProps<MemberGrowthSettings>) {
  const tz = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC', []);
  const { data, isFetching, isError } = useGetMemberGrowthQuery({ range: settings.range, tz });
  const labels = useMemo(() => (data ? periodLabels(data) : []), [data]);
  const series = useMemo(() => (data ? [{ label: 'Members', data: data.points.map((point) => point.total) }] : []), [data]);
  const rangeName = RANGE_LABELS[settings.range].toLowerCase();

  return (
    <Container flex={{ direction: 'column', gap: 12 }} flexItem={{ grow: 1 }} minHeight={0}>
      <Container flex={{ direction: 'row', align: 'start', justify: 'between', gap: 12, wrap: 'wrap' }}>
        <Container flex={{ direction: 'column' }}>
          <Text as="p" fontFamily="display" fontSize={32} lineHeight={1.1} textColor={{ color: 'surface', intensity: 950 }}>
            {data ? data.total.toLocaleString() : '–'}
          </Text>
          <Text as="p" fontSize={13} textColor={{ color: 'surface', intensity: 700 }}>
            {data
              ? `${data.total === 1 ? 'member' : 'members'} · +${data.joined.toLocaleString()} ${settings.range === 'all' ? 'all time' : `in the ${rangeName}`}`
              : 'members'}
          </Text>
        </Container>
        <Select
          aria-label="Range"
          options={rangeOptions}
          value={settings.range}
          onValueChange={(range) => onSettingsChange({ range: range as MemberGrowthRange })}
          width={160}
        />
      </Container>
      <Container flexItem={{ grow: 1 }} minHeight={0} flex={{ direction: 'column', justify: 'center' }}>
        {isError ? (
          <Text as="p" align="center" fontSize={14} textColor={{ color: 'surface', intensity: 700 }}>
            Members couldn’t be loaded.
          </Text>
        ) : data ? (
          <Chart label={`Members, ${rangeName}`} labels={labels} series={series} area height="full" />
        ) : (
          isFetching && (
            <Container flex={{ justify: 'center' }}>
              <Loader label="Loading members" />
            </Container>
          )
        )}
      </Container>
    </Container>
  );
}
