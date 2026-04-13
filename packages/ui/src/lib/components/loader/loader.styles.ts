export const LOADER_STYLES = `
@keyframes loader-spin {
  to { transform: rotate(360deg); }
}
@keyframes loader-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: 0.4; transform: scale(0.6); }
}
@keyframes loader-bounce-dot {
  0%, 80%, 100% { transform: translateY(0); }
  40%           { transform: translateY(-60%); }
}
@keyframes loader-bar-scale {
  0%, 40%, 100% { transform: scaleY(0.4); }
  20%           { transform: scaleY(1); }
}
@keyframes loader-wave {
  0%, 40%, 100% { transform: scaleY(0.4); opacity: 0.5; }
  20%           { transform: scaleY(1);   opacity: 1;   }
}
@keyframes loader-orbit {
  to { transform: rotate(360deg); }
}
@keyframes loader-ripple {
  0%   { transform: scale(0); opacity: 0.8; }
  100% { transform: scale(1); opacity: 0;   }
}
@keyframes loader-ring-arc {
  0%   { stroke-dashoffset: 188; }
  50%  { stroke-dashoffset: 47;  }
  100% { stroke-dashoffset: 188; }
}
@keyframes loader-ring-spin {
  to { transform: rotate(360deg); }
}
`;

let injected = false;

export function injectLoaderStyles(): void {
  if (injected || typeof document === 'undefined') return;
  const style = document.createElement('style');
  style.setAttribute('data-loader-styles', '');
  style.textContent = LOADER_STYLES;
  document.head.appendChild(style);
  injected = true;
}