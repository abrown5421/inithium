// The fixed CSS behind Tabs (decision 0068): a bar of tabs over a divider, an underline in the accent that slides
// to the active tab, and panels that fade in. The accent comes from --ui-tabs-accent; the component measures the
// active tab into --ui-tabs-indicator-x and --ui-tabs-indicator-width. Rendered (once) by Tabs itself, since
// composites can't add to <UiProvider />'s stylesheet.

const divider = 'color-mix(in oklab,var(--color-surface-500) 40%,transparent)';

export const tabsStyleSheet = [
  '.ui-tabs{display:flex;flex-direction:column;font-family:var(--font-body)}',

  // The bar scrolls sideways when the tabs don't fit.
  `.ui-tabs-list{position:relative;display:flex;overflow-x:auto;scrollbar-width:none;border-bottom:1px solid ${divider}}`,
  '.ui-tabs-list::-webkit-scrollbar{display:none}',

  '.ui-tabs-trigger{display:inline-flex;flex-shrink:0;align-items:center;justify-content:center;gap:8px;height:40px;' +
    'margin:0;padding:0 16px;border:0;background:transparent;font:inherit;font-size:14px;font-weight:600;line-height:20px;' +
    'white-space:nowrap;color:var(--color-surface-600);cursor:pointer;transition:color 150ms}',
  '.ui-tabs[data-fill] .ui-tabs-trigger{flex:1 1 0}',
  '.ui-tabs-trigger:hover:not([data-disabled]){color:var(--color-surface-800)}',
  '.ui-tabs-trigger[data-state=active]{color:var(--color-surface-900)}',
  '.ui-tabs-trigger[data-disabled]{opacity:0.5;cursor:not-allowed}',
  '.ui-tabs-trigger:focus-visible{outline:2px solid var(--ui-tabs-accent);outline-offset:-2px;border-radius:4px}',

  // The underline, under the active tab; it doesn't animate into place on the first measurement.
  '.ui-tabs-indicator{position:absolute;bottom:0;left:0;height:2px;width:var(--ui-tabs-indicator-width,0px);' +
    'transform:translateX(var(--ui-tabs-indicator-x,0px));background:var(--ui-tabs-accent);pointer-events:none;' +
    'transition:transform 200ms,width 200ms}',
  '.ui-tabs-list:not([data-measured]) .ui-tabs-indicator{transition:none}',

  // Panels: only the active one shows (kept-mounted ones are hidden), and it fades in.
  '.ui-tabs-panel{padding-top:16px;outline:0}',
  '.ui-tabs-panel[data-state=inactive]{display:none}',
  '.ui-tabs-panel[data-state=active]{animation:ui-tabs-fade 150ms ease-out}',
  '@keyframes ui-tabs-fade{from{opacity:0}}',
  '.ui-tabs-panel:focus-visible{outline:2px solid var(--ui-tabs-accent);outline-offset:2px;border-radius:4px}',

  '@media (prefers-reduced-motion:reduce){.ui-tabs-indicator{transition:none}.ui-tabs-panel[data-state=active]{animation:none}}',
].join('');
