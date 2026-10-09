import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import type { Animation, AutoIncrementingListSerializableProps } from '@inithium/shared-contracts';
import { Button, Container, Text, Tooltip, type AnimationRuntimeProps } from '@inithium/shared-ui-components';
import { autoIncrementingListStyleSheet } from './auto-incrementing-list.styles';

/** How long a removed row takes to collapse, in ms (matches the stylesheet). */
const COLLAPSE_MS = 200;
/** What gets focus in a row: its first focusable element. */
const FOCUSABLE = 'input, select, textarea, button, [href], [tabindex]:not([tabindex="-1"])';
/** Rows added with + fade in from above; every row fades out when removed. */
const ADDED_ROW: Animation = { entrance: { name: 'fadeInDown', speed: 'faster' }, exit: { name: 'fadeOut', speed: 'faster' } };
const ROW: Animation = { exit: { name: 'fadeOut', speed: 'faster' } };

// Rows need stable keys even when items are plain values, so the list numbers them itself.
let lastRowId = 0;
const newRowId = () => `row-${++lastRowId}`;

/** Matches a row id list to a new item count: keeps existing ids, adds or drops at the end. */
const fitIds = (ids: string[], count: number) =>
  ids.length >= count ? ids.slice(0, count) : [...ids, ...Array.from({ length: count - ids.length }, newRowId)];

const capitalise = (text: string) => text[0].toUpperCase() + text.slice(1);

export type AutoIncrementingListProps<T> = AutoIncrementingListSerializableProps &
  AnimationRuntimeProps & {
    /** The items. With `items`, the list is controlled; otherwise it holds its own, starting from `defaultItems`. */
    items?: T[];
    defaultItems?: T[];
    /** Called with the new array when an item is added, removed or updated. */
    onItemsChange?: (items: T[]) => void;
    /** Makes the item the + button adds (and the first one, when the list starts empty). */
    createItem: () => T;
    /** Draws one item. Call `update` with a new value to replace it. */
    renderItem: (item: T, index: number, update: (next: T) => void) => ReactNode;
    /** Marks the list invalid. A message replaces helperText while shown. Changing the list hides it. */
    error?: boolean | string;
  };

/**
 * A list that grows and shrinks one row at a time (decision 0070): each row shows any content, a minus button to
 * remove it (hidden at `min`), and on the last row a plus button to add one after it (hidden at `max`). Rows animate
 * in and out, focus follows the change, and screen readers hear it.
 */
