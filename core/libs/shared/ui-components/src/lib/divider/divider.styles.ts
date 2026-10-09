// The fixed CSS behind Divider (decision 0060): a line drawn as a border from --ui-divider-color,
// --ui-divider-thickness and --ui-divider-style (set inline by the resolver), horizontal or vertical, optionally
// split by a label. Published by <UiProvider />.

const line = 'var(--ui-divider-thickness) var(--ui-divider-style) var(--ui-divider-color)';

export const dividerStyleSheet = [
  '.ui-divider{flex-shrink:0;box-sizing:border-box;margin:0;border:0}',

  // A plain line: fills the width, or the height of a flex row (or 1em inline in text).
  `.ui-divider[data-orientation=horizontal]:not([data-labelled]){align-self:stretch;height:0;border-top:${line}}`,
  `.ui-divider[data-orientation=vertical]:not([data-labelled]){display:inline-block;align-self:stretch;width:0;min-height:1em;` +
    `vertical-align:middle;border-left:${line}}`,

  // A labelled line: two line segments around the text.
  '.ui-divider[data-labelled]{display:flex;align-items:center;align-self:stretch}',
  '.ui-divider[data-labelled][data-orientation=vertical]{flex-direction:column}',
  '.ui-divider-line{flex:1}',
  `.ui-divider[data-orientation=horizontal] .ui-divider-line{border-top:${line}}`,
  `.ui-divider[data-orientation=vertical] .ui-divider-line{min-height:8px;border-left:${line}}`,
  // start and end put the label near one end instead of the middle.
  '.ui-divider[data-label-align=start] .ui-divider-line:first-child,.ui-divider[data-label-align=end] .ui-divider-line:last-child{flex:0 0 24px}',
  '.ui-divider-label{padding:0 12px;font-family:var(--font-body);font-size:14px;line-height:20px;white-space:nowrap;color:var(--color-surface-600)}',
  '.ui-divider[data-orientation=vertical] .ui-divider-label{padding:8px 0}',
].join('');
