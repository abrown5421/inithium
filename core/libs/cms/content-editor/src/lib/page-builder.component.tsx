import { useCallback, useMemo, useRef, useState, type KeyboardEvent, type MouseEvent, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Editor } from '@tiptap/react';
import {
  contentDocumentSchema,
  emptyContentDocument,
  pathHasParams,
  readContentDocument,
  type ContentDocument,
  type ContentElement,
  type ContentElementType,
  type Page,
} from '@inithium/shared-contracts';
import { ContentRenderer, type ContentDecorators, type ContentLinks } from '@inithium/shared-content';
import { useAlerts } from '@inithium/shared-data-access';
import { Button, Container, Icon, Text, Tooltip, type IconName } from '@inithium/shared-ui-components';
import type { MenuItem } from '@inithium/shared-ui-composites';
import {
  copyElement,
  createElement,
  elementName,
  elementType,
  findElement,
  holdsChildren,
  insertElement,
  insertionTarget,
  isWithin,
  limitProblem,
  moveElement,
  moveElementBy,
  removeElement,
  updateElement,
  type InsertTarget,
} from './content-tree.service';
import { LayersPanel, type DropPosition } from './layers-panel.component';
import { MoveToDialog } from './move-to-dialog.component';
import { PreviewFrame } from './preview-frame.component';
import { RichTextEditor } from './rich-text-editor.component';
import { RichTextToolbar } from './rich-text-toolbar.component';
import { useContentHistory } from './use-content-history.hook';

/** The editor's colours (decisions 0094, 0096): surface 200 panels and toolbar around a surface 950 canvas. */
const CANVAS = { color: 'surface', intensity: 950 } as const;
const PANEL = { color: 'surface', intensity: 200 } as const;
const DIVIDER = { color: 'surface', intensity: 500, opacity: 30 } as const;

type Device = 'desktop' | 'tablet' | 'phone';
const DEVICES: { value: Device; label: string; icon: IconName; width: number | 'full' }[] = [
  { value: 'desktop', label: 'Desktop', icon: 'monitor', width: 'full' },
  { value: 'tablet', label: 'Tablet (768px)', icon: 'tablet', width: 768 },
  { value: 'phone', label: 'Phone (390px)', icon: 'smartphone', width: 390 },
];

/**
 * Outlines in the preview (decision 0092: the editor's internals; Container has no outline props yet, 0033): the
 * element under the pointer dashed, the selected one solid. Containers are outlined inside their edges, so a
 * full-width one's outline isn't cut off at the frame's sides.
 */
function previewStyles(selectedId: string | null): string {
  const selected = selectedId ? `[data-element-id="${selectedId}"]` : '';
  return `
[data-element-id] { cursor: pointer; }
[data-editor-hover] { outline: 1px dashed color-mix(in oklab, var(--color-primary-500) 70%, transparent); outline-offset: 2px; }
[data-element=container][data-editor-hover] { outline-offset: -1px; }
${selected ? `${selected} { outline: 2px solid var(--color-primary-500); outline-offset: 2px; }
[data-element=container]${selected} { outline-offset: -2px; }
[data-element=text]${selected} { cursor: text; }` : ''}
`;
}

/** Shortcuts as the menus show them. */
const KEYS = { duplicate: 'Ctrl+D', copy: 'Ctrl+C', cut: 'Ctrl+X', paste: 'Ctrl+V', remove: 'Del', up: 'Alt+↑', down: 'Alt+↓', rename: 'F2' };

export type PageBuilderProps = {
  page: Page & { content: NonNullable<Page['content']> };
  /** Every page, for links. */
  pages: Page[];
};

/**
 * The page builder (decision 0116), being built in steps: the element tree in Layers on the left (select, add,
 * duplicate, copy, cut, paste, move by dragging or "Move to…", rename, delete, all with shortcuts), and the preview
 * in the middle, where elements are selected and Text is typed in place. Until properties and saving arrive, it
 * works on a copy of the draft: nothing is saved.
 */
