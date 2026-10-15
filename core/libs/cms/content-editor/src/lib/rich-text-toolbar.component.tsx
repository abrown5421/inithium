import { useState } from 'react';
import { useEditorState, type Editor } from '@tiptap/react';
import { contentLinkSchema, type ContentLink, type Page, type RichTextStyleAttrs, type SolidColorValue } from '@inithium/shared-contracts';
import { Button, Container, Divider, Tooltip, type IconName } from '@inithium/shared-ui-components';
import { attrsToLink, checkedStyleAttrs, linkToAttrs, Modal, RICH_TEXT_STYLE_MARK } from '@inithium/shared-ui-composites';
import { LinkField } from './editor-fields.component';
import { TextStyleDialog } from './text-style-dialog.component';

export type RichTextToolbarProps = {
  editor: Editor;
  /** Every page, for links. */
  pages: Page[];
  /** The buttons' colour when they're not active, e.g. light on a dark canvas. Default primary. */
  color?: SolidColorValue;
  /** Offers Heading 1, for a content page's Text (decision 0116). The editor must allow it too. Default false. */
  titleHeading?: boolean;
};

type Tool = { label: string; icon: IconName; active: boolean; run: () => void };

/**
 * The text formatting toolbar for the rich text block being edited (decision 0093): bold, italic, underline, link,
 * text style (font, weight, size and colour for the selected words, decision 0115), paragraph and sub-headings, lists
 * and quote. It sits above the preview and drives the in-place editor.
 */
