// The fixed CSS behind Breadcrumbs (decision 0072): a wrapping row of steps with separators, muted links that turn
// the accent and underline on hover, a bold current page, long labels cut short, and the '…' button. The accent
// comes from --ui-breadcrumbs-accent. Rendered (once) by Breadcrumbs itself.

const focusRing = '{outline:2px solid var(--ui-breadcrumbs-accent);outline-offset:2px}';

export const breadcrumbsStyleSheet = [
  '.ui-breadcrumbs{display:flex;flex-wrap:wrap;align-items:center;row-gap:4px;margin:0;padding:0;list-style:none;' +
    'font-family:var(--font-body);font-size:14px;line-height:20px}',
  '.ui-breadcrumbs-item{display:inline-flex;align-items:center;min-width:0}',
  '.ui-breadcrumbs-separator{display:inline-flex;align-items:center;margin:0 6px;color:var(--color-surface-400)}',

  // Every step lays out its icon and label the same way.
  '.ui-breadcrumbs-link,.ui-breadcrumbs-text,.ui-breadcrumbs-current{display:inline-flex;align-items:center;gap:6px;min-width:0}',
  '.ui-breadcrumbs-link{border-radius:4px;color:var(--color-surface-600);text-decoration:none;transition:color 150ms}',
  '.ui-breadcrumbs-link:hover{color:var(--ui-breadcrumbs-accent);text-decoration:underline;text-underline-offset:2px}',
  `.ui-breadcrumbs-link:focus-visible${focusRing}`,
  '.ui-breadcrumbs-text{color:var(--color-surface-600)}',
  '.ui-breadcrumbs-current{color:var(--color-surface-900);font-weight:600}',
  '.ui-breadcrumbs-label{max-width:200px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}',

  // The '…' that expands a collapsed trail.
  '.ui-breadcrumbs-more{margin:0;padding:0 6px;border:0;border-radius:4px;background:transparent;font:inherit;' +
    'color:var(--color-surface-600);cursor:pointer}',
  '.ui-breadcrumbs-more:hover{background:var(--color-surface-200)}',
  `.ui-breadcrumbs-more:focus-visible${focusRing}`,

  '.ui-breadcrumbs-hidden{position:absolute;width:1px;height:1px;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap}',
  '@media (prefers-reduced-motion:reduce){.ui-breadcrumbs-link{transition:none}}',
].join('');
