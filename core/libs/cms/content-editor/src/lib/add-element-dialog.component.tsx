import { useState, type KeyboardEvent } from 'react';
import type { ContentElementType, PluginElementType } from '@inithium/shared-contracts';
import { Container, Icon, Input, InputAdornment, Text, type IconName } from '@inithium/shared-ui-components';
import { Modal } from '@inithium/shared-ui-composites';
import { addPickerGroups } from './content-tree.service';

type ElementTypeKey = ContentElementType | PluginElementType;

export type AddElementDialogProps = {
  /** Open while there's somewhere to add to: says where the element goes, e.g. 'Inside “Card”'. Null closes it. */
  where: string | null;
  onAdd: (type: ElementTypeKey) => void;
  onClose: () => void;
};

/**
 * The tiles' focus ring and hover (decision 0092: a tile is a plain <button> around a Container, since Button is a
 * fixed 32px row and can't hold a title with a line under it).
 */
const tileStyles = `
[data-add-tile] { all: unset; display: block; box-sizing: border-box; width: 100%; cursor: pointer; border-radius: 8px; }
[data-add-tile]:focus-visible { outline: 2px solid var(--color-primary-500); outline-offset: 2px; }
`;

/**
 * The page builder's Add picker (decision 0116): a dialog saying where the new element goes, with a search box and
 * every element as a card in its group (registered plugins' included), each with a line about it. Enter in the
 * search adds the first match.
 */
export function AddElementDialog({ where, onAdd, onClose }: AddElementDialogProps) {
  const [query, setQuery] = useState('');
  // Keep the last place while the Modal animates out.
  const [shown, setShown] = useState(where);
  if (where && where !== shown) setShown(where);

  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const groups = addPickerGroups()
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => words.every((word) => `${item.label} ${item.description} ${group.label}`.toLowerCase().includes(word))),
    }))
    .filter((group) => group.items.length > 0);

  const add = (type: ElementTypeKey) => {
    setQuery('');
    onAdd(type);
  };
  const close = () => {
    setQuery('');
    onClose();
  };
  const addFirst = (event: KeyboardEvent) => {
    const first = groups[0]?.items[0];
    if (event.key !== 'Enter' || !first) return;
    event.preventDefault();
    add(first.type);
  };

  return (
    <Modal open={where !== null} onOpenChange={(open) => !open && close()} title="Add an element" description={shown ?? undefined} maxWidth={680}>
      <style>{tileStyles}</style>
      <Container flex={{ direction: 'column', gap: 18 }}>
        <Input
          aria-label="Search elements"
          placeholder="Search, e.g. image or button"
          value={query}
          onValueChange={setQuery}
          onKeyDown={addFirst}
          autoFocus
          startAdornment={<InputAdornment icon="search" />}
        />
        {groups.length === 0 && (
          <Text as="p" textColor={{ color: 'surface', intensity: 700 }}>
            No elements match “{query.trim()}”.
          </Text>
        )}
        {groups.map((group) => (
          <Container as="section" key={group.label} flex={{ direction: 'column', gap: 10 }}>
            <Text as="h3" fontSize={12} fontWeight={600} letterSpacing={0.5} textColor={{ color: 'surface', intensity: 700 }}>
              {group.label.toUpperCase()}
            </Text>
            <Container as="ul" grid={{ columns: { base: 1, sm: 2 }, gap: 10 }} aria-label={group.label}>
              {group.items.map((item) => (
                <Container as="li" key={item.type}>
                  <button type="button" data-add-tile="" onClick={() => add(item.type)}>
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
                        <Icon name={item.icon as IconName} size={22} />
                      </Container>
                      <Container flex={{ direction: 'column', gap: 2 }} minWidth={0}>
                        <Text as="span" fontWeight={600} textColor={{ color: 'surface', intensity: 900 }}>
                          {item.label}
                        </Text>
                        <Text as="span" fontSize={13} lineHeight={1.4} textColor={{ color: 'surface', intensity: 700 }}>
                          {item.description}
                        </Text>
                      </Container>
                    </Container>
                  </button>
                </Container>
              ))}
            </Container>
          </Container>
        ))}
      </Container>
    </Modal>
  );
}
