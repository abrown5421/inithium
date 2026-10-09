// The fixed CSS behind Input (decision 0055): variants, the floating label and outline notch, hover and focus
// colours, autofill, and the browser controls it hides. Colours come from variables the resolver sets inline
// (--ui-input-accent, --ui-input-border, --ui-input-border-hover); --ui-input-text-x is where the text starts,
// measured by the component so a resting label clears a start adornment. Published by <UiProvider />.

/** The label floats while the field is focused, has a value, or was autofilled. One rule each, so a browser
 * that doesn't know one pseudo-class still applies the others. */
const floated = [
  '.ui-input:has(.ui-input-control:focus)',
  '.ui-input:has(.ui-input-control:not(:placeholder-shown))',
  '.ui-input:has(.ui-input-control:autofill)',
  '.ui-input:has(.ui-input-control:-webkit-autofill)',
  // Set by fields that aren't text inputs, e.g. Select (decision 0062): data-active while focused or open,
  // data-filled while there's a value.
  '.ui-input[data-active]',
  '.ui-input[data-filled]',
];
const whenFloated = (rules: (root: string) => string) => floated.map(rules).join('');

const enabled = '.ui-input:not([data-disabled])';
// Focused: the text input has focus, or the field says it's active. As specific as the hover rules and written
// after them, so focus wins while the pointer is over the field.
const focused = `${enabled}:is([data-active],:has(.ui-input-control:focus))`;
const underlined = '.ui-input:not([data-variant=outlined])';

const autofill = '{-webkit-text-fill-color:currentColor;transition:background-color 100000s 0s,color 100000s 0s}';

