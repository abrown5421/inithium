import { useEffect, useRef, type CSSProperties } from 'react';
import { EditorContent, useEditor, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { toCssColor } from '@inithium/shared-ui-components';
import type { ColorValue, ContentAlign, ContentTypography, RichTextDocument } from '@inithium/shared-contracts';
import { fontFamilyCss, PAGE_LINK_SCHEME, richTextToTiptap, RichTextStyle, tiptapToRichText } from '@inithium/shared-ui-composites';

/**
 * The editable text's look, matching RichText (shared-content) so editing in place looks like the page. TipTap
 * renders plain HTML elements, so they're styled here; it's the editor's own internals (decision 0092).
 */
const editorStyles = `
[data-rich-text-editor] .ProseMirror { outline: none; display: flex; flex-direction: column; gap: 14px; min-height: 1.7em; }
[data-rich-text-editor] .ProseMirror p { margin: 0; line-height: 1.7; }
[data-rich-text-editor] .ProseMirror :is(h1, h2, h3, h4) {
  margin: 8px 0 0; font-family: var(--font-display); line-height: 1.25; font-weight: inherit;
}
[data-rich-text-editor] .ProseMirror > :first-child { margin-top: 0; }
[data-rich-text-editor] .ProseMirror h1 { font-size: 36px; line-height: 1.2; }
@media (min-width: 768px) { [data-rich-text-editor] .ProseMirror h1 { font-size: 48px; } }
[data-rich-text-editor] .ProseMirror h2 { font-size: 26px; }
[data-rich-text-editor] .ProseMirror h3 { font-size: 21px; }
[data-rich-text-editor] .ProseMirror h4 { font-size: 18px; }
[data-rich-text-editor] .ProseMirror ul, [data-rich-text-editor] .ProseMirror ol {
  margin: 0; padding-left: 24px; display: flex; flex-direction: column; gap: 6px;
}
[data-rich-text-editor] .ProseMirror ul { list-style: disc; }
[data-rich-text-editor] .ProseMirror ol { list-style: decimal; }
[data-rich-text-editor] .ProseMirror li p { line-height: 1.7; }
[data-rich-text-editor] .ProseMirror blockquote {
  margin: 0; padding: 4px 0 4px 16px; border-left: 4px solid var(--color-primary-500); font-style: italic;
  display: flex; flex-direction: column; gap: 10px;
}
[data-rich-text-editor] .ProseMirror a { color: var(--color-primary-600); text-decoration: underline; text-underline-offset: 2px; }
[data-rich-text-editor] .ProseMirror strong { font-weight: 700; }
`;

export type RichTextEditorProps = {
  doc: RichTextDocument;
  onChange: (doc: RichTextDocument) => void;
  /** Hands the TipTap editor to the toolbar, and null when it goes. */
  onEditor: (editor: Editor | null) => void;
  align?: ContentAlign;
  textColor?: ColorValue;
  /** The block's running-text typography (decision 0115). */
  typography?: ContentTypography;
  /** The headings' typography (decision 0116). */
  headingTypography?: ContentTypography;
  /** Offers Heading 1 as well as 2–4, for a content page's Text (decision 0116). Default false. */
  titleHeading?: boolean;
};

/** The md breakpoint: the preview is an iframe, so this follows the previewed device's width. */
const MD = 768;

/**
 * The block's running-text typography as CSS for the editable text, matching RichTextView: paragraphs, lists and
 * quotes take it; sub-headings keep the display font.
 */
function typographyCss(typography: ContentTypography | undefined, running = '[data-rich-text-editor] .ProseMirror :is(p, li)'): string {
  if (!typography) return '';
  const rules = [
    typography.fontFamily !== undefined ? `font-family: ${fontFamilyCss(typography.fontFamily)};` : '',
    typography.fontWeight !== undefined ? `font-weight: ${typography.fontWeight};` : '',
    typography.fontSize ? `font-size: ${typography.fontSize.base}px;` : '',
  ].join(' ');
  const wide = typography.fontSize?.md !== undefined ? `@media (min-width: ${MD}px) { ${running} { font-size: ${typography.fontSize.md}px; } }` : '';
  return `${running} { ${rules} } ${wide}`;
}

/**
 * Edits a rich text block in place in the preview (decision 0093), with TipTap limited to what the contract allows:
 * paragraphs, h2–h4, lists, quotes, bold, italic, underline, links and restyled words (decision 0115). Changes come
 * out as our rich text document; a document changed from outside (undo) is loaded back in.
 */
export function RichTextEditor({ doc, onChange, onEditor, align, textColor, typography, headingTypography, titleHeading = false }: RichTextEditorProps) {
  const lastEmitted = useRef(JSON.stringify(doc));
  const change = useRef(onChange);
  useEffect(() => {
    change.current = onChange;
  });

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: titleHeading ? [1, 2, 3, 4] : [2, 3, 4] },
        code: false,
        codeBlock: false,
        horizontalRule: false,
        strike: false,
        link: {
          openOnClick: false,
          autolink: false,
          protocols: [PAGE_LINK_SCHEME],
          HTMLAttributes: { rel: null, target: null },
          isAllowedUri: (url, context) => url.startsWith(`${PAGE_LINK_SCHEME}:`) || context.defaultValidate(url),
        },
      }),
      RichTextStyle,
    ],
    content: richTextToTiptap(doc),
    onUpdate: ({ editor: current }) => {
      const next = tiptapToRichText(current.getJSON());
      lastEmitted.current = JSON.stringify(next);
      change.current(next);
    },
  });

  useEffect(() => {
    onEditor(editor);
    editor.commands.focus('end');
    return () => onEditor(null);
  }, [editor, onEditor]);

  // A document changed from outside (undo or redo) replaces what's being edited.
  useEffect(() => {
    const json = JSON.stringify(doc);
    if (json === lastEmitted.current) return;
    lastEmitted.current = json;
    editor.commands.setContent(richTextToTiptap(doc), { emitUpdate: false });
  }, [doc, editor]);

  const style: CSSProperties = {
    textAlign: align ?? undefined,
    color: textColor ? toCssColor(textColor) : undefined,
  };
  return (
    <div data-rich-text-editor="" style={style}>
      <style>{editorStyles + typographyCss(typography) + typographyCss(headingTypography, '[data-rich-text-editor] .ProseMirror :is(h1, h2, h3, h4)')}</style>
      <EditorContent editor={editor} />
    </div>
  );
}