export function PageBuilder({ page, pages }: PageBuilderProps) {
  const navigate = useNavigate();
  const { show: showAlert } = useAlerts();
  const history = useContentHistory<ContentDocument>(readContentDocument(page.content.draft) ?? emptyContentDocument());
  const { doc, change } = history;
  const [selectedState, setSelected] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState<ReadonlySet<string>>(new Set());
  const [clipboard, setClipboard] = useState<ContentElement | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [movingId, setMovingId] = useState<string | null>(null);
  const [device, setDevice] = useState<Device>('desktop');
  const [richEditor, setRichEditor] = useState<Editor | null>(null);
  const hovered = useRef<Element | null>(null);

  // A selection that no longer exists (e.g. after undo) is dropped.
  const selected = selectedState ? findElement(doc, selectedState) : undefined;
  const selectedId = selected ? selectedState : null;

  const invalid = useMemo(() => {
    const parsed = contentDocumentSchema.safeParse(doc);
    const ids = new Set<string>();
    for (const issue of parsed.error?.issues ?? []) {
      // The path runs elements.i.children.j…: the problem belongs to the deepest element on it.
      let elements = doc.elements;
      let owner: ContentElement | undefined;
      for (let step = 0; step < issue.path.length; step += 2) {
        const next = elements[Number(issue.path[step + 1])];
        if (!next) break;
        owner = next;
        if (issue.path[step + 2] !== 'children' || next.type !== 'container') break;
        elements = next.children;
      }
      if (owner) ids.add(owner.id);
    }
    return ids;
  }, [doc]);

  const links = useMemo<ContentLinks>(() => {
    const paths = new Map(pages.filter((entry) => !pathHasParams(entry.path)).map((entry) => [entry.id, entry.path]));
    return { pagePath: (id) => paths.get(id), onNavigate: () => undefined, preview: true };
  }, [pages]);

  /** Selects an element, showing it in the Layers (its Containers expand). */
  const select = useCallback(
    (id: string | null) => {
      setSelected(id);
      const ancestors = id ? (findElement(doc, id)?.ancestors ?? []) : [];
      if (ancestors.some((ancestor) => collapsed.has(ancestor.id))) {
        setCollapsed((current) => new Set([...current].filter((entry) => !ancestors.some((ancestor) => ancestor.id === entry))));
      }
    },
    [doc, collapsed],
  );

  const refuse = (title: string, message: string) => showAlert({ color: 'amber', icon: 'circle-alert', title, message });

  /** Puts an element in a place, unless that breaks the page's limits. */
  const place = (element: ContentElement, target: InsertTarget) => {
    const problem = limitProblem(doc, element, target);
    if (problem) return refuse('That doesn’t fit', problem);
    change(insertElement(doc, element, target));
    select(element.id);
  };

  // --- Actions, shared by the menus and the keyboard ---

  const add = (type: ContentElementType) => place(createElement(type), insertionTarget(doc, selectedId));

  const duplicate = (id: string) => {
    const found = findElement(doc, id);
    if (found) place(copyElement(found.element), { parentId: found.parent?.id ?? null, index: found.index + 1 });
  };

  const copy = (id: string) => {
    const found = findElement(doc, id);
    if (!found) return;
    setClipboard(structuredClone(found.element));
    showAlert({ color: 'primary', icon: 'copy', title: 'Copied', message: `Paste “${elementName(found.element)}” with Ctrl+V.`, duration: 2500 });
  };

  const remove = (id: string, cut = false) => {
    const found = findElement(doc, id);
    if (!found) return;
    if (cut) setClipboard(structuredClone(found.element));
    change(removeElement(doc, id));
    setSelected(found.parent?.id ?? null);
    showAlert({
      color: 'primary',
      icon: cut ? 'scissors' : 'trash-2',
      title: cut ? 'Cut' : 'Deleted',
      message: `${cut ? 'Paste' : 'Bring back'} “${elementName(found.element)}” with ${cut ? 'Ctrl+V' : 'Ctrl+Z'}.`,
      duration: 4000,
    });
  };

  const paste = () => clipboard && place(copyElement(clipboard), insertionTarget(doc, selectedId));

  const move = (id: string, target: InsertTarget) => {
    const found = findElement(doc, id);
    if (!found) return;
    const problem = limitProblem(doc, found.element, target, id);
    if (problem) return refuse('It can’t go there', problem);
    change(moveElement(doc, id, target));
    select(id);
  };

  /** Where a drop lands, as a place. */
  const dropTarget = (targetId: string | null, position: DropPosition): InsertTarget | undefined => {
    if (targetId === null) return { parentId: null, index: doc.elements.length };
    const found = findElement(doc, targetId);
    if (!found) return undefined;
    if (position === 'inside') return holdsChildren(found.element) ? { parentId: targetId, index: found.element.children.length } : undefined;
    return { parentId: found.parent?.id ?? null, index: found.index + (position === 'after' ? 1 : 0) };
  };

  const canDrop = (id: string, targetId: string | null, position: DropPosition) => {
    const target = dropTarget(targetId, position);
    const found = findElement(doc, id);
    if (!target || !found) return false;
    if (target.parentId !== null && isWithin(doc, target.parentId, id)) return false;
    return !limitProblem(doc, found.element, target, id) && moveElement(doc, id, target) !== doc;
  };

  const menuFor = (element: ContentElement): MenuItem[] => {
    const found = findElement(doc, element.id);
    const siblings = found?.parent ? found.parent.children : doc.elements;
    return [
      { label: 'Duplicate', icon: 'copy-plus', shortcut: KEYS.duplicate, onSelect: () => duplicate(element.id) },
      { label: 'Copy', icon: 'copy', shortcut: KEYS.copy, onSelect: () => copy(element.id) },
      { label: 'Cut', icon: 'scissors', shortcut: KEYS.cut, onSelect: () => remove(element.id, true) },
      {
        label: holdsChildren(element) ? 'Paste inside' : 'Paste after',
        icon: 'clipboard-paste',
        shortcut: KEYS.paste,
        disabled: !clipboard,
        onSelect: () => clipboard && place(copyElement(clipboard), insertionTarget(doc, element.id)),
      },
      'separator',
      { label: 'Move up', icon: 'arrow-up', shortcut: KEYS.up, disabled: found?.index === 0, onSelect: () => change(moveElementBy(doc, element.id, -1)) },
      { label: 'Move down', icon: 'arrow-down', shortcut: KEYS.down, disabled: found?.index === siblings.length - 1, onSelect: () => change(moveElementBy(doc, element.id, 1)) },
      { label: 'Move to…', icon: 'move', onSelect: () => setMovingId(element.id) },
      { label: 'Rename', icon: 'pencil', shortcut: KEYS.rename, onSelect: () => setRenamingId(element.id) },
      'separator',
      { label: 'Delete', icon: 'trash-2', shortcut: KEYS.remove, danger: true, onSelect: () => remove(element.id) },
    ];
  };

  // --- The keyboard: anywhere in the builder, except while typing ---

  const handleKeyDown = (event: KeyboardEvent) => {
    const target = event.target as HTMLElement;
    if (target.closest('input, textarea, [contenteditable="true"], [role="menu"], [role="dialog"]')) return;
    const mod = event.ctrlKey || event.metaKey;
    const key = event.key.toLowerCase();
    if (mod && key === 'z' && !event.shiftKey) history.undo();
    else if (mod && ((key === 'z' && event.shiftKey) || key === 'y')) history.redo();
    else if (mod && key === 'v') paste();
    else if (!selectedId) return;
    else if (mod && key === 'd') duplicate(selectedId);
    else if (mod && key === 'c') copy(selectedId);
    else if (mod && key === 'x') remove(selectedId, true);
    else if (key === 'delete' || key === 'backspace') remove(selectedId);
    else if (key === 'escape') select(selected?.parent?.id ?? null);
    else if (event.altKey && key === 'arrowup') change(moveElementBy(doc, selectedId, -1));
    else if (event.altKey && key === 'arrowdown') change(moveElementBy(doc, selectedId, 1));
    else if (key === 'f2') setRenamingId(selectedId);
    else return;
    event.preventDefault();
  };

  // --- The preview: selecting by clicking, outlining what's under the pointer ---

  const elementAt = (event: MouseEvent) => (event.target as Element).closest?.('[data-element-id]') ?? null;
  const handlePreviewClick = (event: MouseEvent) => {
    const id = elementAt(event)?.getAttribute('data-element-id') ?? null;
    if (id !== selectedId) select(id);
  };
  const handlePreviewHover = (event: MouseEvent) => {
    const element = event.type === 'mouseleave' ? null : elementAt(event);
    if (element === hovered.current) return;
    hovered.current?.removeAttribute('data-editor-hover');
    element?.setAttribute('data-editor-hover', '');
    hovered.current = element;
  };

  const editText = useCallback(
    (element: Extract<ContentElement, { type: 'text' }>, next: Extract<ContentElement, { type: 'text' }>['props']['doc']) =>
      change(updateElement(doc, { ...element, props: { ...element.props, doc: next } }), `text:${element.id}`),
    [change, doc],
  );

  const decorators = useMemo<ContentDecorators>(
    () => ({
      // A plugin's element the site can't draw: a placeholder that can still be selected and deleted.
      element: (element, drawn) =>
        drawn ?? (
          <Container
            data-element-id={element.id}
            padding={{ all: 16 }}
            radius={{ all: 8 }}
            borderWidth={{ all: 2 }}
            borderStyle="dashed"
            borderColor={{ color: 'amber', intensity: 500 }}
            textColor={{ color: 'surface', intensity: 800 }}
          >
            <Text as="p" fontSize={14}>
              Missing element: {elementName(element)}. Its plugin isn’t installed or is switched off, so the site leaves it out.
            </Text>
          </Container>
        ),
      body: (element, drawn) =>
        element.type === 'text' && element.id === selectedId ? (
          <RichTextEditor
            doc={element.props.doc}
            align={element.props.align}
            textColor={element.props.textColor}
            typography={element.props.typography}
            headingTypography={element.props.headingTypography}
            titleHeading
            onChange={(next) => editText(element, next)}
            onEditor={setRichEditor}
          />
        ) : (
          drawn
        ),
      children: (container, drawn) =>
        container.children.length > 0 ? (
          drawn
        ) : (
          <Container
            flex={{ direction: 'column', align: 'center', justify: 'center', gap: 4 }}
            flexItem={{ grow: 1 }}
            minHeight={72}
            padding={{ all: 12 }}
            radius={{ all: 6 }}
            borderWidth={{ all: 2 }}
            borderStyle="dashed"
            borderColor={{ color: 'primary', intensity: 500, opacity: 50 }}
            textColor={{ color: 'primary', intensity: 700 }}
          >
            <Icon name="square-dashed" size={18} />
            <Text as="span" fontSize={13} align="center">
              Empty container: select it, then add elements
            </Text>
          </Container>
        ),
    }),
    [selectedId, editText],
  );

  const addHint = selected
    ? holdsChildren(selected.element)
      ? `Adds inside “${elementName(selected.element)}”.`
      : `Adds after “${elementName(selected.element)}”.`
    : 'Adds to the end of the page.';

  let panel: ReactNode = (
    <Text as="p" fontSize={14} textColor={{ color: 'surface', intensity: 700 }}>
      Select an element, in the preview or the Layers, to see where it sits.
    </Text>
  );
  if (selected) {
    const trail = [...selected.ancestors, selected.element];
    panel = (
      <Container flex={{ direction: 'column', gap: 16 }}>
        <Container as="nav" aria-label="Where it sits" flex={{ direction: 'row', align: 'center', wrap: 'wrap', gap: 2 }}>
          <Button variant="link" onClick={() => select(null)}>
            Page
          </Button>
          {trail.map((element) => (
            <Container key={element.id} flex={{ direction: 'row', align: 'center', gap: 2 }}>
              <Icon name="chevron-right" size={14} />
              {element.id === selectedId ? (
                <Text as="span" fontSize={14} fontWeight={600} aria-current="location">
                  {elementName(element)}
                </Text>
              ) : (
                <Button variant="link" onClick={() => select(element.id)}>
                  {elementName(element)}
                </Button>
              )}
            </Container>
          ))}
        </Container>
        <Container flex={{ direction: 'row', align: 'center', gap: 8 }}>
          <Icon name={elementType(selected.element).icon as IconName} size={20} />
          <Text as="p" fontWeight={600}>
            {elementType(selected.element).label}
          </Text>
        </Container>
        <Text as="p" fontSize={14} textColor={{ color: 'surface', intensity: 700 }}>
          Its settings come in the next step of the new builder.
        </Text>
      </Container>
    );
  }

  return (
    <Container flex={{ direction: 'column' }} flexItem={{ grow: 1 }} minHeight={0} bgColor={CANVAS} onKeyDown={handleKeyDown}>
      <Container
        aria-label="Page builder"
        role="region"
        flex={{ direction: 'row', align: 'center', gap: 12, wrap: 'wrap' }}
        padding={{ x: 16, y: 10 }}
        bgColor={PANEL}
        borderWidth={{ bottom: 1 }}
        borderColor={DIVIDER}
        shadow="lg"
        position={{ type: 'relative', z: 2 }}
      >
        <Tooltip content="Back to Pages">
          <Button leadingIcon="arrow-left" aria-label="Back to Pages" padding={{ x: 6 }} onClick={() => navigate('/pages')} />
        </Tooltip>
        <Container flex={{ direction: 'column' }} minWidth={0} flexItem={{ grow: 1, basis: 0 }}>
          <Text as="h1" fontFamily="display" fontSize={18} truncate={1}>
            {page.title}
          </Text>
          <Text as="span" fontSize={12} textColor={{ color: 'amber', intensity: 700 }}>
            Trying the new page builder: changes here aren’t saved yet.
          </Text>
        </Container>
        <Container flex={{ direction: 'row', gap: 2 }} role="group" aria-label="Preview width">
          {DEVICES.map((entry) => (
            <Tooltip key={entry.value} content={entry.label}>
              <Button
                variant={device === entry.value ? 'filled' : 'ghost'}
                leadingIcon={entry.icon}
                aria-label={`Preview: ${entry.label}`}
                aria-pressed={device === entry.value}
                padding={{ x: 6 }}
                onClick={() => setDevice(entry.value)}
              />
            </Tooltip>
          ))}
        </Container>
        <Container flex={{ direction: 'row', gap: 2 }}>
          <Tooltip content="Undo (Ctrl+Z)">
            <Button variant="ghost" leadingIcon="undo-2" aria-label="Undo" padding={{ x: 6 }} disabled={!history.canUndo} onClick={history.undo} />
          </Tooltip>
          <Tooltip content="Redo (Ctrl+Shift+Z)">
            <Button variant="ghost" leadingIcon="redo-2" aria-label="Redo" padding={{ x: 6 }} disabled={!history.canRedo} onClick={history.redo} />
          </Tooltip>
        </Container>
        <Button variant="outlined" leadingIcon="square-pen" onClick={() => navigate(`/pages/${page.id}/content`)}>
          Open the current editor
        </Button>
      </Container>

      <Container hidden={{ base: false, lg: true }} padding={{ all: 24 }}>
        <Text as="p">The page builder needs a wider window. Widen it, or open the CMS on a larger screen.</Text>
      </Container>
      <Container hidden={{ base: true, lg: false }} flex={{ direction: 'row' }} flexItem={{ grow: 1 }} minHeight={0}>
        <Container
          as="aside"
          aria-label="Layers"
          width={340}
          flexItem={{ shrink: 0 }}
          overflow={{ y: 'auto' }}
          padding={{ all: 16 }}
          bgColor={PANEL}
          borderWidth={{ right: 1 }}
          borderColor={DIVIDER}
          shadow="2xl"
          position={{ type: 'relative', z: 1 }}
        >
          <LayersPanel
            doc={doc}
            selectedId={selectedId}
            onSelect={select}
            collapsed={collapsed}
            onToggle={(id) =>
              setCollapsed((current) => {
                const next = new Set(current);
                if (!next.delete(id)) next.add(id);
                return next;
              })
            }
            invalid={invalid}
            renamingId={renamingId}
            onRenameStart={setRenamingId}
            onRenameEnd={(id, label) => {
              setRenamingId(null);
              const found = findElement(doc, id);
              if (!found || label === null || label === found.element.label) return;
              const next = { ...found.element, label };
              if (label === undefined) delete next.label;
              change(updateElement(doc, next));
            }}
            canDrop={canDrop}
            onDrop={(id, targetId, position) => {
              const target = dropTarget(targetId, position);
              if (target) move(id, target);
            }}
            menuFor={menuFor}
            onAdd={add}
            addHint={addHint}
          />
        </Container>

        <Container flex={{ direction: 'column' }} flexItem={{ grow: 1, basis: 0 }} minWidth={0} bgColor={CANVAS}>
          <Container flex={{ direction: 'row', align: 'center', gap: 8 }} minHeight={52} padding={{ x: 16, y: 8 }}>
            {richEditor ? (
              <RichTextToolbar editor={richEditor} pages={pages} color={{ color: 'surface', intensity: 100 }} titleHeading />
            ) : (
              <Text as="span" fontSize={13} textColor={{ color: 'surface', intensity: 300 }}>
                Click an element to select it. Click a selected Text to type in it.
              </Text>
            )}
          </Container>
          <Container flex={{ direction: 'row', justify: 'center' }} flexItem={{ grow: 1, basis: 0 }} minHeight={0} padding={{ all: 16 }}>
            <Container height="full" width={DEVICES.find((entry) => entry.value === device)?.width ?? 'full'} maxWidth="full" shadow="2xl" radius={{ all: 6 }} overflow={{ all: 'hidden' }}>
              <PreviewFrame width="full" title={`Preview of ${page.title}`}>
                <Container
                  minHeight="screen"
                  bgColor={page.bgColor ?? { color: 'surface', intensity: 50 }}
                  textColor={page.textColor ?? { color: 'surface', intensity: 950 }}
                  onClick={handlePreviewClick}
                  onMouseOver={handlePreviewHover}
                  onMouseLeave={handlePreviewHover}
                >
                  <style>{previewStyles(selectedId)}</style>
                  {doc.elements.length === 0 ? (
                    <Container padding={{ all: 48 }}>
                      <Text as="p" align="center" textColor={{ color: 'surface', intensity: 700 }}>
                        This page is empty. Add an element from the Layers on the left.
                      </Text>
                    </Container>
                  ) : (
                    <ContentRenderer content={doc} links={links} decorators={decorators} />
                  )}
                </Container>
              </PreviewFrame>
            </Container>
          </Container>
        </Container>

        <Container
          as="aside"
          aria-label="Properties"
          width={340}
          flexItem={{ shrink: 0 }}
          overflow={{ y: 'auto' }}
          padding={{ all: 16 }}
          bgColor={PANEL}
          borderWidth={{ left: 1 }}
          borderColor={DIVIDER}
          shadow="2xl"
          position={{ type: 'relative', z: 1 }}
        >
          <Container flex={{ direction: 'column', gap: 16 }}>
            <Text as="h2" fontSize={13} fontWeight={600} letterSpacing={0.5} textColor={{ color: 'surface', intensity: 700 }}>
              PROPERTIES
            </Text>
            {panel}
          </Container>
        </Container>
      </Container>

      <MoveToDialog
        doc={doc}
        elementId={movingId}
        onClose={() => setMovingId(null)}
        onMove={(parentId) => {
          const id = movingId;
          setMovingId(null);
          if (!id) return;
          const parent = parentId ? findElement(doc, parentId)?.element : undefined;
          move(id, { parentId, index: parent && holdsChildren(parent) ? parent.children.length : doc.elements.length });
        }}
      />
    </Container>
  );
}
