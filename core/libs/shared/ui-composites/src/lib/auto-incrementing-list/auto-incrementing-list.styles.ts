// The fixed CSS behind AutoIncrementingList (decision 0070): rows 8px apart, a removed row collapsing so the rows
// below slide up, and a hidden live region for announcements. Rendered (once) by the list itself, since composites
// can't add to <UiProvider />'s stylesheet.

export const autoIncrementingListStyleSheet = [
  '.ui-auto-list{display:flex;flex-direction:column;margin:0;padding:0;list-style:none}',
  '.ui-auto-list-row{display:grid;grid-template-rows:1fr;transition:grid-template-rows 200ms,margin 200ms}',
  '.ui-auto-list-row+.ui-auto-list-row{margin-top:8px}',
  '.ui-auto-list-row[data-collapsed]{grid-template-rows:0fr;margin-top:0}',
  '.ui-auto-list-row>div{min-height:0}',
  '.ui-auto-list-row[data-collapsed]>div{overflow:hidden}',
  '.ui-auto-list-announcer{position:absolute;width:1px;height:1px;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap}',
  '@media (prefers-reduced-motion:reduce){.ui-auto-list-row{transition:none}}',
].join('');
