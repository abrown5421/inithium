import { useEffect, useId, useRef, useState, type CSSProperties } from 'react';
import { EditorContent, useEditor, useEditorState } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { CharacterCount, Placeholder } from '@tiptap/extensions';
import { richTextFeatures, type RichTextDocument, type RichTextFeature, type SolidColorValue } from '@inithium/shared-contracts';
import { Button, Container, Input, Text, toCssColor, Tooltip, type IconName } from '@inithium/shared-ui-components';
import { attrsToLink, linkToAttrs, richTextToTiptap, tiptapToRichText } from './rich-text-convert.service';
import { richTextFieldStyleSheet } from './rich-text-field.styles';

const EMPTY: RichTextDocument = { type: 'doc', content: [{ type: 'paragraph' }] };

export type RichTextFieldProps = {
  /** The field's label, above the box. */
  label: string;
  /** The document. With `value`, the field is controlled; otherwise it holds its own, starting from `defaultValue`. */
  value?: RichTextDocument;
  defaultValue?: RichTextDocument;
  /** Called with the document after every change. */
  onChange?: (doc: RichTextDocument) => void;
  /** The formatting offered (and allowed): any of bold, italic, underline, link, heading, bulletList, orderedList, blockquote. Default all. */
  features?: readonly RichTextFeature[];
  /** The most characters it takes, counted as `richTextLength`; shows a count. Default no limit. */
  maxLength?: number;
  /** Shown faintly while it's empty. */
  placeholder?: string;
  helperText?: string;
  /** Marks the field invalid. A message replaces helperText; editing hides it. */
  error?: boolean | string;
  /** Adds * to the label. */
  required?: boolean;
  disabled?: boolean;
  /** The editable area's least height, in px. Default 120. */
  minHeight?: number;
  /** The focus colour and active toolbar buttons. Default primary. */
  color?: SolidColorValue;
};

type Tool = { feature: RichTextFeature; label: string; icon: IconName; isActive: string; run: () => void };

/**
 * A rich text field (decision 0102): TipTap's editor in an outlined box with a toolbar, limited to the formatting
 * `features` allow, saved as Inithium's rich text document (JSON, never HTML), with a character limit enforced as you
 * type. Draw what it saves with RichTextView. Paste what you like: anything the field doesn't allow is dropped.
 */
