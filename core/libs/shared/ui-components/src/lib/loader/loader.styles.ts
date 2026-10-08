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

  // ring: two arcs, an outer and an inner one, turning in opposite directions.
  `.ui-loader-ring{position:relative;box-sizing:border-box;width:${size};height:${size};border:max(2px,calc(${size} / 12)) solid transparent;` +
    'border-top-color:var(--ui-loader-color);border-bottom-color:var(--ui-loader-color);border-radius:50%;' +
    'animation:ui-loader-spin 1.2s linear infinite}',
  `.ui-loader-ring::after{content:'';position:absolute;inset:calc(${size} / 6);border:inherit;border-color:transparent;` +
    'border-left-color:var(--ui-loader-color);border-right-color:var(--ui-loader-color);border-radius:50%;' +
    'animation:ui-loader-spin 0.8s linear infinite reverse}',

  // orbit: a dot circling a faint track.
  `.ui-loader-orbit{position:relative;width:${size};height:${size};animation:ui-loader-spin 1s linear infinite}`,
  `.ui-loader-orbit::before{content:'';position:absolute;inset:calc(${size} / 8);border:max(1px,calc(${size} / 16)) solid ${track};border-radius:50%}`,
  `.ui-loader-orbit::after{content:'';position:absolute;top:0;left:calc(50% - ${size} / 8);width:calc(${size} / 4);` +
    `height:calc(${size} / 4);border-radius:50%;background:var(--ui-loader-color)}`,

  // wave: four dots rising and falling in turn.
  `.ui-loader-wave{display:flex;align-items:center;justify-content:space-between;width:${size};height:${size}}`,
  `.ui-loader-wave>span{width:calc(${size} / 5);height:calc(${size} / 5);border-radius:50%;background:var(--ui-loader-color);` +
    'animation:ui-loader-wave 1s ease-in-out infinite}',
  '@keyframes ui-loader-wave{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-120%)}}',

  // grid: nine squares fading in a diagonal sweep.
  `.ui-loader-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:calc(${size} / 12);width:${size};height:${size}}`,
  '.ui-loader-grid>span{border-radius:1px;background:var(--ui-loader-color);animation:ui-loader-blink 1.2s ease-in-out infinite}',
  '@keyframes ui-loader-blink{0%,70%,100%{opacity:1}35%{opacity:0.2}}',

  // segments: eight strokes around a circle, each fading after the last.
  `.ui-loader-segments{position:relative;width:${size};height:${size}}`,
  `.ui-loader-segments>span{position:absolute;top:calc(50% - ${size} / 8);left:calc(50% - ${size} / 24);width:calc(${size} / 12);` +
    `height:calc(${size} / 4);border-radius:calc(${size} / 24);background:var(--ui-loader-color);` +
    'animation:ui-loader-fade-out 0.8s linear infinite}',
  '@keyframes ui-loader-fade-out{0%{opacity:1}100%{opacity:0.15}}',

  // Sequencing for wave, grid and segments.
  '.ui-loader-wave>span:nth-child(2){animation-delay:0.1s}',
  '.ui-loader-wave>span:nth-child(3){animation-delay:0.2s}',
  '.ui-loader-wave>span:nth-child(4){animation-delay:0.3s}',
  // The diagonal sweep: squares on the same diagonal share a delay.
  '.ui-loader-grid>span:nth-child(2),.ui-loader-grid>span:nth-child(4){animation-delay:0.1s}',
  '.ui-loader-grid>span:nth-child(3),.ui-loader-grid>span:nth-child(5),.ui-loader-grid>span:nth-child(7){animation-delay:0.2s}',
  '.ui-loader-grid>span:nth-child(6),.ui-loader-grid>span:nth-child(8){animation-delay:0.3s}',
  '.ui-loader-grid>span:nth-child(9){animation-delay:0.4s}',
  // Each stroke is turned into place; negative delays start the sequence mid-cycle, so it never begins blank.
  ...Array.from(
    { length: 8 },
    (_, i) =>
      `.ui-loader-segments>span:nth-child(${i + 1}){transform:rotate(${i * 45}deg) translateY(calc(${size} * -0.32));` +
      `animation-delay:${((i - 7) * 0.1).toFixed(1)}s}`,
  ),

  // Reduced motion: no spinning, bouncing or sliding; a slow fade shows it's still working.
  '@media (prefers-reduced-motion:reduce){' +
    '.ui-loader-spinner,.ui-loader-dots>span,.ui-loader-bars>span,.ui-loader-pulse::before,' +
    '.ui-loader-ring,.ui-loader-orbit,.ui-loader-wave>span,.ui-loader-grid>span,' +
    '.ui-loader-progress[data-indeterminate] .ui-loader-progress-bar{animation:ui-loader-fade 2s ease-in-out infinite;transform:none}' +
    // Segments keep their positions (their transform places them) and only fade.
    '.ui-loader-segments>span{animation:ui-loader-fade 2s ease-in-out infinite}' +
    '.ui-loader-pulse::after,.ui-loader-ring::after{animation:none}' +
    '.ui-loader-pulse::after{display:none}' +
    '.ui-loader-progress[data-indeterminate] .ui-loader-progress-bar{width:100%}' +
    '.ui-loader-progress-bar{transition:none}' +
    '}',
  '@keyframes ui-loader-fade{0%,100%{opacity:1}50%{opacity:0.4}}',
].join('');
