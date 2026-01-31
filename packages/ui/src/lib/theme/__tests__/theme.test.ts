import { contrastRatio } from './contrast';
import { lightTheme, darkTheme, ThemeColors } from '../theme';

const requiredSlots = ['bg', 'text', 'border', 'hover', 'active', 'subtle'];

describe('Theme structure', () => {
  test('light and dark themes have the same color keys', () => {
    expect(Object.keys(lightTheme.colors)).toEqual(Object.keys(darkTheme.colors));
  });

  test('each color has all required slots', () => {
    const colors = lightTheme.colors as ThemeColors;
    for (const [, slot] of Object.entries(colors)) {
      for (const required of requiredSlots) {
        expect(slot).toHaveProperty(required);
      }
    }
  });

  test('all color values are valid hex strings', () => {
    const hexRegex = /^#([0-9A-Fa-f]{6})$/;
    for (const theme of [lightTheme, darkTheme]) {
      for (const slot of Object.values(theme.colors)) {
        for (const value of Object.values(slot)) {
          expect(value).toMatch(hexRegex);
        }
      }
    }
  });
});

describe('Theme accessibility', () => {
  test('text contrast ratio is at least WCAG AA (4.5)', () => {
    for (const theme of [lightTheme, darkTheme]) {
      for (const [, slot] of Object.entries(theme.colors)) {
        const ratio = contrastRatio(slot.bg, slot.text);
        expect(ratio).toBeGreaterThanOrEqual(4.5);
      }
    }
  });
});

describe('Variant integrity', () => {
  test('theme supports required variants', () => {
    const variants = ['primary', 'secondary', 'accent', 'neutral'];
    for (const v of variants) {
      expect(lightTheme.colors).toHaveProperty(v);
      expect(darkTheme.colors).toHaveProperty(v);
    }
  });
});
