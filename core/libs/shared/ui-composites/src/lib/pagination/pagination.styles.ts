// The fixed CSS behind Pagination (decision 0073): square page items that work as buttons or links, ghost by
// default and filled in the accent for the current page, like Button's ghost and filled variants. The accent and
// the text on it come from --ui-pagination-accent and --ui-pagination-on-accent. Rendered (once) by Pagination.

export const paginationStyleSheet = [
  '.ui-pagination{display:flex;flex-wrap:wrap;align-items:center;gap:8px 16px;font-family:var(--font-body);font-size:14px;line-height:20px}',
  '.ui-pagination-pages{display:flex;flex-wrap:wrap;align-items:center;gap:4px;margin:0;padding:0;list-style:none}',
  '.ui-page{display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;min-width:32px;height:32px;' +
    'padding:0 6px;margin:0;border:2px solid transparent;border-radius:6px;background:transparent;font:inherit;font-weight:500;' +
    'font-variant-numeric:tabular-nums;color:var(--ui-pagination-accent);text-decoration:none;cursor:pointer;' +
    'transition:background-color 150ms,color 150ms}',
  '.ui-page:hover:not(:disabled):not([aria-current]){background:var(--color-surface-200)}',
  '.ui-page[aria-current=page]{background:var(--ui-pagination-accent);color:var(--ui-pagination-on-accent);cursor:default}',
  '.ui-page:disabled{opacity:0.5;cursor:not-allowed}',
  '.ui-page:focus-visible{outline:2px solid var(--ui-pagination-accent);outline-offset:2px}',
  '.ui-pagination-gap{display:inline-flex;justify-content:center;min-width:32px;color:var(--color-surface-600)}',
  '.ui-pagination-text{color:var(--color-surface-600);font-variant-numeric:tabular-nums;white-space:nowrap}',
  '.ui-pagination-size{display:flex;align-items:center;gap:8px}',
  '@media (prefers-reduced-motion:reduce){.ui-page{transition:none}}',
].join('');
