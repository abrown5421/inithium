// The fixed CSS behind AlertStack (decision 0066): the corner the alerts appear in, the gap between them, closing
// the gap after one leaves, and following a swipe. Radix sets data-swipe and the swipe variables. Rendered by
// AlertStack itself, since composites can't add to <UiProvider />'s stylesheet.

const swipe = (phase: 'move' | 'end') =>
  `translate(var(--radix-toast-swipe-${phase}-x,0px),var(--radix-toast-swipe-${phase}-y,0px))`;

export const alertStackStyleSheet = [
  // The viewport is a fixed column in a corner; it doesn't block clicks on the page, its alerts do.
  '.ui-alert-viewport{position:fixed;z-index:50;display:flex;flex-direction:column;box-sizing:border-box;width:392px;' +
    'max-width:100vw;margin:0;padding:8px 16px 16px;list-style:none;outline:none;pointer-events:none}',
  // Newest nearest the corner: at the bottom for bottom positions, at the top for top positions.
  '.ui-alert-viewport[data-position^=bottom]{bottom:0}',
  '.ui-alert-viewport[data-position^=top]{top:0;flex-direction:column-reverse;padding:16px 16px 8px}',
  '.ui-alert-viewport[data-position$=right]{right:0}',
  '.ui-alert-viewport[data-position$=left]{left:0}',
  '.ui-alert-viewport[data-position$=center]{left:50%;transform:translateX(-50%)}',

  // Each alert collapses to nothing after its exit animation, so the others slide into its place.
  '.ui-alert-item{display:grid;grid-template-rows:1fr;margin-top:8px;pointer-events:auto;transition:grid-template-rows 200ms,margin 200ms}',
  '.ui-alert-viewport[data-position^=top] .ui-alert-item{margin:0 0 8px}',
  '.ui-alert-item[data-collapsed]{grid-template-rows:0fr;margin:0}',
  '.ui-alert-item>div{min-height:0}',
  '.ui-alert-item[data-collapsed]>div{overflow:hidden}',

  // Swiping follows the pointer; a cancelled swipe springs back.
  `.ui-alert-item[data-swipe=move]{transform:${swipe('move')}}`,
  '.ui-alert-item[data-swipe=cancel]{transform:none;transition:transform 200ms}',
  `.ui-alert-item[data-swipe=end]{transform:${swipe('end')}}`,

  '@media (prefers-reduced-motion:reduce){.ui-alert-item{transition:none}}',
].join('');
