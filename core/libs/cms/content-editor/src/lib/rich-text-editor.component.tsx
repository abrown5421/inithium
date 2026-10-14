import { useEffect, useRef, type CSSProperties } from 'react';
import { EditorContent, useEditor, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { toCssColor } from '@inithium/shared-ui-components';
import type { ColorValue, ContentAlign, RichTextDocument } from '@inithium/shared-contracts';
import { PAGE_LINK_SCHEME, richTextToTiptap, tiptapToRichText } from '@inithium/shared-ui-composites';

/**
 * The editable text's look, matching RichText (shared-content) so editing in place looks like the page. TipTap
 * renders plain HTML elements, so they're styled here; it's the editor's own internals (decision 0092).
 */
const editorStyles = `
[data-rich-text-editor] .ProseMirror { outline: none; display: flex; flex-direction: column; gap: 14px; min-height: 1.7em; }
[data-rich-text-editor] .ProseMirror p { margin: 0; line-height: 1.7; }
[data-rich-text-editor] .ProseMirror h2, [data-rich-text-editor] .ProseMirror h3, [data-rich-text-editor] .ProseMirror h4 {
  margin: 8px 0 0; font-family: var(--font-display); line-height: 1.25; font-weight: inherit;
}
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
};

/**
 * Edits a rich text block in place in the preview (decision 0093), with TipTap limited to what the contract allows:
 * paragraphs, h2–h4, lists, quotes, bold, italic, underline and links. Changes come out as our rich text document;
 * a document changed from outside (undo) is loaded back in.
 */
export function RichTextEditor({ doc, onChange, onEditor, align, textColor }: RichTextEditorProps) {
  const lastEmitted = useRef(JSON.stringify(doc));
  const change = useRef(onChange);
  useEffect(() => {
    change.current = onChange;
  });

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
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
      <style>{editorStyles}</style>
      <EditorContent editor={editor} />
    </div>
  );
}
