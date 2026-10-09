/**
 * PolyBanner's fixed CSS (decision 0074). Each triangle is outlined in its own fill so neighbours overlap by a
 * hair, hiding the seams anti-aliasing would otherwise show; the outline doesn't scale with a shrunk preview.
 */
export const polyBannerStyleSheet = `
.ui-poly-canvas { position: absolute; inset: 0; overflow: hidden; }
.ui-poly-canvas > svg { display: block; width: 100%; height: 100%; }
.ui-poly-canvas polygon { stroke-width: 1px; stroke-linejoin: round; vector-effect: non-scaling-stroke; }
.ui-poly-content { position: relative; height: 100%; }
.ui-poly-preview { position: relative; width: 100%; margin: 0 auto; border-radius: 8px; overflow: hidden; }
`;
