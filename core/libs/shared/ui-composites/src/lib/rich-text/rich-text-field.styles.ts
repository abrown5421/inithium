/**
 * RichTextField's fixed CSS (decision 0102): an outlined box like Input's, its toolbar, and the editable text TipTap
 * renders as plain elements (its own internals, decision 0092), styled to match RichTextView. The accent comes from
 * --ui-rtf-accent and the height from --ui-rtf-min-height, both set inline.
 */
export const richTextFieldStyleSheet = `
.ui-rtf { display: flex; flex-direction: column; gap: 6px; font-family: var(--font-body); font-size: 14px; }
.ui-rtf-box { border: 1px solid var(--color-surface-500); border-radius: 6px; transition: border-color 150ms, box-shadow 150ms; }
.ui-rtf-box:hover { border-color: var(--color-surface-700); }
.ui-rtf-box:focus-within { border-color: var(--ui-rtf-accent); box-shadow: 0 0 0 1px var(--ui-rtf-accent); }
.ui-rtf[data-error] .ui-rtf-box { border-color: var(--color-red-500); box-shadow: none; }
.ui-rtf[data-disabled] { opacity: 0.6; }
.ui-rtf[data-disabled] .ui-rtf-box { pointer-events: none; }
.ui-rtf-toolbar { display: flex; flex-wrap: wrap; align-items: center; gap: 2px; padding: 4px; border-bottom: 1px solid color-mix(in oklab, var(--color-surface-500) 40%, transparent); }
.ui-rtf-content .ProseMirror {
  outline: none; padding: 10px 12px; min-height: var(--ui-rtf-min-height); line-height: 1.7;
  display: flex; flex-direction: column; gap: 10px; color: var(--color-surface-900);
}
.ui-rtf-content .ProseMirror p { margin: 0; }
.ui-rtf-content .ProseMirror h2, .ui-rtf-content .ProseMirror h3, .ui-rtf-content .ProseMirror h4 {
  margin: 6px 0 0; font-family: var(--font-display); line-height: 1.25; font-weight: inherit;
}
.ui-rtf-content .ProseMirror h2 { font-size: 22px; }
.ui-rtf-content .ProseMirror h3 { font-size: 19px; }
.ui-rtf-content .ProseMirror h4 { font-size: 16px; }
.ui-rtf-content .ProseMirror ul, .ui-rtf-content .ProseMirror ol { margin: 0; padding-left: 24px; display: flex; flex-direction: column; gap: 4px; }
.ui-rtf-content .ProseMirror ul { list-style: disc; }
.ui-rtf-content .ProseMirror ol { list-style: decimal; }
.ui-rtf-content .ProseMirror blockquote {
  margin: 0; padding: 2px 0 2px 14px; border-left: 4px solid var(--color-primary-500); font-style: italic;
  display: flex; flex-direction: column; gap: 8px;
}
.ui-rtf-content .ProseMirror a { color: var(--color-primary-600); text-decoration: underline; text-underline-offset: 2px; }
.ui-rtf-content .ProseMirror strong { font-weight: 700; }
.ui-rtf-content .ProseMirror p.is-editor-empty:first-child::before {
  content: attr(data-placeholder); color: var(--color-surface-600); float: left; height: 0; pointer-events: none;
}
.ui-rtf-meta { display: flex; justify-content: space-between; gap: 12px; padding: 0 12px; font-size: 12px; line-height: 16px; color: var(--color-surface-700); }
.ui-rtf-meta [data-error] { color: var(--color-red-500); }
.ui-rtf-count { margin-left: auto; font-variant-numeric: tabular-nums; }
.ui-rtf-count[data-full] { color: var(--color-red-500); }
`;
