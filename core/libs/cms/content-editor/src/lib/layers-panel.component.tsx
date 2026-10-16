import { useEffect, useRef, useState, type DragEvent, type KeyboardEvent } from 'react';
import type { ContentDocument, ContentElement, ContentElementType } from '@inithium/shared-contracts';
import { Button, Container, Icon, Input, Text, Tooltip, type IconName } from '@inithium/shared-ui-components';
import { Menu, type MenuItem } from '@inithium/shared-ui-composites';
import { AddElementMenu } from './add-element-menu.component';
import { childrenOf, elementName, elementType, holdsChildren, layerRows, type LayerRow } from './content-tree.service';

/** Where a dragged element lands relative to the row it's over. */
export type DropPosition = 'before' | 'after' | 'inside';

export type LayersPanelProps = {
  doc: ContentDocument;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  /** Containers whose insides are hidden in the tree. */
  collapsed: ReadonlySet<string>;
  onToggle: (id: string) => void;
  /** Ids of elements with problems, marked in the tree. */
  invalid: ReadonlySet<string>;
  /** The element being renamed, if any. */
  renamingId: string | null;
  onRenameStart: (id: string) => void;
  /** Ends renaming: a new label, `undefined` to clear it, or `null` to keep the old one. */
  onRenameEnd: (id: string, label: string | undefined | null) => void;
  /** Whether a dragged element may land there (`targetId` null: the end of the page). */
  canDrop: (id: string, targetId: string | null, position: DropPosition) => boolean;
  onDrop: (id: string, targetId: string | null, position: DropPosition) => void;
  /** The actions in an element's ⋯ menu. */
  menuFor: (element: ContentElement) => MenuItem[];
  /** Adds an element where new elements go (see `insertionTarget`), or just after an element (a row's +). */
  onAdd: (type: ContentElementType, afterId?: string) => void;
  /** Says where Add puts things, e.g. 'Inside “Card”'. */
  addHint: string;
};

/**
 * The tree's own look (decision 0092: the editor's internals): row actions show on the hovered, focused or selected
 * row; a dragged row fades; drop indicators are a line above or below a row, or an outline around a Container.
 */
const layersStyles = `
[data-layer-row] { position: relative; }
[data-layer-actions] { opacity: 0; transition: opacity 100ms; }
[data-layer-row]:hover [data-layer-actions], [data-layer-row][aria-selected=true] [data-layer-actions],
[data-layer-row]:focus-within [data-layer-actions], [data-layer-actions][data-open] { opacity: 1; }
[data-layer-row]:focus-visible { outline: 2px solid var(--color-primary-500); outline-offset: -2px; }
[data-layer-row][data-dragging] { opacity: 0.4; }
[data-layer-row][data-drop=before]::before, [data-layer-row][data-drop=after]::after {
  content: ''; position: absolute; left: 0; right: 0; height: 2px; border-radius: 1px; background: var(--color-primary-500); pointer-events: none;
}
[data-layer-row][data-drop=before]::before { top: -1px; }
[data-layer-row][data-drop=after]::after { bottom: -1px; }
[data-layer-row][data-drop=inside] { outline: 2px solid var(--color-primary-500); outline-offset: -2px; }
`;

const GUIDE = { color: 'surface', intensity: 500, opacity: 35 } as const;

/**
 * The page builder's Layers (decision 0116): every element as a tree, nested as on the page. Click or use the arrow
 * keys to select (Left and Right collapse, expand and move between levels); drag a row onto another to move it before,
 * after or inside it; each row's ⋯ menu (or Shift+F10) has its actions. The top of the panel adds elements.
 */