export function AutoIncrementingList<T>({
  items,
  defaultItems,
  onItemsChange,
  createItem,
  renderItem,
  label,
  helperText,
  error,
  min = 1,
  max,
  addColor = 'primary',
  removeColor = 'red',
  itemLabel = 'item',
  align = 'end',
  margin,
  padding,
  animation,
  show,
  replay,
  onEntranceEnd,
  onExitEnd,
}: AutoIncrementingListProps<T>) {
  const labelId = useId();
  const root = useRef<HTMLElement>(null);
  // The row to focus after the next change, by position.
  const focusIndex = useRef<number | null>(null);

  const [own, setOwn] = useState<T[]>(() => (defaultItems?.length ? defaultItems : [createItem()]));
  const list = items ?? own;
  const [ids, setIds] = useState<string[]>(() => list.map(newRowId));
  // If the items change from outside (a controlled list), keep one id per item.
  if (ids.length !== list.length) setIds(fitIds(ids, list.length));

  const [added, setAdded] = useState<string[]>([]);
  const [leaving, setLeaving] = useState<string[]>([]);
  const [collapsed, setCollapsed] = useState<string[]>([]);
  const [announcement, setAnnouncement] = useState('');

  // Errors hide once the list changes, until `error` changes again.
  const [errorHidden, setErrorHidden] = useState(false);
  const [previousError, setPreviousError] = useState(error);
  if (error !== previousError) {
    setPreviousError(error);
    setErrorHidden(false);
  }

  // The latest items and ids, for removals that finish after an animation.
  const latest = useRef({ list, ids });
  useEffect(() => {
    latest.current = { list, ids };
  });

  // A controlled list that starts empty gets its first item.
  useEffect(() => {
    if (items?.length === 0) onItemsChange?.([createItem()]);
  }, [items, onItemsChange, createItem]);

  // Move focus into the row the last change pointed at.
  useEffect(() => {
    if (focusIndex.current === null) return;
    const rows = root.current?.querySelectorAll<HTMLElement>('[data-row]');
    rows?.[focusIndex.current]?.querySelector<HTMLElement>(FOCUSABLE)?.focus();
    focusIndex.current = null;
  }, [ids]);

  const commit = (nextList: T[], nextIds: string[]) => {
    setIds(nextIds);
    if (!items) setOwn(nextList);
    setErrorHidden(true);
    onItemsChange?.(nextList);
  };

  const add = () => {
    const id = newRowId();
    focusIndex.current = list.length;
    setAdded((current) => [...current, id]);
    commit([...list, createItem()], [...ids, id]);
    setAnnouncement(`${capitalise(itemLabel)} added`);
  };

  const finishRemoving = (id: string) => {
    const { list: currentList, ids: currentIds } = latest.current;
    const index = currentIds.indexOf(id);
    if (index === -1) return;
    focusIndex.current = Math.min(index, currentList.length - 2);
    commit(
      currentList.filter((_, position) => position !== index),
      currentIds.filter((rowId) => rowId !== id),
    );
    setLeaving((current) => current.filter((rowId) => rowId !== id));
    setCollapsed((current) => current.filter((rowId) => rowId !== id));
    setAdded((current) => current.filter((rowId) => rowId !== id));
    setAnnouncement(`${capitalise(itemLabel)} ${index + 1} removed`);
  };

  const update = (index: number, next: T) => commit(list.map((item, position) => (position === index ? next : item)), ids);

  const remaining = list.length - leaving.length;
  const canAdd = max === undefined || remaining < max;
  const canRemove = remaining > min;
  // The + goes on the last row that isn't on its way out.
  const lastIndex = ids.reduce((last, id, index) => (leaving.includes(id) ? last : index), -1);
  const helper = !errorHidden && typeof error === 'string' ? error : helperText;

  return (
    <>
      {/* React hoists this to <head> and keeps one copy however many lists render. */}
      <style href="inithium-auto-incrementing-list" precedence="default">
        {autoIncrementingListStyleSheet}
      </style>
      <Container
        ref={root}
        flex={{ direction: 'column' }}
        margin={margin}
        padding={padding}
        animation={animation}
        show={show}
        replay={replay}
        onEntranceEnd={onEntranceEnd}
        onExitEnd={onExitEnd}
      >
        {label && (
          <Text as="span" id={labelId} fontSize={14} fontWeight={600} margin={{ bottom: 8 }}>
            {label}
          </Text>
        )}
        <ul className="ui-auto-list" aria-labelledby={label ? labelId : undefined}>
          {list.map((item, index) => {
            const id = ids[index];
            if (!id) return null;
            const isLeaving = leaving.includes(id);
            return (
              <li key={id} className="ui-auto-list-row" data-row="" data-collapsed={collapsed.includes(id) ? '' : undefined}>
                <div>
                  <Container
                    flex={{ align: align === 'end' ? 'end' : 'center', gap: 8 }}
                    show={!isLeaving}
                    animation={added.includes(id) ? ADDED_ROW : ROW}
                    onExitEnd={() => {
                      setCollapsed((current) => [...current, id]);
                      setTimeout(() => finishRemoving(id), COLLAPSE_MS);
                    }}
                  >
                    <Container flexItem={{ grow: 1 }} minWidth={0}>
                      {renderItem(item, index, (next) => update(index, next))}
                    </Container>
                    {index === lastIndex && canAdd && (
                      <Tooltip content={`Add ${itemLabel}`}>
                        <Button aria-label={`Add ${itemLabel}`} leadingIcon="plus" color={addColor} padding={{ x: 6 }} onClick={add} />
                      </Tooltip>
                    )}
                    {canRemove && !isLeaving && (
                      <Tooltip content={`Remove ${itemLabel} ${index + 1}`}>
                        <Button
                          aria-label={`Remove ${itemLabel} ${index + 1}`}
                          leadingIcon="minus"
                          color={removeColor}
                          padding={{ x: 6 }}
                          onClick={() => setLeaving((current) => [...current, id])}
                        />
                      </Tooltip>
                    )}
                  </Container>
                </div>
              </li>
            );
          })}
        </ul>
        {helper && (
          <Text
            as="span"
            fontSize={12}
            margin={{ top: 4 }}
            textColor={!errorHidden && error ? { color: 'red', intensity: 500 } : { color: 'surface', intensity: 600 }}
          >
            {helper}
          </Text>
        )}
        <span className="ui-auto-list-announcer" aria-live="polite">
          {announcement}
        </span>
      </Container>
    </>
  );
}
