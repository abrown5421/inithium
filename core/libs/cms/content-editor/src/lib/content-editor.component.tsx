import { useCallback, useMemo, useState, type KeyboardEvent, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Editor } from '@tiptap/react';
import { contentDocumentSchema, pathHasParams, type ContentBlock, type ContentDocument, type Page } from '@inithium/shared-contracts';
import { ContentRenderer, type ContentDecorators, type ContentLinks } from '@inithium/shared-content';
import { readApiFailure, useAlerts, useDiscardContentDraftMutation, usePublishContentMutation, useSaveContentDraftMutation } from '@inithium/shared-data-access';
import { PageEditor } from '@inithium/cms-pages';
import { Button, Container, Icon, Text, Tooltip, type IconName } from '@inithium/shared-ui-components';
import { Modal } from '@inithium/shared-ui-composites';
import {
  copyBlock,
  copySection,
  createBlock,
  createSection,
  findBlock,
  findSection,
  insertBlock,
  insertSection,
  moveBlock,
  moveBlockToColumn,
  moveSection,
  removeBlock,
  removeSection,
  sameContent,
  setSectionLayout,
  updateBlock,
  updateSection,
  BLOCK_TYPES,
  type EditorSelection,
} from './content-document.service';
import { PreviewFrame } from './preview-frame.component';
import { BlockProperties, SectionProperties, type FieldProblems } from './properties-panel.component';
import { RichTextEditor } from './rich-text-editor.component';
import { RichTextToolbar } from './rich-text-toolbar.component';
import { StructurePanel } from './structure-panel.component';
import { useAutosave, type SaveStatus } from './use-autosave.hook';
import { useContentHistory } from './use-content-history.hook';

/**
 * The editor's colours (decision 0094): the toolbar and both panels are surface 200, divided from each other and from
 * the surface 950 canvas by a thin border and a shadow.
 */
const CANVAS = { color: 'surface', intensity: 950 } as const;
const PANEL = { color: 'surface', intensity: 200 } as const;
const DIVIDER = { color: 'surface', intensity: 500, opacity: 50 } as const;

type Device = 'desktop' | 'tablet' | 'phone';
const DEVICES: { value: Device; label: string; icon: IconName; width: number | 'full' }[] = [
  { value: 'desktop', label: 'Desktop', icon: 'monitor', width: 'full' },
  { value: 'tablet', label: 'Tablet (768px)', icon: 'tablet', width: 768 },
  { value: 'phone', label: 'Phone (390px)', icon: 'smartphone', width: 390 },
];

const STATUS: Record<SaveStatus, { label: string; icon: IconName; color: 'surface' | 'red' | 'amber' }> = {
  saved: { label: 'Draft saved', icon: 'cloud-check', color: 'surface' },
  pending: { label: 'Unsaved changes', icon: 'cloud', color: 'surface' },
  saving: { label: 'Saving…', icon: 'cloud-upload', color: 'surface' },
  error: { label: 'Couldn’t save. Retrying on the next change', icon: 'cloud-alert', color: 'red' },
  invalid: { label: 'Fix the marked problems to save', icon: 'circle-alert', color: 'amber' },
};

/**
 * Outlines in the preview: the block or section under the pointer, and the selected one. The editor's own internals
 * (decision 0092): Container has no outline props yet (0033).
 */
const previewStyles = `
[data-editor-section] { position: relative; cursor: pointer; }
[data-editor-section] > section { min-height: 64px; }
[data-editor-section]:hover::after, [data-editor-section][data-selected]::after {
  content: ''; position: absolute; inset: 0; pointer-events: none; z-index: 5;
  outline: 1px dashed color-mix(in oklab, var(--color-primary-500) 60%, transparent); outline-offset: -2px;
}
[data-editor-section][data-selected]::after { outline: 2px solid var(--color-primary-500); }
[data-editor-column] { border-radius: 6px; outline: 1px dashed transparent; outline-offset: 6px; }
[data-editor-column]:hover { outline-color: color-mix(in oklab, var(--color-primary-500) 35%, transparent); }
[data-editor-column][data-selected] { outline: 2px solid var(--color-primary-500); }
[data-editor-block] { border-radius: 4px; outline: 1px dashed transparent; outline-offset: 4px; cursor: pointer; }
[data-editor-block]:hover { outline-color: color-mix(in oklab, var(--color-primary-500) 60%, transparent); }
[data-editor-block][data-selected] { outline: 2px solid var(--color-primary-500); cursor: text; }
`;

