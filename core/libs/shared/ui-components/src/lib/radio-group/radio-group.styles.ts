// The fixed CSS behind RadioGroup (decision 0061): 18px circular radios outlined in the accent, with an accent dot
// when selected, laid out as plain rows or bordered cards, vertically or horizontally. The accent comes from
// --ui-radio-accent, set inline by the resolver. Radix sets data-state on each radio. Published by <UiProvider />.

const enabled = '.ui-radio-group:not([data-disabled])';
const selectedOption = '.ui-radio-option:has(.ui-radio-control[data-state=checked])';
const cardBorder = 'color-mix(in oklab,var(--color-surface-500) 40%,transparent)';

export const radioGroupStyleSheet = [
  '.ui-radio-group{display:flex;flex-direction:column;font-family:var(--font-body);font-size:14px;line-height:20px}',
  '.ui-radio-group-label{margin-bottom:4px;font-weight:600}',

  // Options: a column, or a wrapping row.
  '.ui-radio-group-options{display:flex;flex-direction:column}',
  '.ui-radio-group[data-orientation=horizontal] .ui-radio-group-options{flex-direction:row;flex-wrap:wrap;column-gap:24px}',
  '.ui-radio-group[data-variant=card] .ui-radio-group-options{gap:8px}',
  '.ui-radio-group[data-variant=card][data-orientation=horizontal] .ui-radio-group-options{flex-wrap:nowrap;gap:12px}',

  // An option is a label around its radio and text, so clicking anywhere on it selects it.
  '.ui-radio-option{display:flex;align-items:flex-start;gap:8px;cursor:pointer;user-select:none}',
  '.ui-radio-option[data-disabled]{opacity:0.5;cursor:not-allowed}',
  '.ui-radio-option-text{display:flex;flex-direction:column}',
  '.ui-radio-option-helper{font-size:12px;line-height:16px;color:var(--color-surface-600)}',

  // The radio, reset from the browser's button styles; centred on a 32px row (plain) or a 20px line (card).
  '.ui-radio-control{display:inline-flex;flex-shrink:0;align-items:center;justify-content:center;box-sizing:border-box;' +
    'width:18px;height:18px;margin:7px 0 0;padding:0;border:2px solid var(--ui-radio-accent);border-radius:50%;' +
    'background:transparent;cursor:inherit;transition:background-color 150ms}',
  '.ui-radio-group[data-variant=plain] .ui-radio-option-text{padding-top:6px;padding-bottom:6px}',
  `${enabled} .ui-radio-option:not([data-disabled]):hover .ui-radio-control[data-state=unchecked]{background:color-mix(in oklab,var(--ui-radio-accent) 12%,transparent)}`,
  '.ui-radio-control:focus-visible{outline:2px solid var(--ui-radio-accent);outline-offset:2px}',
  '.ui-radio-dot{display:block;width:8px;height:8px;border-radius:50%;background:var(--ui-radio-accent)}',

  // Card: a bordered option, outlined in the accent and faintly tinted when selected.
  `.ui-radio-group[data-variant=card] .ui-radio-option{flex:1 1 0;padding:12px;border:1px solid ${cardBorder};border-radius:8px;` +
    'transition:border-color 150ms,background-color 150ms,box-shadow 150ms}',
  '.ui-radio-group[data-variant=card] .ui-radio-control{margin-top:1px}',
  `${enabled}[data-variant=card] .ui-radio-option:not([data-disabled]):hover{border-color:var(--color-surface-500)}`,
  `.ui-radio-group[data-variant=card] ${selectedOption}{border-color:var(--ui-radio-accent);box-shadow:0 0 0 1px var(--ui-radio-accent);` +
    'background:color-mix(in oklab,var(--ui-radio-accent) 6%,transparent)}',
  '.ui-radio-group[data-variant=card][data-error] .ui-radio-option{border-color:var(--ui-radio-accent)}',
  '.ui-radio-option-icon{display:inline-flex;margin-bottom:4px;color:var(--color-surface-700)}',
  `${selectedOption} .ui-radio-option-icon{color:var(--ui-radio-accent)}`,
  '.ui-radio-option-label{font-weight:500}',
  '.ui-radio-group[data-variant=plain] .ui-radio-option-label{font-weight:400}',

  // Group helper text and the error.
  '.ui-radio-group-helper{margin:4px 0 0;font-size:12px;line-height:16px;color:var(--color-surface-600)}',
  '.ui-radio-group[data-error] .ui-radio-group-helper{color:var(--ui-radio-accent)}',

  '.ui-radio-group[data-disabled]{opacity:0.5}',
  '.ui-radio-group[data-disabled] .ui-radio-option{cursor:not-allowed}',

  '@media (prefers-reduced-motion:reduce){.ui-radio-control,.ui-radio-option{transition:none}}',
].join('');
