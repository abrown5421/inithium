// The fixed CSS behind FontPicker (decision 0111): a column of full-width options, each drawn in its own font, with the
// chosen one tinted and ringed in the accent, and a pointer cursor on the read-only field. The accent comes from
// --ui-font-picker-accent. Rendered (once) by FontPicker itself, since composites can't add to <UiProvider />'s stylesheet.

export const fontPickerStyleSheet = [
  '.ui-font-picker .ui-input-control{cursor:pointer}',
  '.ui-font-list{display:flex;flex-direction:column;gap:2px;max-height:320px;overflow-y:auto;padding:4px;margin:-4px}',
  '.ui-font-option{display:flex;flex-direction:column;align-items:flex-start;gap:2px;width:100%;min-width:0;margin:0;padding:8px 12px;' +
    'border:0;border-radius:6px;background:none;color:var(--color-surface-900);text-align:start;cursor:pointer}',
  '.ui-font-option:hover{background:color-mix(in oklab,var(--ui-font-picker-accent) 10%,transparent)}',
  '.ui-font-option[aria-selected=true]{background:color-mix(in oklab,var(--ui-font-picker-accent) 12%,transparent);' +
    'box-shadow:0 0 0 2px var(--ui-font-picker-accent) inset}',
  '.ui-font-option:focus-visible{outline:2px solid var(--ui-font-picker-accent);outline-offset:1px}',
].join('');
