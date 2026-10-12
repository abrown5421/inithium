// The fixed CSS behind IconPicker (decision 0085): a grid of square icon buttons with a ring in the accent around
// the chosen one, and a pointer cursor on the read-only field. The accent comes from --ui-icon-picker-accent.
// Rendered (once) by IconPicker itself, since composites can't add to <UiProvider />'s stylesheet.

export const iconPickerStyleSheet = [
  '.ui-icon-picker .ui-input-control{cursor:pointer}',
  '.ui-icon-grid{display:grid;grid-template-columns:repeat(8,1fr);gap:4px;max-height:240px;overflow-y:auto;padding:4px;margin:-4px}',
  '.ui-icon-option{display:flex;align-items:center;justify-content:center;aspect-ratio:1;min-width:32px;margin:0;padding:0;' +
    'border:0;border-radius:6px;background:none;color:var(--color-surface-900);cursor:pointer}',
  '.ui-icon-option:hover{background:color-mix(in oklab,var(--ui-icon-picker-accent) 10%,transparent)}',
  '.ui-icon-option[aria-selected=true]{color:var(--ui-icon-picker-accent);box-shadow:0 0 0 2px var(--ui-icon-picker-accent) inset}',
  '.ui-icon-option:focus-visible{outline:2px solid var(--ui-icon-picker-accent);outline-offset:1px}',
].join('');
