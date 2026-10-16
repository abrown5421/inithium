import { useCallback, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent, type MouseEvent, type ReactNode } from 'react';
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
import { readApiFailure, useAlerts, useDiscardContentDraftMutation, usePublishContentMutation, useSaveContentDraftMutation } from '@inithium/shared-data-access';
import { PageEditor } from '@inithium/cms-pages';
import { Button, Container, Icon, Text, Tooltip, type IconName } from '@inithium/shared-ui-components';
import { Modal, type MenuItem } from '@inithium/shared-ui-composites';
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
  sameContent,
  updateElement,
  type InsertTarget,
} from './content-tree.service';
import { DEVICE_LABELS, DEVICE_WIDTHS, type EditDevice } from './device-values.service';
import { sharingTheRow, stacksOn } from './property-values.service';
import { ElementProperties, type FieldProblems, type PropertiesTab } from './element-properties.component';
import { LayersPanel, type DropPosition } from './layers-panel.component';
import { MoveToDialog } from './move-to-dialog.component';
import { PreviewFrame } from './preview-frame.component';
import { RichTextEditor } from './rich-text-editor.component';
import { RichTextToolbar } from './rich-text-toolbar.component';
import { useAutosave, type SaveStatus } from './use-autosave.hook';
import type { ContentLockState } from './use-content-lock.hook';
import { useContentHistory } from './use-content-history.hook';

/** The editor's colours (decisions 0094, 0096): surface 200 panels and toolbar around a surface 950 canvas. */
const CANVAS = { color: 'surface', intensity: 950 } as const;
const PANEL = { color: 'surface', intensity: 200 } as const;
const DIVIDER = { color: 'surface', intensity: 500, opacity: 30 } as const;

const DEVICES: { value: EditDevice; icon: IconName }[] = [
  { value: 'desktop', icon: 'monitor' },
  { value: 'tablet', icon: 'tablet' },
  { value: 'phone', icon: 'smartphone' },
];

const STATUS: Record<SaveStatus, { label: string; icon: IconName; color: 'surface' | 'red' | 'amber' }> = {
  saved: { label: 'Draft saved', icon: 'cloud-check', color: 'surface' },
  pending: { label: 'Unsaved changes', icon: 'cloud', color: 'surface' },
  saving: { label: 'Saving…', icon: 'cloud-upload', color: 'surface' },
  error: { label: 'Couldn’t save. Retrying on the next change', icon: 'cloud-alert', color: 'red' },
  invalid: { label: 'Fix the marked problems to save', icon: 'circle-alert', color: 'amber' },
};

/** Each problem in the draft, keyed by the element it's in, then by the field's path within it (e.g. 'props.label'). */
function problemsOf(doc: ContentDocument): Map<string, FieldProblems> {
  const parsed = contentDocumentSchema.safeParse(doc);
  const problems = new Map<string, FieldProblems>();
  for (const issue of parsed.error?.issues ?? []) {
    // The path runs elements.i.children.j…: the problem belongs to the deepest element on it.
    let elements = doc.elements;
    let owner: ContentElement | undefined;
    let rest: PropertyKey[] = [];
    for (let step = 0; step < issue.path.length; step += 2) {
      const next = elements[Number(issue.path[step + 1])];
      if (!next) break;
      owner = next;
      rest = issue.path.slice(step + 2);
      if (rest[0] !== 'children' || next.type !== 'container') break;
      elements = next.children;
    }
    if (!owner) continue;
    const found = problems.get(owner.id) ?? {};
    const field = rest.map(String).join('.');
    if (!(field in found)) found[field] = issue.message;
    problems.set(owner.id, found);
  }
  return problems;
}

/**
 * The preview at a device's width, scaled down to fit when the canvas is narrower, so Desktop always shows the
 * desktop layout. The frame's breakpoints follow its own width, not the scaled size.
 */