export const inputStyleSheet = [
  // Layout. Outlined labels float into the border; filled and standard labels float above the field.
  '.ui-input{position:relative;display:flex;flex-direction:column;font-family:var(--font-body);font-size:14px;line-height:20px;' +
    '--ui-input-label-rest-y:8px;--ui-input-label-float-x:12px;--ui-input-label-float-y:-7px}',
  '.ui-input[data-label-above]{padding-top:20px;--ui-input-label-rest-y:28px;--ui-input-label-float-x:0px;--ui-input-label-float-y:0px}',
  '.ui-input-field{position:relative;display:flex;align-items:center;gap:8px;box-sizing:border-box;cursor:text}',
  '.ui-input-control{flex:1;min-width:0;height:100%;margin:0;padding:0;border:0;outline:0;background:transparent;color:inherit;font:inherit}',
  '.ui-input-control::placeholder{color:var(--color-surface-600);opacity:1}',
  '.ui-input[data-has-label] .ui-input-control::placeholder{opacity:0;transition:opacity 150ms}',
  '.ui-input[data-has-label] .ui-input-control:focus::placeholder{opacity:1}',

  // Hidden browser controls: search's clear button, Edge's password reveal (Input has its own) and number spinners.
  '.ui-input-control::-webkit-search-cancel-button,.ui-input-control::-webkit-search-decoration{-webkit-appearance:none;appearance:none}',
  '.ui-input-control::-ms-reveal,.ui-input-control::-ms-clear{display:none}',
  '.ui-input-control::-webkit-inner-spin-button,.ui-input-control::-webkit-outer-spin-button{-webkit-appearance:none;margin:0}',
  '.ui-input-control[type=number]{-moz-appearance:textfield;appearance:textfield}',

  // Autofill keeps the field's own background and the inherited text colour.
  `.ui-input-control:autofill${autofill}`,
  `.ui-input-control:-webkit-autofill${autofill}`,

  // The label: resting where the text starts, floated smaller.
  '.ui-input-label{position:absolute;top:0;left:0;z-index:1;max-width:calc(100% - var(--ui-input-text-x,0px) - 12px);overflow:hidden;white-space:nowrap;' +
    'text-overflow:ellipsis;line-height:16px;color:var(--color-surface-600);pointer-events:none;transform-origin:top left;' +
    'transform:translate(var(--ui-input-text-x,0px),var(--ui-input-label-rest-y));transition:transform 150ms,color 150ms,max-width 150ms}',
  whenFloated(
    (root) =>
      `${root} .ui-input-label{max-width:calc(116% - 28px);transform:translate(var(--ui-input-label-float-x),var(--ui-input-label-float-y)) scale(0.857)}`,
  ),
  `${focused} .ui-input-label,.ui-input[data-error] .ui-input-label{color:var(--ui-input-accent)}`,

  // Outlined: a fieldset draws the border, and its legend opens a notch for the floated label.
  '.ui-input[data-variant=outlined] .ui-input-field{border-radius:6px}',
  '.ui-input-outline{position:absolute;inset:-5px 0 0;margin:0;padding:0 8px;min-width:0;overflow:hidden;text-align:left;' +
    'border:1px solid var(--ui-input-border);border-radius:6px;pointer-events:none;transition:border-color 150ms}',
  '.ui-input-outline>legend{float:unset;display:block;width:auto;max-width:0.01px;height:11px;padding:0;overflow:hidden;' +
    'font-size:12px;line-height:11px;white-space:nowrap;visibility:hidden;transition:max-width 50ms}',
  '.ui-input-outline>legend>span{display:inline-block;padding:0 4px;opacity:0;visibility:visible}',
  whenFloated((root) => `${root} .ui-input-outline>legend{max-width:100%;transition:max-width 100ms 50ms}`),
  `${enabled} .ui-input-field:hover .ui-input-outline{border-color:var(--ui-input-border-hover)}`,
  `${focused} .ui-input-outline{border-color:var(--ui-input-accent);border-width:2px}`,

  // Filled and standard: a resting underline, and an accent underline that grows from the centre on focus.
  '.ui-input[data-variant=filled] .ui-input-field{background:var(--color-surface-200);border-radius:6px 6px 0 0;transition:background-color 150ms}',
  `${enabled}[data-variant=filled] .ui-input-field:hover{background:var(--color-surface-300)}`,
  `${underlined} .ui-input-field::before,${underlined} .ui-input-field::after{content:'';position:absolute;left:0;right:0;bottom:0;pointer-events:none}`,
  `${underlined} .ui-input-field::before{border-bottom:1px solid var(--ui-input-border);transition:border-color 150ms}`,
  `${enabled}${underlined.slice('.ui-input'.length)} .ui-input-field:hover::before{border-bottom-color:var(--ui-input-border-hover)}`,
  `${underlined} .ui-input-field::after{border-bottom:2px solid var(--ui-input-accent);transform:scaleX(0);transition:transform 150ms}`,
  `${focused} .ui-input-field::after,.ui-input[data-error] .ui-input-field::after{transform:scaleX(1)}`,

  // Adornments; clickable ones are small borderless buttons.
  '.ui-input-adornments{display:inline-flex;flex-shrink:0;align-items:center;gap:4px}',
  '.ui-input-adornment{display:inline-flex;flex-shrink:0;align-items:center;justify-content:center;color:var(--color-surface-600)}',
  '.ui-input-adornment-button{width:24px;height:24px;margin:0 -4px;padding:0;border:0;border-radius:4px;background:transparent;' +
    'cursor:pointer;transition:background-color 150ms}',
  '.ui-input-adornment-button:hover:not(:disabled){background:color-mix(in oklab,currentColor 12%,transparent)}',
  '.ui-input-adornment-button:focus-visible{outline:2px solid var(--ui-input-accent,currentColor);outline-offset:0}',
  '.ui-input-adornment-button:disabled{cursor:not-allowed}',

  // Helper text, and the disabled look.
  '.ui-input-helper{margin:4px 0 0;padding:0 12px;font-size:12px;line-height:16px;color:var(--color-surface-600)}',
  '.ui-input[data-variant=standard] .ui-input-helper{padding:0}',
  '.ui-input[data-error] .ui-input-helper{color:var(--ui-input-accent)}',
  '.ui-input[data-disabled]{opacity:0.5}',
  '.ui-input[data-disabled] .ui-input-field,.ui-input[data-disabled] .ui-input-control{cursor:not-allowed}',

  // Reduced motion: the label, notch and underline move instantly.
  '@media (prefers-reduced-motion:reduce){.ui-input-label,.ui-input-outline,.ui-input-outline>legend,.ui-input-field,' +
    '.ui-input-field::before,.ui-input-field::after{transition:none}}',
].join('');