export function RichTextField({
  label,
  value,
  defaultValue,
  onChange,
  features = richTextFeatures,
  maxLength,
  placeholder,
  helperText,
  error,
  required,
  disabled = false,
  minHeight = 120,
  color = 'primary',
}: RichTextFieldProps) {
  const id = useId();
  const labelId = `${id}-label`;
  const metaId = `${id}-meta`;
  const allowed = new Set(features);
  const has = (feature: RichTextFeature) => allowed.has(feature);
  const lists = has('bulletList') || has('orderedList');

  const [own, setOwn] = useState(defaultValue ?? EMPTY);
  const doc = value ?? own;
  const lastEmitted = useRef(JSON.stringify(doc));
  const change = useRef(onChange);
  // An error shows until the text is edited.
  const [hiddenError, setHiddenError] = useState<RichTextFieldProps['error']>(undefined);
  const errorRef = useRef(error);
  useEffect(() => {
    change.current = onChange;
    errorRef.current = error;
  });
  const shownError = error && hiddenError !== error ? error : undefined;

  const editor = useEditor({
    extensions: [
      // The schema itself only knows the allowed formatting, so pasted headings, lists or links it doesn't allow are
      // dropped or turned into plain paragraphs before they reach the document.
      StarterKit.configure({
        bold: has('bold') ? undefined : false,
        italic: has('italic') ? undefined : false,
        underline: has('underline') ? undefined : false,
        heading: has('heading') ? { levels: [2, 3, 4] } : false,
        bulletList: has('bulletList') ? undefined : false,
        orderedList: has('orderedList') ? undefined : false,
        listItem: lists ? undefined : false,
        listKeymap: lists ? undefined : false,
        blockquote: has('blockquote') ? undefined : false,
        link: has('link') ? { openOnClick: false, autolink: false, HTMLAttributes: { rel: null, target: null } } : false,
        code: false,
        codeBlock: false,
        horizontalRule: false,
        strike: false,
      }),
      CharacterCount.configure({ limit: maxLength ?? null }),
      Placeholder.configure({ placeholder: placeholder ?? '' }),
    ],
    content: richTextToTiptap(doc),
    editable: !disabled,
    editorProps: {
      attributes: { role: 'textbox', 'aria-multiline': 'true', 'aria-labelledby': labelId, 'aria-describedby': metaId },
    },
    onUpdate: ({ editor: current }) => {
      const next = tiptapToRichText(current.getJSON());
      lastEmitted.current = JSON.stringify(next);
      setOwn(next);
      setHiddenError(errorRef.current);
      change.current?.(next);
    },
  });

  const state = useEditorState({
    editor,
    selector: ({ editor: current }) => ({
      count: current.storage.characterCount.characters() as number,
      bold: current.isActive('bold'),
      italic: current.isActive('italic'),
      underline: current.isActive('underline'),
      link: current.isActive('link'),
      heading: current.isActive('heading'),
      bulletList: current.isActive('bulletList'),
      orderedList: current.isActive('orderedList'),
      blockquote: current.isActive('blockquote'),
    }),
  });

  // A document changed from outside (e.g. the form reset) replaces what's being edited.
  useEffect(() => {
    const json = JSON.stringify(doc);
    if (json === lastEmitted.current) return;
    lastEmitted.current = json;
    editor.commands.setContent(richTextToTiptap(doc), { emitUpdate: false });
  }, [doc, editor]);

  useEffect(() => {
    editor.setEditable(!disabled);
  }, [disabled, editor]);
  useEffect(() => {
    if (shownError) editor.view.dom.setAttribute('aria-invalid', 'true');
    else editor.view.dom.removeAttribute('aria-invalid');
  }, [shownError, editor]);

  // Editing a link: the address being typed, or null while closed.
  const [linking, setLinking] = useState<string | null>(null);
  const [linkProblem, setLinkProblem] = useState<string | null>(null);
  const chain = () => editor.chain().focus();
  const applyLink = () => {
    const link = attrsToLink({ href: (linking ?? '').trim() });
    if (!link || link.type !== 'url') {
      setLinkProblem('Use an address starting with https://, http://, mailto: or tel:');
      return;
    }
    chain().extendMarkRange('link').setLink(linkToAttrs(link)).run();
    setLinking(null);
  };

  const tools: Tool[] = [
    { feature: 'bold', label: 'Bold', icon: 'bold', isActive: 'bold', run: () => chain().toggleBold().run() },
    { feature: 'italic', label: 'Italic', icon: 'italic', isActive: 'italic', run: () => chain().toggleItalic().run() },
    { feature: 'underline', label: 'Underline', icon: 'underline', isActive: 'underline', run: () => chain().toggleUnderline().run() },
    {
      feature: 'link',
      label: state.link ? 'Edit link' : 'Link',
      icon: 'link',
      isActive: 'link',
      run: () => {
        setLinkProblem(null);
        setLinking(String(editor.getAttributes('link')['href'] ?? 'https://'));
      },
    },
    { feature: 'heading', label: 'Heading', icon: 'heading-2', isActive: 'heading', run: () => chain().toggleHeading({ level: 2 }).run() },
    { feature: 'bulletList', label: 'Bulleted list', icon: 'list', isActive: 'bulletList', run: () => chain().toggleBulletList().run() },
    { feature: 'orderedList', label: 'Numbered list', icon: 'list-ordered', isActive: 'orderedList', run: () => chain().toggleOrderedList().run() },
    { feature: 'blockquote', label: 'Quote', icon: 'text-quote', isActive: 'blockquote', run: () => chain().toggleBlockquote().run() },
  ].filter((tool) => has(tool.feature as RichTextFeature)) as Tool[];

  const message = typeof shownError === 'string' ? shownError : helperText;
  const style = { '--ui-rtf-accent': toCssColor(color), '--ui-rtf-min-height': `${minHeight}px` } as CSSProperties;

  return (
    <>
      {/* React hoists this to <head> and keeps one copy however many render. */}
      <style href="inithium-rich-text-field" precedence="default">
        {richTextFieldStyleSheet}
      </style>
      {/* A plain <div>: the field's frame carries data attributes and CSS variables its stylesheet reads (decision 0092). */}
      <div className="ui-rtf" style={style} data-error={shownError ? '' : undefined} data-disabled={disabled ? '' : undefined}>
        <Text as="label" id={labelId} fontSize={13} fontWeight={500} textColor={{ color: 'surface', intensity: 800 }} onClick={() => editor.commands.focus()}>
          {label}
          {required && ' *'}
        </Text>
        <div className="ui-rtf-box">
          {tools.length > 0 && (
            <div className="ui-rtf-toolbar" role="toolbar" aria-label={`${label} formatting`}>
              {tools.map((tool) => {
                const active = state[tool.isActive as keyof typeof state] === true;
                return (
                  <Tooltip key={tool.feature} content={tool.label}>
                    <Button
                      variant={active ? 'filled' : 'ghost'}
                      color={active ? color : { color: 'surface', intensity: 800 }}
                      leadingIcon={tool.icon}
                      aria-label={tool.label}
                      aria-pressed={active}
                      padding={{ x: 6 }}
                      disabled={disabled}
                      // Keep the text selection: don't let the button take focus from the editor.
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={tool.run}
                    />
                  </Tooltip>
                );
              })}
            </div>
          )}
          {linking !== null && (
            <Container flex={{ direction: { base: 'column', sm: 'row' }, align: { base: 'stretch', sm: 'start' }, gap: 8 }} padding={{ all: 8 }}>
              <Container flexItem={{ grow: 1 }}>
                <Input
                  label="Link address"
                  value={linking}
                  autoFocus
                  error={linkProblem ?? undefined}
                  onValueChange={(next) => {
                    setLinking(next);
                    setLinkProblem(null);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      applyLink();
                    }
                    if (event.key === 'Escape') setLinking(null);
                  }}
                />
              </Container>
              <Container flex={{ gap: 4 }} flexItem={{ shrink: 0 }}>
                <Button onClick={applyLink}>Apply</Button>
                {state.link && (
                  <Button
                    variant="ghost"
                    color="red"
                    leadingIcon="unlink"
                    aria-label="Remove link"
                    padding={{ x: 6 }}
                    onClick={() => {
                      chain().extendMarkRange('link').unsetLink().run();
                      setLinking(null);
                    }}
                  />
                )}
                <Button variant="ghost" onClick={() => setLinking(null)}>
                  Cancel
                </Button>
              </Container>
            </Container>
          )}
          <EditorContent editor={editor} className="ui-rtf-content" />
        </div>
        {(message || maxLength !== undefined) && (
          <div className="ui-rtf-meta" id={metaId}>
            {message && (
              <span data-error={shownError ? '' : undefined} role={shownError ? 'alert' : undefined}>
                {message}
              </span>
            )}
            {maxLength !== undefined && (
              <span className="ui-rtf-count" data-full={state.count >= maxLength ? '' : undefined}>
                {state.count}/{maxLength}
              </span>
            )}
          </div>
        )}
      </div>
    </>
  );
}