function ScaledPreview({ width, children }: { width: number; children: ReactNode }) {
  const [box, setBox] = useState<HTMLElement | null>(null);
  const [space, setSpace] = useState({ width: 0, height: 0 });
  useLayoutEffect(() => {
    if (!box) return;
    const observer = new ResizeObserver(([entry]) => entry && setSpace({ width: entry.contentRect.width, height: entry.contentRect.height }));
    observer.observe(box);
    return () => observer.disconnect();
  }, [box]);
  const scale = space.width ? Math.min(1, space.width / width) : 1;
  return (
    <Container ref={setBox} flex={{ direction: 'column', align: 'center', gap: 6 }} flexItem={{ grow: 1, basis: 0 }} minHeight={0} width="full">
      {/* Plain divs: the frame keeps the device's width and is scaled to fit, which no component's props can do (decision 0092). */}
      <div style={{ width: width * scale, height: '100%', flexShrink: 0, borderRadius: 6, overflow: 'hidden', boxShadow: 'var(--shadow-2xl)' }}>
        <div style={{ width, height: space.height / scale, transform: `scale(${scale})`, transformOrigin: 'top left' }}>{children}</div>
      </div>
    </Container>
  );
}

/**
 * Outlines and name tags in the preview (decision 0092: the editor's internals; Container has no outline props yet,
 * 0033): the element under the pointer dashed with its name, the selected one solid with its name. Containers are
 * outlined, and tagged, inside their edges, so a full-width one's isn't cut off at the frame's sides; other elements'
 * tags sit just above them, clear of the text being typed.
 */
function previewStyles(selected: { id: string; name: string } | null): string {
  const target = selected ? `[data-element-id="${selected.id}"]` : '';
  // The name as a CSS string: quotes and backslashes escaped, line breaks dropped.
  const name = selected ? `"${selected.name.replace(/[\\"]/g, '\\$&').replace(/[\r\n]+/g, ' ')}"` : '';
  return `
[data-element-id] { cursor: pointer; }
[data-editor-hover] { position: relative; outline: 1px dashed color-mix(in oklab, var(--color-primary-500) 70%, transparent); outline-offset: 2px; }
[data-element=container][data-editor-hover] { outline-offset: -1px; }
[data-editor-hover]::before, ${target || '[data-editor-none]'}::before {
  position: absolute; top: 0; left: 0; z-index: 20; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  padding: 1px 6px; border-radius: 4px 4px 0 0; pointer-events: none; transform: translateY(-100%);
  font: 500 11px/16px var(--font-body); letter-spacing: 0; text-transform: none; font-style: normal;
  color: var(--color-primary-100); background: color-mix(in oklab, var(--color-primary-500) 85%, transparent);
}
[data-editor-hover]::before { content: attr(data-editor-name); }
[data-element=container][data-editor-hover]::before, [data-element=container]${target || '[data-editor-none]'}::before { transform: none; border-radius: 0 0 4px 0; }
${target ? `${target} { position: relative; outline: 2px solid var(--color-primary-500); outline-offset: 2px; }
${target}::before { content: ${name}; background: var(--color-primary-600); }
[data-element=container]${target} { outline-offset: -2px; }
[data-element=text]${target} { cursor: text; }` : ''}
`;
}

/** Shortcuts as the menus show them. */
const KEYS = { duplicate: 'Ctrl+D', copy: 'Ctrl+C', cut: 'Ctrl+X', paste: 'Ctrl+V', remove: 'Del', up: 'Alt+↑', down: 'Alt+↓', rename: 'F2' };

export type PageBuilderProps = {
  page: Page & { content: NonNullable<Page['content']> };
  /** Every page, for links. */
  pages: Page[];
  canPublish: boolean;
  /** The edit lock this builder session holds (decision 0116), sent with every save, publish and discard. */
  lockId: string;
  /** The lock's state: once it's lost, the builder says so and stops saving. */
  lock: ContentLockState;
  /** Asks for the lock again, e.g. after a save is refused. */
  onLockCheck: () => void;
};

