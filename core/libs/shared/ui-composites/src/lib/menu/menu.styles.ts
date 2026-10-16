// The fixed CSS behind Menu: a raised surface panel of rows, the highlighted row tinted, a danger row in red, and a
// shortcut hint at each row's end. Rendered (once) by Menu itself, since composites can't add to <UiProvider />'s
// stylesheet.

export const menuStyleSheet = [
  '.ui-menu{position:relative;z-index:50;min-width:200px;max-width:min(320px,calc(100vw - 16px));padding:4px;' +
    'border-radius:8px;border:1px solid color-mix(in oklab,var(--color-surface-500) 40%,transparent);' +
    'background:var(--color-surface-50);color:var(--color-surface-900);font-family:var(--font-body);' +
    'box-shadow:var(--shadow-lg);animation:ui-menu-in 120ms ease-out;transform-origin:var(--radix-dropdown-menu-content-transform-origin)}',
  '@keyframes ui-menu-in{from{opacity:0;transform:scale(0.97)}}',
  '@media (prefers-reduced-motion:reduce){.ui-menu{animation:none}}',

  '.ui-menu-item{display:flex;align-items:center;gap:10px;height:32px;padding:0 10px;border-radius:6px;' +
    'font-size:14px;font-weight:500;line-height:20px;cursor:pointer;outline:0;user-select:none;white-space:nowrap}',
  '.ui-menu-item[data-highlighted]{background:var(--color-surface-200)}',
  '.ui-menu-item[data-disabled]{opacity:0.5;cursor:not-allowed}',
  '.ui-menu-item[data-danger]{color:var(--color-red-600)}',
  '.ui-menu-item[data-danger][data-highlighted]{background:color-mix(in oklab,var(--color-red-500) 12%,transparent)}',
  '.ui-menu-label{flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis}',
  // A row with a description grows to two lines, its icon beside the label.
  '.ui-menu-item[data-described]{height:auto;min-height:32px;padding:8px 10px;align-items:flex-start}',
  '.ui-menu-item[data-described] .ui-menu-label{white-space:normal}',
  '.ui-menu-description{display:block;margin-top:2px;font-size:12px;font-weight:400;line-height:16px;color:var(--color-surface-600)}',
  '.ui-menu-heading{padding:8px 10px 4px;font-size:11px;font-weight:600;letter-spacing:0.5px;text-transform:uppercase;color:var(--color-surface-600)}',
  '.ui-menu-shortcut{margin-left:16px;font-size:12px;color:var(--color-surface-600)}',
  '.ui-menu-separator{height:1px;margin:4px 6px;background:color-mix(in oklab,var(--color-surface-500) 30%,transparent)}',
].join('');
