// The fixed CSS behind Select (decision 0062). The field reuses Input's classes and stylesheet (.ui-input,
// .ui-input-field, label, outline, helper); these rules make the field a button, place its value and chevron, and
// style the popup list, which Radix renders at the end of the page. --ui-input-accent is set on the list too,
// since it isn't inside the field. Published by <UiProvider />.

const listBorder = 'color-mix(in oklab,var(--color-surface-500) 40%,transparent)';

export const selectStyleSheet = [
  // The field is the trigger button.
  '.ui-select-trigger{width:100%;margin:0;border:0;background:transparent;font:inherit;color:inherit;text-align:left;cursor:pointer;outline:0}',
  '.ui-input[data-disabled] .ui-select-trigger{cursor:not-allowed}',
  '.ui-select-value{flex:1;min-width:0;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}',
  // The placeholder: muted, and (with a label) shown only once the label has floated, as on Input.
  '.ui-select-trigger[data-placeholder] .ui-select-value{color:var(--color-surface-600)}',
  '.ui-input[data-has-label]:not([data-active]) .ui-select-trigger[data-placeholder] .ui-select-value{opacity:0}',
  '.ui-select-value{transition:opacity 150ms}',
  '.ui-select-chevron{display:inline-flex;flex-shrink:0;color:var(--color-surface-600);transition:transform 150ms}',
  '.ui-input[data-open] .ui-select-chevron{transform:rotate(180deg)}',

  // The list: below the field, as wide as it, never taller than 280px or the space available.
  '.ui-select-content{z-index:50;box-sizing:border-box;min-width:var(--radix-select-trigger-width);' +
    'max-height:min(280px,var(--radix-select-content-available-height));overflow:hidden;' +
    `border:1px solid ${listBorder};border-radius:8px;background:var(--color-surface-50);` +
    'box-shadow:0 10px 15px -3px rgb(0 0 0 / 0.1),0 4px 6px -4px rgb(0 0 0 / 0.1);' +
    'font-family:var(--font-body);font-size:14px;line-height:20px;color:var(--color-surface-900);' +
    'transform-origin:var(--radix-select-content-transform-origin);animation:ui-select-open 150ms ease-out}',
  '@keyframes ui-select-open{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:none}}',
  '.ui-select-viewport{padding:4px}',
  '.ui-select-scroll{display:flex;align-items:center;justify-content:center;height:24px;color:var(--color-surface-600);cursor:default}',

  // Rows: 32px, highlighted while hovered or reached by keyboard, a check in the accent on the chosen one.
  '.ui-select-item{display:flex;align-items:center;gap:8px;height:32px;padding:0 8px 0 12px;border-radius:4px;' +
    'outline:0;cursor:pointer;user-select:none}',
  '.ui-select-item[data-highlighted]{background:var(--color-surface-200)}',
  '.ui-select-item[data-disabled]{opacity:0.5;cursor:not-allowed}',
  '.ui-select-item-icon{display:inline-flex;color:var(--color-surface-600)}',
  '.ui-select-item-text{flex:1;min-width:0;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}',
  '.ui-select-item-check{display:inline-flex;color:var(--ui-input-accent)}',

  // Group headings and the line between groups.
  '.ui-select-group-label{padding:8px 12px 4px;font-size:12px;line-height:16px;font-weight:600;color:var(--color-surface-600)}',
  `.ui-select-separator{height:1px;margin:4px 0;background:${listBorder}}`,

  '@media (prefers-reduced-motion:reduce){.ui-select-content{animation:none}.ui-select-chevron,.ui-select-value{transition:none}}',
].join('');
