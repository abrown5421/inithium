// The fixed CSS behind Switch (decision 0059): a 36×20 track centred in a 32px row, neutral when off and filled
// with the accent when on, and a 16px thumb that slides across with an optional icon. The colours come from
// variables the resolver sets inline (--ui-switch-accent, --ui-switch-on-accent). Radix sets data-state on the
// track and thumb. Published by <UiProvider />.

const enabled = '.ui-switch:not([data-disabled])';

export const switchStyleSheet = [
  '.ui-switch{display:flex;flex-direction:column;font-family:var(--font-body);font-size:14px;line-height:20px}',
  '.ui-switch-row{display:flex;align-items:center;gap:8px;min-height:32px}',
  // Label first, switch pushed to the far end.
  '.ui-switch[data-label-placement=start] .ui-switch-row{flex-direction:row-reverse;justify-content:space-between}',

  // The track, reset from the browser's button styles.
  '.ui-switch-track{position:relative;display:inline-flex;flex-shrink:0;align-items:center;box-sizing:border-box;width:36px;height:20px;' +
    'margin:0;padding:0;border:0;border-radius:999px;background:var(--color-surface-300);cursor:pointer;transition:background-color 150ms}',
  `${enabled} .ui-switch-track[data-state=unchecked]:hover{background:var(--color-surface-400)}`,
  '.ui-switch-track[data-state=checked]{background:var(--ui-switch-accent)}',
  '.ui-switch-track:focus-visible{outline:2px solid var(--ui-switch-accent);outline-offset:2px}',
  // An error rings the track in the (red) accent, on or off.
  '.ui-switch[data-error] .ui-switch-track{box-shadow:inset 0 0 0 2px var(--ui-switch-accent)}',

  // The thumb slides from 2px in on the left to 2px in on the right.
  '.ui-switch-thumb{display:inline-flex;align-items:center;justify-content:center;width:16px;height:16px;border-radius:50%;' +
    'background:var(--color-surface-50);color:var(--color-surface-500);box-shadow:0 1px 2px rgb(0 0 0 / 0.2);' +
    'transform:translateX(2px);transition:transform 150ms,background-color 150ms,color 150ms}',
  '.ui-switch-thumb[data-state=checked]{transform:translateX(18px);background:var(--ui-switch-on-accent);color:var(--ui-switch-accent)}',
  // The thumb holds both icons; its state shows one.
  '.ui-switch-thumb>span{display:inline-flex}',
  '.ui-switch-thumb[data-state=checked] .ui-switch-icon-unchecked,.ui-switch-thumb[data-state=unchecked] .ui-switch-icon-checked{display:none}',

  '.ui-switch-label{cursor:pointer;user-select:none}',

  // Helper text lines up with the label: past the track and gap, or at the start.
  '.ui-switch-helper{margin:0 0 0 44px;font-size:12px;line-height:16px;color:var(--color-surface-600)}',
  '.ui-switch[data-label-placement=start] .ui-switch-helper{margin-left:0}',
  '.ui-switch[data-error] .ui-switch-helper{color:var(--ui-switch-accent)}',

  '.ui-switch[data-disabled]{opacity:0.5}',
  '.ui-switch[data-disabled] .ui-switch-track,.ui-switch[data-disabled] .ui-switch-label{cursor:not-allowed}',

  '@media (prefers-reduced-motion:reduce){.ui-switch-track,.ui-switch-thumb{transition:none}}',
].join('');
