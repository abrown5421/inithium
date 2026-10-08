// The fixed CSS behind Checkbox (decision 0057): an 18px box centred in a 32px row, outlined in the accent,
// filled with it when checked or indeterminate, with the light check drawn on top. The colours come from
// variables the resolver sets inline (--ui-checkbox-accent, --ui-checkbox-on-accent). Radix sets data-state on
// the box. Published by <UiProvider />.

const enabled = '.ui-checkbox:not([data-disabled])';

export const checkboxStyleSheet = [
  '.ui-checkbox{display:flex;flex-direction:column;font-family:var(--font-body);font-size:14px;line-height:20px}',
  '.ui-checkbox-row{display:flex;align-items:center;gap:8px;min-height:32px}',

  // The box, reset from the browser's button styles.
  '.ui-checkbox-box{display:inline-flex;flex-shrink:0;align-items:center;justify-content:center;box-sizing:border-box;' +
    'width:18px;height:18px;margin:0;padding:0;border:2px solid var(--ui-checkbox-accent);border-radius:4px;' +
    'background:transparent;color:var(--ui-checkbox-on-accent);cursor:pointer;transition:background-color 150ms,border-color 150ms}',
  `${enabled} .ui-checkbox-box[data-state=unchecked]:hover{background:color-mix(in oklab,var(--ui-checkbox-accent) 12%,transparent)}`,
  '.ui-checkbox-box[data-state=checked],.ui-checkbox-box[data-state=indeterminate]{background:var(--ui-checkbox-accent)}',
  '.ui-checkbox-box:focus-visible{outline:2px solid var(--ui-checkbox-accent);outline-offset:2px}',
  '.ui-checkbox-indicator,.ui-checkbox-indicator>span{display:inline-flex}',
  // The indicator holds a check and a dash; the box's state shows one.
  '.ui-checkbox-box[data-state=checked] .ui-checkbox-mark-indeterminate,' +
    '.ui-checkbox-box[data-state=indeterminate] .ui-checkbox-mark-checked{display:none}',

  '.ui-checkbox-label{cursor:pointer;user-select:none}',

  // Helper text sits under the label, past the box and the gap.
  '.ui-checkbox-helper{margin:0 0 0 26px;font-size:12px;line-height:16px;color:var(--color-surface-600)}',
  '.ui-checkbox[data-error] .ui-checkbox-helper{color:var(--ui-checkbox-accent)}',

  '.ui-checkbox[data-disabled]{opacity:0.5}',
  '.ui-checkbox[data-disabled] .ui-checkbox-box,.ui-checkbox[data-disabled] .ui-checkbox-label{cursor:not-allowed}',

  '@media (prefers-reduced-motion:reduce){.ui-checkbox-box{transition:none}}',
].join('');
