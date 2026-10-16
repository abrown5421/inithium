import { composite, contrastRatio, requiredContrast, type Rgba } from './accessibility-checks.service';

/*
 * Measures the preview's text contrast as the browser draws it (decision 0116): the computed colours of each piece of
 * text and of what's behind it, so theme colours, opacity and dark mode are all accounted for. It reads colours by
 * painting them on a 1px canvas, which understands every colour the browser does (oklch, color-mix …).
 */

/** The text that's hardest to read in each element, against what it needs. */
export type ContrastResult = { elementId: string; ratio: number; needed: number };

const WHITE: Rgba = [255, 255, 255, 1];

/** Reads CSS colours as RGBA through a canvas in the preview's document. */
function colourReader(doc: Document): (css: string) => Rgba {
  const canvas = doc.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  return (css) => {
    if (!context) return [0, 0, 0, 1];
    context.clearRect(0, 0, 1, 1);
    context.fillStyle = '#000';
    context.fillStyle = css;
    context.fillRect(0, 0, 1, 1);
    const [r = 0, g = 0, b = 0, a = 255] = context.getImageData(0, 0, 1, 1).data;
    return [r, g, b, a / 255];
  };
}

/** Elements whose text the check reads: everything but Containers (which hold no text) and Buttons (fixed colours). */
const TEXT_ELEMENTS = '[data-element-id][data-element]:not([data-element="container"]):not([data-element="button"])';

/** Each element's hardest-to-read text, measured in the preview under `root`. Hidden text is left out. */
export function scanContrast(root: HTMLElement): ContrastResult[] {
  const doc = root.ownerDocument;
  const view = doc.defaultView;
  if (!view) return [];
  const read = colourReader(doc);
  const behind = (element: Element): Rgba => {
    const layers: Rgba[] = [];
    for (let node: Element | null = element; node; node = node.parentElement) {
      const colour = read(view.getComputedStyle(node).backgroundColor);
      if (colour[3] > 0) layers.push(colour);
      if (colour[3] >= 1) break;
    }
    // Paint from the outermost layer in, over white.
    return layers.reduceRight<Rgba>((under, layer) => composite(layer, under), WHITE);
  };

  const results: ContrastResult[] = [];
  for (const box of Array.from(root.querySelectorAll<HTMLElement>(TEXT_ELEMENTS))) {
    const id = box.getAttribute('data-element-id');
    if (!id) continue;
    let worst: ContrastResult | undefined;
    const walker = doc.createTreeWalker(box, view.NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const element = node.parentElement;
      if (!element || !node.textContent?.trim() || element.getClientRects().length === 0) continue;
      const style = view.getComputedStyle(element);
      const background = behind(element);
      const ratio = contrastRatio(composite(read(style.color), background), background);
      const needed = requiredContrast(parseFloat(style.fontSize), Number(style.fontWeight) || 400);
      if (!worst || ratio / needed < worst.ratio / worst.needed) worst = { elementId: id, ratio, needed };
    }
    if (worst && worst.ratio < worst.needed) results.push(worst);
  }
  return results;
}
