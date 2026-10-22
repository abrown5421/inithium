import { useState, type KeyboardEvent } from 'react';
import { Container, Icon, Input, InputAdornment, Text } from '@inithium/shared-ui-components';
import { Modal } from '@inithium/shared-ui-composites';
import type { DashboardWidgetDefinition } from './dashboard-widget.types';

export type AddWidgetDialogProps = {
  open: boolean;
  /** Every widget the user may add: core's and installed plugins'. */
  definitions: readonly DashboardWidgetDefinition[];
  onAdd: (definition: DashboardWidgetDefinition) => void;
  onClose: () => void;
};

/**
 * The dashboard's widget picker (decision 0120): a search box and every widget the user may add as a card with a line
 * about it, like the page builder's Add picker. Enter in the search adds the first match.
 */
export function AddWidgetDialog({ open, definitions, onAdd, onClose }: AddWidgetDialogProps) {
  const [query, setQuery] = useState('');
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const matches = definitions.filter((definition) => words.every((word) => `${definition.label} ${definition.description}`.toLowerCase().includes(word)));

  const add = (definition: DashboardWidgetDefinition) => {
    setQuery('');
    onAdd(definition);
  };
  const close = () => {
    setQuery('');
    onClose();
  };
  const addFirst = (event: KeyboardEvent) => {
    const first = matches[0];
    if (event.key !== 'Enter' || !first) return;
    event.preventDefault();
    add(first);
  };

  return (
    <Modal open={open} onOpenChange={(next) => !next && close()} title="Add a widget" description="It goes at the end of your dashboard." maxWidth={680}>
      <Container flex={{ direction: 'column', gap: 18 }}>
        <Input
          aria-label="Search widgets"
          placeholder="Search, e.g. members"
          value={query}
          onValueChange={setQuery}
          onKeyDown={addFirst}
          autoFocus
          startAdornment={<InputAdornment icon="search" />}
        />
        {matches.length === 0 && (
          <Text as="p" textColor={{ color: 'surface', intensity: 700 }}>
            {definitions.length === 0 ? 'There are no widgets you can add.' : `No widgets match “${query.trim()}”.`}
          </Text>
        )}
        <Container as="ul" grid={{ columns: { base: 1, sm: 2 }, gap: 10 }} aria-label="Widgets">
          {matches.map((definition) => (
            <Container as="li" key={definition.type}>
              <button type="button" data-widget-tile="" onClick={() => add(definition)}>
                <Container
                  flex={{ direction: 'row', align: 'start', gap: 12 }}
                  padding={{ all: 12 }}
                  radius={{ all: 8 }}
                  borderWidth={{ all: 1 }}
                  borderColor={{ base: { color: 'surface', intensity: 500, opacity: 40 }, hover: { color: 'primary', intensity: 500 } }}
                  bgColor={{ base: { color: 'surface', intensity: 50 }, hover: { color: 'primary', intensity: 50 } }}
                >
                  <Container
                    flex={{ align: 'center', justify: 'center' }}
                    width={40}
                    height={40}
                    flexItem={{ shrink: 0 }}
                    radius={{ all: 8 }}
                    bgColor={{ color: 'primary', intensity: 100 }}
                    textColor={{ color: 'primary', intensity: 700 }}
                  >
                    <Icon name={definition.icon} size={22} />
                  </Container>
                  <Container flex={{ direction: 'column', gap: 2 }} minWidth={0}>
                    <Text as="span" fontWeight={600} textColor={{ color: 'surface', intensity: 900 }}>
                      {definition.label}
                    </Text>
                    <Text as="span" fontSize={13} lineHeight={1.4} textColor={{ color: 'surface', intensity: 700 }}>
                      {definition.description}
                    </Text>
                  </Container>
                </Container>
              </button>
            </Container>
          ))}
        </Container>
      </Container>
    </Modal>
  );
}
