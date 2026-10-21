import { z } from 'zod';
import type { SetupChecklistItemStatus } from '@inithium/shared-contracts';
import { useAlerts, useGetSetupChecklistQuery, useTickSetupChecklistItemMutation } from '@inithium/shared-data-access';
import { Button, Checkbox, Container, Icon, Loader, Text } from '@inithium/shared-ui-components';
import { useNavigate } from 'react-router-dom';
import type { DashboardWidgetProps } from '../dashboard-widget.types';

export const setupChecklistSettingsSchema = z.object({});
export type SetupChecklistSettings = z.infer<typeof setupChecklistSettingsSchema>;

/**
 * The Setup checklist widget (decision 0120): the steps a new site should take, from core and installed plugins. Steps
 * detected from data tick themselves; the rest are ticked by hand, for the whole site. It stays when everything is
 * done, since new steps may be added later.
 */
export function SetupChecklistWidget(_props: DashboardWidgetProps<SetupChecklistSettings>) {
  const { data, isError } = useGetSetupChecklistQuery();
  const [tick] = useTickSetupChecklistItemMutation();
  const { show } = useAlerts();
  const navigate = useNavigate();

  if (isError) {
    return (
      <Text as="p" fontSize={14} textColor={{ color: 'surface', intensity: 700 }}>
        The checklist couldn’t be loaded.
      </Text>
    );
  }
  if (!data) {
    return (
      <Container flex={{ justify: 'center' }} padding={{ y: 24 }}>
        <Loader label="Loading the checklist" />
      </Container>
    );
  }

  const done = data.items.filter((item) => item.done).length;
  const toggle = (item: SetupChecklistItemStatus, checked: boolean) => {
    tick({ id: item.id, done: checked })
      .unwrap()
      .catch(() => show({ color: 'red', icon: 'circle-alert', title: 'That step couldn’t be saved', message: 'Check your connection and try again.', urgent: true }));
  };
  const goTo = (item: SetupChecklistItemStatus) =>
    item.href && (
      <Button variant="ghost" color={{ color: 'surface', intensity: 800 }} padding={{ x: 6 }} leadingIcon="arrow-right" aria-label={`Go to: ${item.label}`} onClick={() => navigate(item.href ?? '/')} />
    );

  return (
    <Container flex={{ direction: 'column', gap: 12 }}>
      <Container flex={{ direction: 'column', gap: 6 }}>
        <Text as="p" fontSize={13} textColor={{ color: 'surface', intensity: 700 }}>
          {done === data.items.length ? 'All done. New steps will appear here as the site grows.' : `${done} of ${data.items.length} done`}
        </Text>
        <Loader variant="progress" value={data.items.length ? (done / data.items.length) * 100 : 100} width="full" label="Setup progress" />
      </Container>
      <Container as="ul" flex={{ direction: 'column', gap: 4 }} aria-label="Setup steps">
        {data.items.map((item) => (
          <Container as="li" key={item.id} flex={{ direction: 'row', align: 'start', gap: 8 }}>
            <Container flexItem={{ grow: 1 }} minWidth={0}>
              {item.manual ? (
                <Checkbox label={item.label} helperText={item.description} checked={item.done} onCheckedChange={(checked) => toggle(item, checked === true)} />
              ) : (
                <Container flex={{ direction: 'row', align: 'start', gap: 8 }} padding={{ y: 6 }}>
                  <Icon
                    name={item.done ? 'circle-check' : 'circle'}
                    size={18}
                    label={item.done ? 'Done' : 'Not done'}
                    textColor={item.done ? { color: 'primary', intensity: 600 } : { color: 'surface', intensity: 600 }}
                  />
                  <Container flex={{ direction: 'column', gap: 2 }} minWidth={0}>
                    <Text as="span" fontSize={14} textColor={{ color: 'surface', intensity: item.done ? 700 : 900 }}>
                      {item.label}
                    </Text>
                    {item.description && (
                      <Text as="span" fontSize={12} textColor={{ color: 'surface', intensity: 700 }}>
                        {item.description}
                      </Text>
                    )}
                  </Container>
                </Container>
              )}
            </Container>
            {goTo(item)}
          </Container>
        ))}
      </Container>
    </Container>
  );
}