export function RichTextToolbar({ editor, pages, color, titleHeading = false }: RichTextToolbarProps) {
  const state = useEditorState({
    editor,
    selector: ({ editor: current }) => ({
      bold: current.isActive('bold'),
      italic: current.isActive('italic'),
      underline: current.isActive('underline'),
      link: current.isActive('link'),
      styled: current.isActive(RICH_TEXT_STYLE_MARK),
      paragraph: current.isActive('paragraph') && !current.isActive('bulletList') && !current.isActive('orderedList'),
      h1: current.isActive('heading', { level: 1 }),
      h2: current.isActive('heading', { level: 2 }),
      h3: current.isActive('heading', { level: 3 }),
      h4: current.isActive('heading', { level: 4 }),
      bulletList: current.isActive('bulletList'),
      orderedList: current.isActive('orderedList'),
      blockquote: current.isActive('blockquote'),
    }),
  });
  const [linking, setLinking] = useState<ContentLink | null>(null);
  const [styling, setStyling] = useState<RichTextStyleAttrs | null>(null);
  const chain = () => editor.chain().focus();

  const groups: Tool[][] = [
    [
      { label: 'Bold', icon: 'bold', active: state.bold, run: () => chain().toggleBold().run() },
      { label: 'Italic', icon: 'italic', active: state.italic, run: () => chain().toggleItalic().run() },
      { label: 'Underline', icon: 'underline', active: state.underline, run: () => chain().toggleUnderline().run() },
      {
        label: state.link ? 'Edit link' : 'Link',
        icon: 'link',
        active: state.link,
        run: () => setLinking(attrsToLink(editor.getAttributes('link')) ?? { type: 'url', href: 'https://' }),
      },
      {
        label: 'Text style',
        icon: 'type',
        active: state.styled,
        // The selection's current style, or none yet.
        run: () => setStyling(checkedStyleAttrs(editor.getAttributes(RICH_TEXT_STYLE_MARK)) ?? {}),
      },
    ],
    [
      { label: 'Paragraph', icon: 'pilcrow', active: state.paragraph, run: () => chain().setParagraph().run() },
      ...(titleHeading ? [{ label: 'Heading 1', icon: 'heading-1' as IconName, active: state.h1, run: () => chain().toggleHeading({ level: 1 }).run() }] : []),
      { label: 'Heading 2', icon: 'heading-2', active: state.h2, run: () => chain().toggleHeading({ level: 2 }).run() },
      { label: 'Heading 3', icon: 'heading-3', active: state.h3, run: () => chain().toggleHeading({ level: 3 }).run() },
      { label: 'Heading 4', icon: 'heading-4', active: state.h4, run: () => chain().toggleHeading({ level: 4 }).run() },
    ],
    [
      { label: 'Bulleted list', icon: 'list', active: state.bulletList, run: () => chain().toggleBulletList().run() },
      { label: 'Numbered list', icon: 'list-ordered', active: state.orderedList, run: () => chain().toggleOrderedList().run() },
      { label: 'Quote', icon: 'text-quote', active: state.blockquote, run: () => chain().toggleBlockquote().run() },
    ],
  ];

  // With nothing selected inside restyled words, the change covers those words; otherwise the selection.
  const styleChain = () => (editor.state.selection.empty && state.styled ? chain().extendMarkRange(RICH_TEXT_STYLE_MARK) : chain());
  const applyStyle = (attrs: Partial<RichTextStyleAttrs>) => {
    const chosen = checkedStyleAttrs(attrs);
    if (chosen) styleChain().setMark(RICH_TEXT_STYLE_MARK, { family: null, weight: null, size: null, color: null, ...chosen }).run();
    else styleChain().unsetMark(RICH_TEXT_STYLE_MARK).run();
    setStyling(null);
  };

  const valid = linking ? contentLinkSchema.safeParse(linking) : null;
  const applyLink = () => {
    if (!valid?.success) return;
    chain().extendMarkRange('link').setLink(linkToAttrs(valid.data)).run();
    setLinking(null);
  };

  return (
    <Container flex={{ direction: 'row', align: 'center', wrap: 'wrap', gap: 4 }} role="toolbar" aria-label="Text formatting">
      {groups.map((group, index) => (
        <Container key={index} flex={{ direction: 'row', align: 'center', gap: 2 }}>
          {index > 0 && <Divider orientation="vertical" margin={{ x: 6 }} color={color ? { color: 'surface', intensity: 500 } : undefined} />}
          {group.map((tool) => (
            <Tooltip key={tool.label} content={tool.label}>
              <Button
                variant={tool.active ? 'filled' : 'ghost'}
                color={tool.active ? 'primary' : color}
                leadingIcon={tool.icon}
                aria-label={tool.label}
                aria-pressed={tool.active}
                padding={{ x: 6 }}
                // Keep the text selection: don't let the button take focus from the editor.
                onMouseDown={(event) => event.preventDefault()}
                onClick={tool.run}
              />
            </Tooltip>
          ))}
        </Container>
      ))}
      <TextStyleDialog
        initial={styling}
        styled={state.styled}
        onApply={applyStyle}
        onClear={() => {
          styleChain().unsetMark(RICH_TEXT_STYLE_MARK).run();
          setStyling(null);
        }}
        onClose={() => setStyling(null)}
      />
      <Modal open={linking !== null} onOpenChange={(open) => !open && setLinking(null)} title="Link" description="Where the selected text links to." maxWidth={480}>
        {linking && (
          <Container flex={{ direction: 'column', gap: 20 }}>
            <LinkField value={linking} onChange={setLinking} pages={pages} error={valid && !valid.success ? valid.error.issues[0]?.message : undefined} />
            <Container flex={{ justify: 'between', gap: 8 }}>
              <Button
                variant="ghost"
                color="red"
                leadingIcon="unlink"
                disabled={!state.link}
                onClick={() => {
                  chain().extendMarkRange('link').unsetLink().run();
                  setLinking(null);
                }}
              >
                Remove link
              </Button>
              <Container flex={{ gap: 8 }}>
                <Button variant="outlined" onClick={() => setLinking(null)}>
                  Cancel
                </Button>
                <Button onClick={applyLink} disabled={!valid?.success}>
                  Apply
                </Button>
              </Container>
            </Container>
          </Container>
        )}
      </Modal>
    </Container>
  );
}