/** Each problem in the draft, keyed by the id of the section or block it's in, then by the field's path within it. */
function problemsOf(doc: ContentDocument): Map<string, FieldProblems> {
  const parsed = contentDocumentSchema.safeParse(doc);
  const problems = new Map<string, FieldProblems>();
  if (parsed.success) return problems;
  for (const issue of parsed.error.issues) {
    const [, sectionIndex, , columnIndex, , blockIndex, ...rest] = issue.path;
    const section = doc.sections[Number(sectionIndex)];
    if (!section) continue;
    const block = blockIndex !== undefined ? section.columns[Number(columnIndex)]?.blocks[Number(blockIndex)] : undefined;
    const owner = block?.id ?? section.id;
    const field = (block ? rest : issue.path.slice(2)).map(String).join('.');
    const found = problems.get(owner) ?? {};
    if (!(field in found)) found[field] = issue.message;
    problems.set(owner, found);
  }
  return problems;
}

export type ContentEditorProps = {
  page: Page & { content: NonNullable<Page['content']> };
  /** Every page, for links. */
  pages: Page[];
  canPublish: boolean;
};

/**
 * The content page editor (decisions 0093, 0094), filling the space under the CMS's top bar, with its own toolbar
 * first: the page's structure on the left, a live preview in the
 * middle (desktop, tablet and phone widths, drawn by the same renderer as the site, with rich text edited in place)
 * and the selection's properties on the right. The draft autosaves; Publish puts it live and Discard goes back to
 * what's published. Undo and redo work for the session.
 */