/**
 * The page builder (decision 0116), filling the space under the CMS's top bar: the element tree in Layers on the
 * left (select, add, duplicate, copy, cut, paste, move by dragging or "Move to…", rename, delete, all with
 * shortcuts), the preview in the middle at a device's width (where elements are selected and Text is typed in
 * place), and the selection's properties on the right, edited for the device previewed. The draft autosaves;
 * Publish puts it live and Discard goes back to what's published. Undo and redo work for the session.
 */
export function PageBuilder({ page, pages, canPublish, lockId, lock, onLockCheck }: PageBuilderProps) {
  const navigate = useNavigate();
  const { show: showAlert } = useAlerts();
  const history = useContentHistory<ContentDocument>(readContentDocument(page.content.draft) ?? emptyContentDocument());
  const { doc, change } = history;
  const [selectedState, setSelected] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState<ReadonlySet<string>>(new Set());
  const [clipboard, setClipboard] = useState<ContentElement | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [movingId, setMovingId] = useState<string | null>(null);
  const [device, setDevice] = useState<EditDevice>('desktop');
  const [tab, setTab] = useState<PropertiesTab>('content');
  const [richEditor, setRichEditor] = useState<Editor | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [discarding, setDiscarding] = useState(false);
  const hovered = useRef<Element | null>(null);

  const [saveDraft] = useSaveContentDraftMutation();
  const [publish, publishing] = usePublishContentMutation();
  const [discard, discardState] = useDiscardContentDraftMutation();

  // A selection that no longer exists (e.g. after undo) is dropped.
  const selected = selectedState ? findElement(doc, selectedState) : undefined;
  const selectedId = selected ? selectedState : null;

  const problems = useMemo(() => problemsOf(doc), [doc]);
  const invalid = useMemo(() => new Set(problems.keys()), [problems]);
  const lockLost = lock.status === 'lost';
  const save = useCallback(
    (draft: ContentDocument) =>
      saveDraft({ id: page.id, draft, lockId })
        .unwrap()
        .catch((error: unknown) => {
          // Refused for the lock: find out who has it.
          if (readApiFailure(error).status === 409) onLockCheck();
          throw error;
        }),
    [saveDraft, page.id, lockId, onLockCheck],
  );
  const autosave = useAutosave({ doc, valid: invalid.size === 0 && !lockLost, save });
  const published = page.content.published;
  const unpublishedChanges = !published || !sameContent(published, doc);

  const handlePublish = async () => {
    if (!(await autosave.flush())) {
      showAlert({ color: 'red', icon: 'circle-alert', title: 'We couldn’t publish yet', message: 'Fix the marked problems first, so the draft can save.', urgent: true });
      return;
    }
    try {
      await publish({ id: page.id, lockId }).unwrap();
      showAlert({ color: 'green', icon: 'circle-check', title: 'Published', message: `${page.title} is live at ${page.path}.` });
    } catch (error) {
      showAlert({ color: 'red', icon: 'circle-alert', title: 'We couldn’t publish', message: readApiFailure(error).message ?? 'Something went wrong. Please try again.', urgent: true });
    }
  };

  const handleDiscard = async () => {
    try {
      const result = await discard({ id: page.id, lockId }).unwrap();
      const draft = readContentDocument(result.content?.draft) ?? emptyContentDocument();
      history.reset(draft);
      autosave.markSaved(draft);
      setSelected(null);
      setDiscarding(false);
      showAlert({ color: 'green', icon: 'undo-2', title: 'Changes discarded', message: published ? 'The draft is back to what’s published.' : 'The draft is empty again.' });
    } catch (error) {
      showAlert({ color: 'red', icon: 'circle-alert', title: 'We couldn’t discard the changes', message: readApiFailure(error).message ?? 'Something went wrong.', urgent: true });
    }
  };

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

  const add = (type: ContentElementType, afterId?: string) => {
    const after = afterId ? findElement(doc, afterId) : undefined;
    const target = after ? { parentId: after.parent?.id ?? null, index: after.index + 1 } : insertionTarget(doc, selectedId);
    const parent = target.parentId ? findElement(doc, target.parentId)?.element : undefined;
    const element = createElement(type);
    // A Container added to a row takes an equal share of it, like the ones already there.
    const [placed = element] = parent?.type === 'container' && !stacksOn(parent, 'desktop') && !parent.props.grid ? sharingTheRow([element]) : [element];
    place(placed, target);
  };

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
    // In the properties and the toolbar, keys belong to their controls (Backspace in a field mustn't delete), except undo.
    const inControls = Boolean(target.closest('[data-builder-controls]'));
    if (mod && key === 'z' && !event.shiftKey) history.undo();
    else if (mod && ((key === 'z' && event.shiftKey) || key === 'y')) history.redo();
    else if (inControls) return;
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
    // The selected element shows its own tag; another under the pointer shows its name as it's outlined.
    const id = element?.getAttribute('data-element-id');
    const found = id && id !== selectedId ? findElement(doc, id) : undefined;
    if (element && found) {
      element.setAttribute('data-editor-name', elementName(found.element));
      element.setAttribute('data-editor-hover', '');
    }
    hovered.current = found ? element : null;
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
      ? `Inside “${elementName(selected.element)}”`
      : `After “${elementName(selected.element)}”`
    : 'At the end of the page';

  let panel: ReactNode = (
    <Text as="p" fontSize={14} textColor={{ color: 'surface', intensity: 700 }}>
      Select an element, in the preview or the Layers, to change it.
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
        {device !== 'desktop' && (
          <Container padding={{ x: 12, y: 8 }} radius={{ all: 6 }} bgColor={{ color: 'primary', intensity: 100 }} textColor={{ color: 'primary', intensity: 800 }}>
            <Text as="p" fontSize={13}>
              Editing for {DEVICE_LABELS[device].toLowerCase()}s: changes to sizes, space, layout and colours apply to {DEVICE_LABELS[device].toLowerCase()}s
              {device === 'tablet' ? ' (and phones, until they have their own)' : ''}.
            </Text>
          </Container>
        )}
        {selected.element.type.startsWith('plugin-') ? (
          <Text as="p" fontSize={14} textColor={{ color: 'surface', intensity: 700 }}>
            This comes from a plugin. Its settings arrive with the plugin.
          </Text>
        ) : (
          <ElementProperties
            key={`${selected.element.id}:${device}`}
            element={selected.element as Parameters<typeof ElementProperties>[0]['element']}
            parent={selected.parent}
            onChange={(element) => change(updateElement(doc, element), `props:${element.id}`)}
            device={device}
            pages={pages}
            problems={problems.get(selected.element.id) ?? {}}
            tab={tab}
            onTabChange={setTab}
          />
        )}
      </Container>
    );
  }

  return (
    <Container flex={{ direction: 'column' }} flexItem={{ grow: 1 }} minHeight={0} bgColor={CANVAS} onKeyDown={handleKeyDown}>
      <Container
        aria-label="Page builder"
        data-builder-controls=""
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
          <Text as="span" fontSize={12} textColor={{ color: 'surface', intensity: 700 }}>
            {page.path} · {page.status === 'published' ? (unpublishedChanges ? 'Live, with unpublished changes' : 'Live') : 'Not published'}
          </Text>
        </Container>
        <Container
          flex={{ direction: 'row', align: 'center', gap: 6 }}
          textColor={{ color: STATUS[autosave.status].color, intensity: STATUS[autosave.status].color === 'surface' ? 700 : 600 }}
          role="status"
        >
          <Icon name={STATUS[autosave.status].icon} size={18} />
          <Text as="span" fontSize={13}>
            {STATUS[autosave.status].label}
          </Text>
        </Container>
        <Container flex={{ direction: 'row', gap: 2 }} role="group" aria-label="Device">
          {DEVICES.map((entry) => (
            <Tooltip key={entry.value} content={`See and edit it as on a ${DEVICE_LABELS[entry.value].toLowerCase()} (${DEVICE_WIDTHS[entry.value]}px)`}>
              <Button
                variant={device === entry.value ? 'outlined' : 'ghost'}
                leadingIcon={entry.icon}
                aria-pressed={device === entry.value}
                padding={{ x: 8 }}
                onClick={() => setDevice(entry.value)}
              >
                {DEVICE_LABELS[entry.value]}
              </Button>
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
        <Button variant="outlined" leadingIcon="settings" onClick={() => setSettingsOpen(true)}>
          Page settings
        </Button>
        <Button variant="outlined" leadingIcon="undo-2" disabled={!unpublishedChanges || !published} onClick={() => setDiscarding(true)}>
          Discard changes
        </Button>
        {canPublish ? (
          <Button leadingIcon="send" loading={publishing.isLoading} disabled={!unpublishedChanges && page.status === 'published'} onClick={() => void handlePublish()}>
            Publish
          </Button>
        ) : (
          <Tooltip content="Publishing needs an admin or the owner. Your draft is saved for them.">
            <Button leadingIcon="send" disabled>
              Publish
            </Button>
          </Tooltip>
        )}
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
          <Container flex={{ direction: 'column' }} flexItem={{ grow: 1, basis: 0 }} minHeight={0} padding={{ x: 16, bottom: 16 }}>
            <ScaledPreview width={DEVICE_WIDTHS[device]}>
              <PreviewFrame width="full" title={`Preview of ${page.title}`}>
                <Container
                  minHeight="screen"
                  bgColor={page.bgColor ?? { color: 'surface', intensity: 50 }}
                  textColor={page.textColor ?? { color: 'surface', intensity: 950 }}
                  onClick={handlePreviewClick}
                  onMouseOver={handlePreviewHover}
                  onMouseLeave={handlePreviewHover}
                >
                  <style>{previewStyles(selected ? { id: selected.element.id, name: elementName(selected.element) } : null)}</style>
                  {doc.elements.length === 0 ? (
                    <Container flex={{ direction: 'column', align: 'center', gap: 12 }} padding={{ x: 24, y: 96 }} textColor={{ color: 'surface', intensity: 700 }}>
                      <Icon name="layout-template" size={40} />
                      <Text as="p" fontFamily="display" fontSize={24} align="center" textColor={{ color: 'surface', intensity: 900 }}>
                        Start building your page
                      </Text>
                      <Text as="p" align="center" maxWidth={520}>
                        Use Add in the Layers on the left. A good start is a Container, to hold things, with Text, Images and Buttons inside it.
                      </Text>
                    </Container>
                  ) : (
                    <ContentRenderer content={doc} links={links} decorators={decorators} />
                  )}
                </Container>
              </PreviewFrame>
            </ScaledPreview>
          </Container>
        </Container>

        <Container
          as="aside"
          aria-label="Properties"
          data-builder-controls=""
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

      <Modal
        open={lockLost}
        onOpenChange={() => undefined}
        dismissible={false}
        title={`${lock.status === 'lost' && lock.editing ? lock.editing.name : 'Someone else'} is editing this page now`}
        description="The page went two minutes without word from this window (e.g. the computer slept), so someone else opened it. Changes made here since then aren’t saved."
        maxWidth={500}
      >
        <Container flex={{ justify: 'end', gap: 8 }}>
          <Button variant="outlined" leadingIcon="arrow-left" onClick={() => navigate('/pages')}>
            Back to Pages
          </Button>
          <Button leadingIcon="refresh-cw" onClick={onLockCheck}>
            Try to carry on
          </Button>
        </Container>
      </Modal>
      <PageEditor page={settingsOpen ? page : null} onClose={() => setSettingsOpen(false)} canPublish={canPublish} />
      <Modal open={discarding} onOpenChange={setDiscarding} title="Discard your changes?" description="The draft goes back to what’s published. This can’t be undone." maxWidth={460}>
        <Container flex={{ justify: 'end', gap: 8 }}>
          <Button variant="outlined" onClick={() => setDiscarding(false)}>
            Keep editing
          </Button>
          <Button color="red" leadingIcon="undo-2" loading={discardState.isLoading} onClick={() => void handleDiscard()}>
            Discard changes
          </Button>
        </Container>
      </Modal>
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
