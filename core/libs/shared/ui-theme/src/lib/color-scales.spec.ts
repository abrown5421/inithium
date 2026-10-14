import { describe, expect, it } from 'vitest';
import { contrastRatio, generateBrandScale, generateSurfaceScale, scaleSteps } from './color-scales.service';
import { themeColorProblem, themeToCss } from './theme.service';

// A spread of real-world colours: Tailwind 500s and 100s, greys, near-white, saturated and muddy ones.
const brandColours = ['#006a8e', '#ef4444', '#22c55e', '#eab308', '#a855f7', '#000000', '#ffffff', '#7c2d12', '#94a3b8'];
const surfaceColours = ['#f5f5f4', '#ffffff', '#fef3c7', '#e0f2fe', '#ede9fe', '#d4d4d8', '#c7d2fe', '#bbf7d0', '#fecaca'];

const isHex = (value: string) => /^#[0-9a-f]{6}$/.test(value);

describe('brand scales (decisions 0031, 0041)', () => {
  it.each(brandColours)('keeps %s exactly at 500 and fills every step', (hex) => {
    const scale = generateBrandScale(hex);
    expect(scale[500]).toBe(hex.toLowerCase());
    for (const step of scaleSteps) expect(isHex(scale[step]), `step ${step}: ${scale[step]}`).toBe(true);
  });

  it('runs from light to dark', () => {
    const scale = generateBrandScale('#006a8e');
    const white = '#ffffff';
    for (let i = 1; i < scaleSteps.length; i++) {
      const [lighter, darker] = [scale[scaleSteps[i - 1] as 50], scale[scaleSteps[i] as 50]];
      expect(contrastRatio(darker, white)).toBeGreaterThanOrEqual(contrastRatio(lighter, white));
    }
  });
});

describe('surface scales: the WCAG AA guarantee (decision 0031)', () => {
  it.each(surfaceColours)('keeps %s exactly at 100, with every text step readable on every background step', (hex) => {
    const scale = generateSurfaceScale(hex);
    expect(scale[100]).toBe(hex.toLowerCase());
    for (const text of [600, 700, 800, 900, 950] as const) {
      for (const background of [50, 100, 200, 300, 400] as const) {
        expect(contrastRatio(scale[text], scale[background]), `${text} on ${background}`).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  it('refuses a surface too dark for any readable text', () => {
    expect(() => generateSurfaceScale('#111111')).toThrow(/too dark/);
  });
});

describe('contrastRatio', () => {
  it('matches the WCAG extremes', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 5);
    expect(contrastRatio('#777777', '#777777')).toBeCloseTo(1, 5);
  });
});

describe('themeColorProblem (decision 0087)', () => {
  it('wants 6-digit hex codes', () => {
    expect(themeColorProblem('primary', '#fff')).toMatch(/6-digit/);
    expect(themeColorProblem('primary', 'teal')).toMatch(/6-digit/);
  });

  it('accepts any brand colour but only light enough surfaces', () => {
    expect(themeColorProblem('primary', '#000000')).toBeNull();
    expect(themeColorProblem('surface', '#f5f5f4')).toBeNull();
    expect(themeColorProblem('surface', '#111111')).toMatch(/Too dark/);
  });
});

describe('themeToCss', () => {
  it('declares all 66 variables', () => {
    const css = themeToCss({
      colors: { primary: '#006a8e', secondary: '#ef4444', tertiary: '#22c55e', quaternary: '#eab308', accent: '#a855f7', surface: '#f5f5f4' },
    });
    expect(css.match(/--color-[a-z]+-\d+:#[0-9a-f]{6};/g)).toHaveLength(66);
    expect(css).toContain('--color-primary-500:#006a8e;');
    expect(css).toContain('--color-surface-100:#f5f5f4;');
  });
});
