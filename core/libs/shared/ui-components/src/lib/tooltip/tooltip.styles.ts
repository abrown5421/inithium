// The fixed CSS behind Tooltip (decision 0064): a small bubble with an arrow, in --ui-tooltip-bg with
// --ui-tooltip-fg text (set inline by the resolver), sliding in from the side it opens on. Radix renders it at the
// end of the page and sets data-side. Published by <UiProvider />.

export const tooltipStyleSheet = [
  '.ui-tooltip{z-index:50;box-sizing:border-box;max-width:240px;padding:4px 8px;border-radius:6px;' +
    'background:var(--ui-tooltip-bg);color:var(--ui-tooltip-fg);font-family:var(--font-body);font-size:12px;line-height:16px;' +
    'overflow-wrap:break-word;box-shadow:0 4px 6px -1px rgb(0 0 0 / 0.1),0 2px 4px -2px rgb(0 0 0 / 0.1);' +
    'animation:ui-tooltip-open 150ms ease-out}',
  // Slide in from the element's direction.
  '.ui-tooltip[data-side=top]{--ui-tooltip-from:translateY(4px)}',
  '.ui-tooltip[data-side=bottom]{--ui-tooltip-from:translateY(-4px)}',
  '.ui-tooltip[data-side=left]{--ui-tooltip-from:translateX(4px)}',
  '.ui-tooltip[data-side=right]{--ui-tooltip-from:translateX(-4px)}',
  '@keyframes ui-tooltip-open{from{opacity:0;transform:var(--ui-tooltip-from)}to{opacity:1;transform:none}}',
  '.ui-tooltip-arrow{fill:var(--ui-tooltip-bg)}',

  // A disabled element sends no pointer events, so the tooltip listens on a focusable wrapper instead.
  '.ui-tooltip-disabled{display:inline-flex;border-radius:6px;cursor:not-allowed}',
  '.ui-tooltip-disabled>*{pointer-events:none}',
  '.ui-tooltip-disabled:focus-visible{outline:2px solid var(--color-surface-500);outline-offset:2px}',

  '@media (prefers-reduced-motion:reduce){.ui-tooltip{animation:none}}',
].join('');