export function ContentEditor({ page, pages, canPublish }: ContentEditorProps) {
  const navigate = useNavigate();
  const { show: showAlert } = useAlerts();
  const history = useContentHistory(page.content.draft);
  const { doc, change } = history;
  const [selectionState, setSelection] = useState<EditorSelection>(null);
  const [device, setDevice] = useState<Device>('desktop');
  const [richEditor, setRichEditor] = useState<Editor | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [discarding, setDiscarding] = useState(false);

  const [saveDraft] = useSaveContentDraftMutation();
  const [publish, publishing] = usePublishContentMutation();
  const [discard, discardState] = useDiscardContentDraftMutation();

  const problems = useMemo(() => problemsOf(doc), [doc]);
  const invalid = useMemo(() => new Set(problems.keys()), [problems]);
  const save = useCallback((draft: ContentDocument) => saveDraft({ id: page.id, draft }).unwrap(), [saveDraft, page.id]);
  const autosave = useAutosave({ doc, valid: invalid.size === 0, save });

  // A selection that no longer exists (e.g. after undo) is dropped.
  const selection: EditorSelection =
    selectionState?.kind === 'section'
      ? findSection(doc, selectionState.sectionId)
        ? selectionState
        : null
      : selectionState?.kind === 'column'
        ? findSection(doc, selectionState.sectionId)?.columns.some((column) => column.id === selectionState.columnId)
          ? selectionState
          : null
      : selectionState?.kind === 'block'
        ? (() => {
            const found = findBlock(doc, selectionState.blockId);
            return found ? { kind: 'block' as const, sectionId: found.section.id, columnId: found.column.id, blockId: found.block.id } : null;
          })()
        : null;
  const selectedSection = selection ? findSection(doc, selection.sectionId) : undefined;
  const selectedBlock = selection?.kind === 'block' ? findBlock(doc, selection.blockId) : undefined;

  const published = page.content.published;
  const unpublishedChanges = !published || !sameContent(published, doc);

  const links = useMemo<ContentLinks>(() => {
    const paths = new Map(pages.filter((entry) => !pathHasParams(entry.path)).map((entry) => [entry.id, entry.path]));
    return { pagePath: (id) => paths.get(id), onNavigate: () => undefined, preview: true };
  }, [pages]);

  const editBlock = useCallback((block: ContentBlock) => change(updateBlock(doc, block), `block:${block.id}`), [change, doc]);

  const decorators = useMemo<ContentDecorators>(
    () => ({
      section: (section, drawn) => (
        <Container
          data-editor-section=""
          data-selected={selection?.kind === 'section' && selection.sectionId === section.id ? '' : undefined}
          onClick={() => setSelection({ kind: 'section', sectionId: section.id })}
        >
          {drawn}
        </Container>
      ),
      column: (column, section, drawn) => (
        <Container
          data-editor-column=""
          data-selected={selection?.kind === 'column' && selection.columnId === column.id ? '' : undefined}
          flex={{ direction: 'column', gap: 20 }}
          flexItem={{ grow: 1 }}
          onClick={(event) => {
            event.stopPropagation();
            setSelection({ kind: 'column', sectionId: section.id, columnId: column.id });
          }}
        >
          {column.blocks.length > 0 ? (
            drawn
          ) : (
            <Container
              flex={{ direction: 'column', align: 'center', justify: 'center', gap: 6 }}
              minHeight={96}
              padding={{ all: 16 }}
              radius={{ all: 8 }}
              borderWidth={{ all: 2 }}
              borderStyle="dashed"
              borderColor={{ color: 'primary', intensity: 500, opacity: 50 }}
              textColor={{ color: 'primary', intensity: 700 }}
            >
              <Icon name="plus" size={20} />
              <Text as="span" fontSize={13} align="center">
                Empty column: click it, then add a block
              </Text>
            </Container>
          )}
        </Container>
      ),
      block: (block, drawn) => {
        const selected = selection?.kind === 'block' && selection.blockId === block.id;
        const location = findBlock(doc, block.id);
        return (
          <Container
            data-editor-block=""
            data-selected={selected ? '' : undefined}
            onClick={(event) => {
              // Selecting, not following: links in the preview go nowhere, and the section isn't selected too.
              event.stopPropagation();
              if (!selected && location) setSelection({ kind: 'block', sectionId: location.section.id, columnId: location.column.id, blockId: block.id });
            }}
          >
            {selected && block.type === 'rich-text' ? (
              <RichTextEditor
                doc={block.doc}
                align={block.align}
                textColor={block.textColor}
                onChange={(next) => editBlock({ ...block, doc: next })}
                onEditor={setRichEditor}
              />
            ) : (
              drawn
            )}
          </Container>
        );
      },
    }),
    [selection, doc, editBlock],
  );

  // Undo and redo from the keyboard, except while typing in a field or in the text being edited (which has its own).
  const handleKeyDown = (event: KeyboardEvent) => {
    const target = event.target as HTMLElement;
    if (target.closest('input, textarea, [contenteditable="true"]')) return;
    if (!(event.ctrlKey || event.metaKey)) return;
    const key = event.key.toLowerCase();
    if (key === 'z' && !event.shiftKey) history.undo();
    else if ((key === 'z' && event.shiftKey) || key === 'y') history.redo();
    else return;
    event.preventDefault();
  };

  const handlePublish = async () => {
    if (!(await autosave.flush())) {
      showAlert({ color: 'red', icon: 'circle-alert', title: 'We couldn’t publish yet', message: 'Fix the marked problems first, so the draft can save.', urgent: true });
      return;
    }
    try {
      await publish(page.id).unwrap();
      showAlert({ color: 'green', icon: 'circle-check', title: 'Published', message: `${page.title} is live at ${page.path}.` });
    } catch (error) {
      showAlert({ color: 'red', icon: 'circle-alert', title: 'We couldn’t publish', message: readApiFailure(error).message ?? 'Something went wrong. Please try again.', urgent: true });
    }
  };

  const handleDiscard = async () => {
    try {
      const result = await discard(page.id).unwrap();
      const draft = result.content?.draft ?? doc;
      history.reset(draft);
      autosave.markSaved(draft);
      setSelection(null);
      setDiscarding(false);
      showAlert({ color: 'green', icon: 'undo-2', title: 'Changes discarded', message: published ? 'The draft is back to what’s published.' : 'The draft is empty again.' });
    } catch (error) {
      showAlert({ color: 'red', icon: 'circle-alert', title: 'We couldn’t discard the changes', message: readApiFailure(error).message ?? 'Something went wrong.', urgent: true });
    }
  };

  const status = STATUS[autosave.status];
  const sectionColumns = selectedBlock
    ? selectedBlock.section.columns.map((column, index) => ({ id: column.id, label: `Column ${index + 1}` }))
    : [];

  let properties: ReactNode = (
    <Text as="p" fontSize={14} textColor={{ color: 'surface', intensity: 700 }}>
      Select a section or block, in the preview or the structure, to change it.
    </Text>
  );
  const selectedColumnIndex =
    selection?.kind === 'column' && selectedSection ? selectedSection.columns.findIndex((column) => column.id === selection.columnId) : -1;
  if (selectedBlock) {
    properties = (
      <BlockProperties
        block={selectedBlock.block}
        onChange={editBlock}
        pages={pages}
        problems={problems.get(selectedBlock.block.id) ?? {}}
        columns={sectionColumns}
        columnId={selectedBlock.column.id}
        onMoveToColumn={(columnId) => change(moveBlockToColumn(doc, selectedBlock.block.id, columnId))}
      />
    );
  } else if (selectedSection && selectedColumnIndex >= 0) {
    const column = selectedSection.columns[selectedColumnIndex];
    properties = (
      <Container flex={{ direction: 'column', align: 'start', gap: 12 }}>
        <Text as="p">
          Column {selectedColumnIndex + 1} of section {doc.sections.indexOf(selectedSection) + 1}, with {column?.blocks.length ?? 0}{' '}
          {column?.blocks.length === 1 ? 'block' : 'blocks'}.
        </Text>
        <Text as="p" fontSize={14} textColor={{ color: 'surface', intensity: 700 }}>
          Add blocks to it with Add a block on the left. Its width comes from the section’s layout.
        </Text>
        <Button variant="outlined" leadingIcon="rows-3" onClick={() => setSelection({ kind: 'section', sectionId: selectedSection.id })}>
          Section settings
        </Button>
      </Container>
    );
  } else if (selectedSection) {
    properties = (
      <SectionProperties
        section={selectedSection}
        onChange={(changes) => change(updateSection(doc, selectedSection.id, changes), `section:${selectedSection.id}`)}
        onLayout={(layout) => change(setSectionLayout(doc, selectedSection.id, layout))}
        problems={problems.get(selectedSection.id) ?? {}}
      />
    );
  }

  return (
    <Container flex={{ direction: 'column' }} flexItem={{ grow: 1 }} minHeight={0} bgColor={CANVAS} onKeyDown={handleKeyDown}>
      {/* The editor's own toolbar, under the CMS's top bar */}
      <Container
        aria-label="Page editor"
        role="region"
        flex={{ direction: 'row', align: 'center', gap: 12, wrap: 'wrap' }}
        padding={{ x: 16, y: 10 }}
        bgColor={PANEL}
        borderWidth={{ bottom: 1 }}
        borderColor={DIVIDER}
        shadow="2xl"
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
        <Container flex={{ direction: 'row', align: 'center', gap: 6 }} textColor={{ color: status.color, intensity: status.color === 'surface' ? 700 : 600 }} role="status">
          <Icon name={status.icon} size={18} />
          <Text as="span" fontSize={13}>
            {status.label}
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
        <Button variant="outlined" leadingIcon="settings" onClick={() => setSettingsOpen(true)}>
          Settings
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

      {/* The editor needs room for its three panels. */}
      <Container hidden={{ base: false, lg: true }} padding={{ all: 24 }}>
        <Text as="p">The page editor needs a wider window. Widen it, or open the CMS on a larger screen.</Text>
      </Container>
      <Container hidden={{ base: true, lg: false }} flex={{ direction: 'row' }} flexItem={{ grow: 1 }} minHeight={0}>
        <Container
          as="aside"
          aria-label="Structure"
          width={330}
          flexItem={{ shrink: 0 }}
          overflow={{ y: 'auto' }}
          padding={{ all: 16 }}
          bgColor={PANEL}
          borderWidth={{ right: 1 }}
          borderColor={DIVIDER}
          shadow="2xl"
          position={{ type: 'relative', z: 1 }}
        >
          <StructurePanel
            doc={doc}
            selection={selection}
            onSelect={setSelection}
            invalid={invalid}
            onMoveSection={(id, by) => change(moveSection(doc, id, by))}
            onDuplicateSection={(id) => {
              const section = findSection(doc, id);
              if (!section) return;
              const copy = copySection(section);
              change(insertSection(doc, copy, id));
              setSelection({ kind: 'section', sectionId: copy.id });
            }}
            onRemoveSection={(id) => change(removeSection(doc, id))}
            onAddSection={(layout) => {
              const section = createSection(layout);
              change(insertSection(doc, section, selection?.sectionId));
              setSelection({ kind: 'section', sectionId: section.id });
            }}
            onMoveBlock={(id, by) => change(moveBlock(doc, id, by))}
            onDuplicateBlock={(id) => {
              const found = findBlock(doc, id);
              if (!found) return;
              const copy = copyBlock(found.block);
              change(insertBlock(doc, found.column.id, copy, id));
              setSelection({ kind: 'block', sectionId: found.section.id, columnId: found.column.id, blockId: copy.id });
            }}
            onRemoveBlock={(id) => change(removeBlock(doc, id))}
            onAddBlock={(columnId, type) => {
              const block = createBlock(type);
              const after = selection?.kind === 'block' && selection.columnId === columnId ? selection.blockId : undefined;
              change(insertBlock(doc, columnId, block, after));
              const location = findBlock(insertBlock(doc, columnId, block, after), block.id);
              if (location) setSelection({ kind: 'block', sectionId: location.section.id, columnId, blockId: block.id });
            }}
          />
        </Container>

        {/* The canvas: surface 950, like the backdrop pages animate over on the site. */}
        <Container flex={{ direction: 'column' }} flexItem={{ grow: 1, basis: 0 }} minWidth={0} bgColor={CANVAS}>
          <Container flex={{ direction: 'row', align: 'center', gap: 8 }} minHeight={52} padding={{ x: 16, y: 8 }}>
            {richEditor ? (
              <RichTextToolbar editor={richEditor} pages={pages} color={{ color: 'surface', intensity: 100 }} />
            ) : (
              <Text as="span" fontSize={13} textColor={{ color: 'surface', intensity: 300 }}>
                Click a block to select it. Click a text block to type in it.
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
                  onClick={() => setSelection(null)}
                >
                  <style>{previewStyles}</style>
                  {doc.sections.length === 0 ? (
                    <Container padding={{ all: 48 }}>
                      <Text as="p" align="center" textColor={{ color: 'surface', intensity: 700 }}>
                        This page is empty. Add a section from the panel on the left.
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
          width={360}
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
              {selectedBlock
                ? BLOCK_TYPES[selectedBlock.block.type].label.toUpperCase()
                : selectedColumnIndex >= 0
                  ? 'COLUMN'
                  : selectedSection
                    ? 'SECTION'
                    : 'PROPERTIES'}
            </Text>
            {properties}
          </Container>
        </Container>
      </Container>

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
    </Container>
  );
}
