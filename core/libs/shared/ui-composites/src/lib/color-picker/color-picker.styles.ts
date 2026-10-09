// The fixed CSS behind ColorPicker (decision 0069): square swatches with a ring in the accent around the chosen
// one, and a pointer cursor on the read-only field. The accent comes from --ui-color-picker-accent. Rendered
// (once) by ColorPicker itself, since composites can't add to <UiProvider />'s stylesheet.

export const colorPickerStyleSheet = [
  '.ui-color-picker .ui-input-control{cursor:pointer}',
  '.ui-color-swatch{display:block;width:100%;aspect-ratio:1;margin:0;padding:0;border-radius:6px;cursor:pointer;' +
    'border:1px solid color-mix(in oklab,var(--color-surface-500) 30%,transparent);transition:transform 100ms,box-shadow 100ms}',
  '.ui-color-swatch:hover{transform:scale(1.06)}',
  // aria-checked, not data-state: the swatch's Tooltip sets its own data-state on the same element.
  '.ui-color-swatch[aria-checked=true]{box-shadow:0 0 0 2px var(--color-surface-50),0 0 0 4px var(--ui-color-picker-accent)}',
  '.ui-color-swatch:focus-visible{outline:2px solid var(--ui-color-picker-accent);outline-offset:4px}',
  '@media (prefers-reduced-motion:reduce){.ui-color-swatch{transition:none}.ui-color-swatch:hover{transform:none}}',
].join('');
