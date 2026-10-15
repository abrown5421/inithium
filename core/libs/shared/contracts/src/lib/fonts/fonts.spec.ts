import { describe, expect, it } from 'vitest';
import { fallbackFaceCss, fontFaceCss, mainFontFile, themeFontPreloads, themeFontsCss, type FontFaceSource, type ThemeFontFamily } from './fonts.schema';

const metrics = { unitsPerEm: 1000, ascent: 900, descent: 250, lineGap: 0, xAvgCharWidth: 500 };
const file = (url: string, weight: number | [number, number], style: 'normal' | 'italic' = 'normal', withMetrics = true): FontFaceSource => ({
  url,
  contentType: 'font/woff2',
  weight: typeof weight === 'number' ? { min: weight, max: weight } : { min: weight[0], max: weight[1] },
  style,
  ...(withMetrics ? { metrics } : {}),
});

const brand: ThemeFontFamily = { id: 'aaa', fallback: 'serif', files: [file('/b700', 700), file('/b400i', 400, 'italic'), file('/b400', 400)] };
const plain: ThemeFontFamily = { id: 'bbb', fallback: 'sans', files: [file('/p', [300, 800], 'normal', false)] };
const empty: ThemeFontFamily = { id: 'ccc', fallback: 'mono', files: [] };

describe('font CSS (decisions 0111, 0114)', () => {
  it('declares each file with its weight (a range for a variable font) and style', () => {
    expect(fontFaceCss('X', [file('/a', [300, 800])])).toBe(
      "@font-face{font-family:'X';src:url('/a') format('woff2');font-weight:300 800;font-style:normal;font-display:swap;}",
    );
  });

  it('pick the upright file covering 400 as a family’s main file, else the closest', () => {
    expect(mainFontFile(brand.files)?.url).toBe('/b400');
    expect(mainFontFile([file('/a', 700), file('/b', 300), file('/c', 400, 'italic')])?.url).toBe('/b');
  });

  it('size a fallback face from the main file’s metrics, against the fallback type’s system font', () => {
    const css = fallbackFaceCss(brand);
    // 0.5 / (821 / 2048) = 124.73% wide; ascent 900 / (1000 × 1.2473) = 72.16%.
    expect(css).toContain("font-family:'Inithium Font aaa Fallback';src:local('Times New Roman')");
    expect(css).toContain('size-adjust:124.73%;ascent-override:72.16%;descent-override:20.04%;line-gap-override:0.00%;');
    expect(fallbackFaceCss(plain)).toBe('');
  });

  it('point only the roles with a usable family at it, keeping defaults otherwise', () => {
    const css = themeFontsCss([brand, plain, empty], { display: 'aaa', body: 'ccc' });
    expect(css).toContain(":root{--font-display:'Inithium Font aaa', 'Inithium Font aaa Fallback', ui-serif, Georgia, serif;}");
    expect(css).not.toContain('--font-body');
    // Every family is declared, chosen or not.
    expect(css).toContain("font-family:'Inithium Font bbb'");
    expect(themeFontsCss([plain], { body: 'bbb' })).toContain("--font-body:'Inithium Font bbb', ui-sans-serif, system-ui, sans-serif;");
    expect(themeFontsCss([], undefined)).toBe('');
  });

  it('preload each theme font’s main file once', () => {
    expect(themeFontPreloads([brand, plain], { display: 'aaa', body: 'aaa' }).map((preload) => preload.url)).toEqual(['/b400']);
    expect(themeFontPreloads([brand, plain], { body: 'bbb' }).map((preload) => preload.url)).toEqual(['/p']);
    expect(themeFontPreloads([brand], { display: 'missing' })).toEqual([]);
  });
});
