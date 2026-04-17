import { describe, it, expect } from 'vitest';
import { 
  INTERACTIVE_COLOR_MAP, 
  TEXT_COLOR_MAP, 
  BG_COLOR_MAP, 
  BORDER_COLOR_MAP 
} from './color-maps.js';
import { ThemeColor } from '@inithium/types';

describe('Color Maps Abstraction', () => {
  const colors = Object.keys(INTERACTIVE_COLOR_MAP) as ThemeColor[];

  describe('INTERACTIVE_COLOR_MAP', () => {
    it.each(colors)('should provide consistent tokens for %s', (color) => {
      const tokens = INTERACTIVE_COLOR_MAP[color];
      const isContrast = color.endsWith('-contrast');
      const baseColor = isContrast ? color.replace(/-contrast$/, '') : color;

      // bg is always the color itself
      expect(tokens.bg).toBe(`bg-${color}`);

      // bgContrast inverts: for base colors it points to contrast, for contrast colors it points back to base
      expect(tokens.bgContrast).toBe(isContrast ? `bg-${baseColor}` : `bg-${color}-contrast`);

      expect(tokens.text).toBe(`text-${color}`);
      expect(tokens.hoverBg).toBe(`hover:bg-${color}`);
      expect(tokens.hoverBorderB).toBe(`hover:border-b-${color}`);
    });
  });

  describe('Derived Maps', () => {
    it.each(colors)('should correctly derive TEXT_COLOR_MAP from base tokens for %s', (color) => {
      expect(TEXT_COLOR_MAP[color].text).toBe(INTERACTIVE_COLOR_MAP[color].text);
    });

    it.each(colors)('should correctly derive BG_COLOR_MAP from base tokens for %s', (color) => {
      expect(BG_COLOR_MAP[color]).toBe(INTERACTIVE_COLOR_MAP[color].bg);
    });

    it.each(colors)('should correctly derive BORDER_COLOR_MAP from base tokens for %s', (color) => {
      expect(BORDER_COLOR_MAP[color]).toBe(INTERACTIVE_COLOR_MAP[color].border);
    });
  });
});