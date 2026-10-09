// The fixed CSS behind Slider (decision 0063): a 4px track in a 32px row, filled in the accent, with 16px thumbs,
// a value bubble above each thumb, and optional tick marks with labels underneath. The accent comes from
// --ui-slider-accent, set inline by the resolver. Published by <UiProvider />.

const enabled = '.ui-slider:not([data-disabled])';

export const sliderStyleSheet = [
  '.ui-slider{display:flex;flex-direction:column;font-family:var(--font-body);font-size:14px;line-height:20px}',
  '.ui-slider-header{display:flex;justify-content:space-between;gap:12px}',
  '.ui-slider-label{font-weight:600}',
  '.ui-slider-value{color:var(--color-surface-600);font-variant-numeric:tabular-nums}',

  // The row: room above for an always-visible bubble, and below for mark labels.
  '.ui-slider-root{position:relative;display:flex;align-items:center;height:32px;touch-action:none;user-select:none}',
  '.ui-slider[data-value-label=always] .ui-slider-root{margin-top:24px}',
  '.ui-slider[data-mark-labels] .ui-slider-root{margin-bottom:20px}',
  '.ui-slider-track{position:relative;flex-grow:1;height:4px;overflow:hidden;border-radius:2px;background:var(--color-surface-300)}',
  '.ui-slider-range{position:absolute;height:100%;background:var(--ui-slider-accent)}',

  // Thumbs: grow a little on hover and while pressed.
  '.ui-slider-thumb{display:block;width:16px;height:16px;border-radius:50%;background:var(--ui-slider-accent);' +
    'box-shadow:0 0 0 2px var(--color-surface-50),0 1px 3px rgb(0 0 0 / 0.3);cursor:grab;transition:transform 150ms}',
  `${enabled} .ui-slider-thumb:hover{transform:scale(1.15)}`,
  `${enabled} .ui-slider-thumb:active{transform:scale(1.25);cursor:grabbing}`,
  '.ui-slider-thumb:focus-visible{outline:2px solid var(--ui-slider-accent);outline-offset:3px}',

  // The value bubble: shown while hovered, focused or dragged ('auto'), always, or never.
  '.ui-slider-bubble{position:absolute;bottom:calc(100% + 8px);left:50%;padding:2px 6px;border-radius:4px;' +
    'background:var(--color-surface-900);color:var(--color-surface-50);font-size:12px;line-height:16px;white-space:nowrap;' +
    'font-variant-numeric:tabular-nums;pointer-events:none;opacity:0;transform:translateX(-50%) scale(0.8);' +
    'transition:opacity 150ms,transform 150ms}',
  '.ui-slider[data-value-label=always] .ui-slider-bubble,' +
    `.ui-slider[data-value-label=auto]:not([data-disabled]) .ui-slider-thumb:is(:hover,:focus-visible,:active) .ui-slider-bubble,` +
    '.ui-slider[data-value-label=auto][data-dragging] .ui-slider-bubble{opacity:1;transform:translateX(-50%) scale(1)}',
  '.ui-slider[data-value-label=off] .ui-slider-bubble{display:none}',

  // Marks: dots on the track (light on the filled part), labels underneath.
  '.ui-slider-marks{position:absolute;inset:0;pointer-events:none}',
  '.ui-slider-mark{position:absolute;top:50%;width:4px;height:4px;border-radius:50%;background:var(--color-surface-500);' +
    'transform:translate(-50%,-50%)}',
  '.ui-slider-mark[data-active]{background:var(--color-surface-50)}',
  '.ui-slider-mark-label{position:absolute;top:12px;left:50%;transform:translateX(-50%);font-size:12px;line-height:16px;' +
    'white-space:nowrap;color:var(--color-surface-600)}',

  '.ui-slider-helper{margin:4px 0 0;font-size:12px;line-height:16px;color:var(--color-surface-600)}',
  '.ui-slider[data-error] .ui-slider-helper{color:var(--ui-slider-accent)}',

  '.ui-slider[data-disabled]{opacity:0.5}',
  '.ui-slider[data-disabled] .ui-slider-thumb{cursor:not-allowed}',

  '@media (prefers-reduced-motion:reduce){.ui-slider-thumb,.ui-slider-bubble{transition:none}}',
].join('');