export function LayersPanel(props: LayersPanelProps) {
  const { doc, selectedId, onSelect, collapsed, onToggle, invalid, renamingId } = props;
  const rows = layerRows(doc.elements, collapsed);
  const rowRefs = useRef(new Map<string, HTMLElement>());
  const focusNext = useRef<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [drop, setDrop] = useState<{ id: string | null; position: DropPosition } | null>(null);
  const [menuId, setMenuId] = useState<string | null>(null);

  // Keyboard moves focus with the selection; a click elsewhere (e.g. the preview) doesn't steal it.
  useEffect(() => {
    if (!focusNext.current) return;
    rowRefs.current.get(focusNext.current)?.focus();
    focusNext.current = null;
  });

  const select = (id: string | null, focus = true) => {
    if (focus) focusNext.current = id;
    onSelect(id);
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.altKey || event.ctrlKey || event.metaKey || (event.target as HTMLElement).closest('input')) return;
    const index = rows.findIndex((row) => row.element.id === selectedId);
    const row = rows[index];
    const hasChildren = row ? childrenOf(row.element).length > 0 : false;
    const go = (target: LayerRow | undefined) => target && select(target.element.id);
    switch (event.key) {
      case 'ArrowDown':
        go(index < 0 ? rows[0] : rows[index + 1]);
        break;
      case 'ArrowUp':
        go(index < 0 ? rows.at(-1) : rows[index - 1]);
        break;
      case 'Home':
        go(rows[0]);
        break;
      case 'End':
        go(rows.at(-1));
        break;
      case 'ArrowRight':
        if (!row || !hasChildren) return;
        if (collapsed.has(row.element.id)) onToggle(row.element.id);
        else go(rows[index + 1]);
        break;
      case 'ArrowLeft':
        if (!row) return;
        if (hasChildren && !collapsed.has(row.element.id)) onToggle(row.element.id);
        else if (row.parentId) select(row.parentId);
        break;
      case 'F2':
        if (row) props.onRenameStart(row.element.id);
        break;
      case 'ContextMenu':
        if (row) setMenuId(row.element.id);
        break;
      case 'F10':
        if (!event.shiftKey || !row) return;
        setMenuId(row.element.id);
        break;
      default:
        return;
    }
    event.preventDefault();
    event.stopPropagation();
  };

  // --- Dragging ---

  const endDrag = () => {
    setDragId(null);
    setDrop(null);
  };

  const dragOver = (event: DragEvent, targetId: string | null, element?: ContentElement) => {
    if (!dragId) return;
    let position: DropPosition = 'after';
    if (element) {
      const box = event.currentTarget.getBoundingClientRect();
      const y = (event.clientY - box.top) / box.height;
      position = holdsChildren(element) ? (y < 0.25 ? 'before' : y > 0.75 ? 'after' : 'inside') : y < 0.5 ? 'before' : 'after';
    }
    if (!props.canDrop(dragId, targetId, position)) {
      if (drop) setDrop(null);
      return;
    }
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    if (drop?.id !== targetId || drop.position !== position) setDrop({ id: targetId, position });
  };

  const dropHere = (event: DragEvent) => {
    event.preventDefault();
    if (dragId && drop) props.onDrop(dragId, drop.id, drop.position);
    endDrag();
  };

  return (
    <Container flex={{ direction: 'column', gap: 12 }}>
      <style>{layersStyles}</style>
      <Container flex={{ direction: 'row', align: 'center', justify: 'between', gap: 8 }}>
        <Text as="h2" fontSize={13} fontWeight={600} letterSpacing={0.5} textColor={{ color: 'surface', intensity: 700 }}>
          LAYERS
        </Text>
        <AddElementMenu where={props.addHint} onAdd={(type) => props.onAdd(type)} align="end">
          <Button leadingIcon="plus">Add</Button>
        </AddElementMenu>
      </Container>
      <Text as="p" fontSize={13} textColor={{ color: 'surface', intensity: 700 }}>
        Adds {props.addHint.charAt(0).toLowerCase() + props.addHint.slice(1)}.
      </Text>

      {rows.length === 0 ? (
        <Container
          flex={{ direction: 'column', align: 'center', gap: 10 }}
          padding={{ x: 16, y: 24 }}
          radius={{ all: 8 }}
          borderWidth={{ all: 2 }}
          borderStyle="dashed"
          borderColor={{ color: 'surface', intensity: 500, opacity: 50 }}
        >
          <Icon name="layout-template" size={28} />
          <Text as="p" fontWeight={600}>
            This page is empty
          </Text>
          <Text as="p" fontSize={13} align="center" textColor={{ color: 'surface', intensity: 700 }}>
            Start with a Container to hold things, or add Text, an Image or a Button straight onto the page.
          </Text>
          <AddElementMenu where="On the page" onAdd={(type) => props.onAdd(type)} align="center">
            <Button leadingIcon="plus">Add your first element</Button>
          </AddElementMenu>
        </Container>
      ) : (
        <Container as="ul" role="tree" aria-label="Layers" flex={{ direction: 'column', gap: 1 }} onKeyDown={handleKeyDown}>
          {rows.map((row, index) => {
            const { element, depth } = row;
            const id = element.id;
            const selected = id === selectedId;
            const name = elementName(element);
            const type = elementType(element);
            const children = childrenOf(element);
            const open = !collapsed.has(id);
            // One row in the tab order: the selected one, or the first.
            const focusable = selectedId ? selected : index === 0;
            return (
              <Container
                as="li"
                key={id}
                ref={(node: HTMLElement | null) => {
                  if (node) rowRefs.current.set(id, node);
                  else rowRefs.current.delete(id);
                }}
                role="treeitem"
                aria-level={depth + 1}
                aria-selected={selected}
                aria-expanded={children.length ? open : undefined}
                aria-label={`${name}, ${type.label}`}
                tabIndex={focusable ? 0 : -1}
                data-layer-row=""
                data-dragging={dragId === id ? '' : undefined}
                data-drop={drop?.id === id ? drop.position : undefined}
                draggable={renamingId !== id}
                onDragStart={(event: DragEvent) => {
                  event.dataTransfer.setData('text/plain', id);
                  event.dataTransfer.effectAllowed = 'move';
                  setDragId(id);
                }}
                onDragOver={(event: DragEvent) => dragOver(event, id, element)}
                onDrop={dropHere}
                onDragEnd={endDrag}
                onClick={() => select(id)}
                onDoubleClick={() => props.onRenameStart(id)}
                flex={{ direction: 'row', align: 'stretch' }}
                minHeight={32}
                padding={{ right: 2 }}
                radius={{ all: 6 }}
                bgColor={selected ? { color: 'primary', intensity: 100 } : { base: 'transparent', hover: { color: 'surface', intensity: 300 } }}
                textColor={selected ? { color: 'primary', intensity: 800 } : { color: 'surface', intensity: 900 }}
              >
                {/* A guide line for each level above, so nesting reads at a glance. */}
                {Array.from({ length: depth }, (_, level) => (
                  <Container key={level} width={16} flexItem={{ shrink: 0 }} aria-hidden="true">
                    <Container width={9} height="full" borderWidth={{ right: 1 }} borderColor={GUIDE} />
                  </Container>
                ))}
                <Container flex={{ direction: 'row', align: 'center', gap: 6 }} flexItem={{ grow: 1, basis: 0 }} minWidth={0} padding={{ left: 2 }}>
                  {children.length ? (
                    <Button
                      variant="ghost"
                      color={{ color: 'surface', intensity: 800 }}
                      leadingIcon={open ? 'chevron-down' : 'chevron-right'}
                      aria-label={open ? `Collapse ${name}` : `Expand ${name}`}
                      tabIndex={-1}
                      padding={{ x: 2 }}
                      onClick={(event) => {
                        event.stopPropagation();
                        onToggle(id);
                      }}
                    />
                  ) : (
                    <Container width={24} flexItem={{ shrink: 0 }} aria-hidden="true" />
                  )}
                  <Icon name={type.icon as IconName} size={16} />
                  {renamingId === id ? (
                    <RenameField
                      initial={element.label ?? ''}
                      placeholder={name}
                      onDone={(label) => {
                        focusNext.current = id;
                        props.onRenameEnd(id, label);
                      }}
                    />
                  ) : (
                    <Container flexItem={{ grow: 1, basis: 0 }} minWidth={0}>
                      <Text as="span" fontSize={14} fontWeight={selected ? 600 : 500} truncate={1}>
                        {name}
                      </Text>
                    </Container>
                  )}
                  {invalid.has(id) && (
                    <Tooltip content="This has problems to fix before it can be saved">
                      <Container flex={{ align: 'center' }} textColor={{ color: 'red', intensity: 600 }} aria-label="Has problems">
                        <Icon name="circle-alert" size={16} />
                      </Container>
                    </Tooltip>
                  )}
                </Container>
                <Container data-layer-actions="" data-open={menuId === id ? '' : undefined} flex={{ direction: 'row', align: 'center', gap: 2 }} flexItem={{ shrink: 0 }}>
                  <Container flex={{ align: 'center' }} textColor={{ color: 'surface', intensity: 600 }} aria-hidden="true">
                    <Icon name="grip-vertical" size={16} />
                  </Container>
                  <AddElementMenu where={`After “${name}”`} onAdd={(type) => props.onAdd(type, id)} align="end">
                    <Button
                      variant="ghost"
                      color={{ color: 'surface', intensity: 800 }}
                      leadingIcon="plus"
                      aria-label={`Add after ${name}`}
                      tabIndex={-1}
                      padding={{ x: 4 }}
                      onClick={(event) => event.stopPropagation()}
                    />
                  </AddElementMenu>
                  <Menu
                    items={props.menuFor(element)}
                    aria-label={`Actions for ${name}`}
                    align="end"
                    open={menuId === id}
                    onOpenChange={(next) => setMenuId(next ? id : null)}
                  >
                    <Button
                      variant="ghost"
                      color={{ color: 'surface', intensity: 800 }}
                      leadingIcon="ellipsis"
                      aria-label={`Actions for ${name}`}
                      tabIndex={-1}
                      padding={{ x: 4 }}
                      onClick={(event) => event.stopPropagation()}
                    />
                  </Menu>
                </Container>
              </Container>
            );
          })}
        </Container>
      )}

      {/* While dragging: a place to drop at the end of the page. */}
      {dragId && (
        <Container
          onDragOver={(event: DragEvent) => dragOver(event, null)}
          onDrop={dropHere}
          padding={{ all: 12 }}
          radius={{ all: 6 }}
          borderWidth={{ all: 2 }}
          borderStyle="dashed"
          borderColor={drop && drop.id === null ? { color: 'primary', intensity: 500 } : { color: 'surface', intensity: 500, opacity: 50 }}
        >
          <Text as="p" fontSize={13} align="center" textColor={{ color: 'surface', intensity: 700 }}>
            Drop here to move it to the end of the page
          </Text>
        </Container>
      )}
    </Container>
  );
}

/** Renaming a row: Enter or leaving keeps the name (empty clears it), Escape cancels. */
function RenameField({ initial, placeholder, onDone }: { initial: string; placeholder: string; onDone: (label: string | undefined | null) => void }) {
  const [value, setValue] = useState(initial);
  const done = useRef(false);
  const finish = (label: string | undefined | null) => {
    if (done.current) return;
    done.current = true;
    onDone(label);
  };
  return (
    <Container flexItem={{ grow: 1, basis: 0 }} minWidth={0} onClick={(event) => event.stopPropagation()}>
      <Input
        aria-label="Name"
        value={value}
        placeholder={placeholder}
        maxLength={60}
        autoFocus
        onChange={(event) => setValue(event.target.value)}
        onBlur={() => finish(value.trim() || undefined)}
        onKeyDown={(event) => {
          event.stopPropagation();
          if (event.key === 'Enter') finish(value.trim() || undefined);
          if (event.key === 'Escape') finish(null);
        }}
      />
    </Container>
  );
}
