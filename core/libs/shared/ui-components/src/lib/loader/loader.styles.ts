// The fixed CSS behind Loader (decision 0058): one block per variant, sized by --ui-loader-size and coloured by
// --ui-loader-color (tracks use it at 20%), both set inline by the resolver. .ui-loader-spinner also works on
// its own with those two variables, as in Button's loading state. Published by <UiProvider />.

const track = 'color-mix(in oklab,var(--ui-loader-color) 20%,transparent)';
const size = 'var(--ui-loader-size)';

export const loaderStyleSheet = [
  '.ui-loader{display:inline-flex;flex-shrink:0;align-items:center;justify-content:center;vertical-align:middle}',
  '.ui-loader[data-variant=progress]{display:flex}',
  // Announced, not shown.
  '.ui-loader-label{position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}',

  // spinner: a faint ring with a turning arc.
  `.ui-loader-spinner{display:block;box-sizing:border-box;width:${size};height:${size};border:max(2px,calc(${size} / 8)) solid ${track};` +
    'border-top-color:var(--ui-loader-color);border-radius:50%;animation:ui-loader-spin 0.8s linear infinite}',
  '@keyframes ui-loader-spin{to{transform:rotate(360deg)}}',

  // dots: three dots growing in turn.
  `.ui-loader-dots{display:flex;align-items:center;justify-content:space-between;width:${size};height:${size}}`,
  `.ui-loader-dots>span{width:calc(${size} / 4);height:calc(${size} / 4);border-radius:50%;background:var(--ui-loader-color);` +
    'animation:ui-loader-dot 1s ease-in-out infinite}',
  '@keyframes ui-loader-dot{0%,80%,100%{transform:scale(0.4);opacity:0.5}40%{transform:scale(1);opacity:1}}',

  // bars: four bars rising and falling.
  `.ui-loader-bars{display:flex;align-items:center;justify-content:space-between;width:${size};height:${size}}`,
  `.ui-loader-bars>span{width:calc(${size} / 6);height:100%;border-radius:calc(${size} / 12);background:var(--ui-loader-color);` +
    'animation:ui-loader-bar 1s ease-in-out infinite}',
  '@keyframes ui-loader-bar{0%,40%,100%{transform:scaleY(0.4)}20%{transform:scaleY(1)}}',

  // Dots and bars play in sequence.
  '.ui-loader-dots>span:nth-child(2),.ui-loader-bars>span:nth-child(2){animation-delay:0.12s}',
  '.ui-loader-dots>span:nth-child(3),.ui-loader-bars>span:nth-child(3){animation-delay:0.24s}',
  '.ui-loader-bars>span:nth-child(4){animation-delay:0.36s}',

  // pulse: two rings spreading out and fading, half a cycle apart.
  `.ui-loader-pulse{position:relative;width:${size};height:${size}}`,
  ".ui-loader-pulse::before,.ui-loader-pulse::after{content:'';position:absolute;inset:0;border-radius:50%;" +
    'background:var(--ui-loader-color);animation:ui-loader-pulse 1.2s ease-out infinite}',
  '.ui-loader-pulse::after{animation-delay:0.6s}',
  '@keyframes ui-loader-pulse{0%{transform:scale(0);opacity:1}100%{transform:scale(1);opacity:0}}',

  // progress: a 4px track, with a sliding segment, or a bar filled to the value.
  `.ui-loader-progress{position:relative;width:100%;height:4px;overflow:hidden;border-radius:2px;background:${track}}`,
  '.ui-loader-progress-bar{position:absolute;top:0;bottom:0;left:0;border-radius:inherit;background:var(--ui-loader-color);transition:width 200ms}',
  '.ui-loader-progress[data-indeterminate] .ui-loader-progress-bar{width:40%;animation:ui-loader-slide 1.2s ease-in-out infinite}',
  '@keyframes ui-loader-slide{0%{transform:translateX(-100%)}100%{transform:translateX(250%)}}',

  // Reduced motion: no spinning, bouncing or sliding; a slow fade shows it's still working.
  '@media (prefers-reduced-motion:reduce){' +
    '.ui-loader-spinner,.ui-loader-dots>span,.ui-loader-bars>span,.ui-loader-pulse::before,' +
    '.ui-loader-progress[data-indeterminate] .ui-loader-progress-bar{animation:ui-loader-fade 2s ease-in-out infinite;transform:none}' +
    '.ui-loader-pulse::after{display:none}' +
    '.ui-loader-progress[data-indeterminate] .ui-loader-progress-bar{width:100%}' +
    '.ui-loader-progress-bar{transition:none}' +
    '}',
  '@keyframes ui-loader-fade{0%,100%{opacity:1}50%{opacity:0.4}}',
].join('');
