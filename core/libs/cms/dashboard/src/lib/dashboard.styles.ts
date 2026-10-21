// The fixed CSS behind the dashboard (decision 0120). Widths are fractions of the row with the gaps taken out, so
// four quarters or a third and two thirds fill it exactly. Each cell is half the screen under the top bar (less the
// screen's padding and the gap between rows) and at least 300px tall, so two rows show above the fold. Narrower
// dashboards (measured by the dashboard's own width, since the sidebar takes some of the screen) use halves, then
// full width. Rendered (once) by DashboardScreen.

const GAP = 24;

export const dashboardStyleSheet = [
  `.cms-dashboard{display:flex;flex-wrap:wrap;align-items:stretch;gap:${GAP}px;margin:0;padding:0;list-style:none;container-type:inline-size}`,
  `.cms-dashboard-cell{--cms-span:1;box-sizing:border-box;flex:0 0 auto;min-width:0;` +
    `width:calc(var(--cms-span) * (100% + ${GAP}px) - ${GAP}px);` +
    `height:max(300px, calc((100dvh - var(--ui-navbar-height, 64px) - 64px - ${GAP}px) / 2))}`,
  '.cms-dashboard-cell[data-width="1/4"]{--cms-span:0.25}',
  '.cms-dashboard-cell[data-width="1/3"]{--cms-span:0.333333}',
  '.cms-dashboard-cell[data-width="2/3"]{--cms-span:0.666667}',
  '@container (max-width: 899px){' +
    '.cms-dashboard-cell[data-width="1/4"],.cms-dashboard-cell[data-width="1/3"]{--cms-span:0.5}' +
    '.cms-dashboard-cell[data-width="2/3"]{--cms-span:1}}',
  '@container (max-width: 559px){.cms-dashboard-cell[data-width]{--cms-span:1}}',
  // The add tile's button: the whole tile is the target.
  '.cms-dashboard-add{all:unset;box-sizing:border-box;display:flex;flex-direction:column;align-items:center;justify-content:center;' +
    'gap:12px;width:100%;height:100%;border:2px dashed var(--color-surface-500);border-radius:12px;' +
    'background:var(--color-surface-200);color:var(--color-surface-800);cursor:pointer;transition:background-color 150ms,border-color 150ms}',
  '.cms-dashboard-add:hover{background:var(--color-surface-300);border-color:var(--color-primary-500)}',
  '.cms-dashboard-add:focus-visible{outline:2px solid var(--color-primary-500);outline-offset:2px}',
  '.cms-dashboard-add-plus{display:flex;align-items:center;justify-content:center;width:48px;height:48px;border-radius:999px;' +
    'background:var(--color-primary-500);color:var(--color-primary-100)}',
  // The picker's tiles: a plain <button> around a Container, since Button is a fixed 32px row.
  '[data-widget-tile]{all:unset;display:block;box-sizing:border-box;width:100%;cursor:pointer;border-radius:8px}',
  '[data-widget-tile]:focus-visible{outline:2px solid var(--color-primary-500);outline-offset:2px}',
  '@media (prefers-reduced-motion:reduce){.cms-dashboard-add{transition:none}}',
].join('');
