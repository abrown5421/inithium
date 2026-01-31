import { lightTheme, darkTheme, ColorMode, Theme } from './theme';

describe('theme', () => {
  describe('lightTheme', () => {
    it('should have light mode', () => {
      expect(lightTheme.mode).toBe('light');
    });

    it('should have all color slots defined', () => {
      const colorCategories = [
        'primary',
        'secondary',
        'accent',
        'neutral',
        'success',
        'error',
        'warning',
        'info',
        'surface',
      ];

      colorCategories.forEach((category) => {
        expect(
          lightTheme.colors[category as keyof typeof lightTheme.colors]
        ).toBeDefined();
        expect(
          lightTheme.colors[category as keyof typeof lightTheme.colors].bg
        ).toBeDefined();
        expect(
          lightTheme.colors[category as keyof typeof lightTheme.colors].text
        ).toBeDefined();
        expect(
          lightTheme.colors[category as keyof typeof lightTheme.colors].border
        ).toBeDefined();
        expect(
          lightTheme.colors[category as keyof typeof lightTheme.colors].hover
        ).toBeDefined();
        expect(
          lightTheme.colors[category as keyof typeof lightTheme.colors].active
        ).toBeDefined();
        expect(
          lightTheme.colors[category as keyof typeof lightTheme.colors].subtle
        ).toBeDefined();
      });
    });

    it('should have valid hex color values', () => {
      const hexColorRegex = /^#[0-9A-F]{6}$/i;
      expect(lightTheme.colors.primary.bg).toMatch(hexColorRegex);
      expect(lightTheme.colors.secondary.bg).toMatch(hexColorRegex);
    });
  });

  describe('darkTheme', () => {
    it('should have dark mode', () => {
      expect(darkTheme.mode).toBe('dark');
    });

    it('should have all color slots defined', () => {
      const colorCategories = [
        'primary',
        'secondary',
        'accent',
        'neutral',
        'success',
        'error',
        'warning',
        'info',
        'surface',
      ];

      colorCategories.forEach((category) => {
        expect(
          darkTheme.colors[category as keyof typeof darkTheme.colors]
        ).toBeDefined();
        expect(
          darkTheme.colors[category as keyof typeof darkTheme.colors].bg
        ).toBeDefined();
        expect(
          darkTheme.colors[category as keyof typeof darkTheme.colors].text
        ).toBeDefined();
        expect(
          darkTheme.colors[category as keyof typeof darkTheme.colors].border
        ).toBeDefined();
        expect(
          darkTheme.colors[category as keyof typeof darkTheme.colors].hover
        ).toBeDefined();
        expect(
          darkTheme.colors[category as keyof typeof darkTheme.colors].active
        ).toBeDefined();
        expect(
          darkTheme.colors[category as keyof typeof darkTheme.colors].subtle
        ).toBeDefined();
      });
    });

    it('should have valid hex color values', () => {
      const hexColorRegex = /^#[0-9A-F]{6}$/i;
      expect(darkTheme.colors.primary.bg).toMatch(hexColorRegex);
      expect(darkTheme.colors.secondary.bg).toMatch(hexColorRegex);
    });
  });

  describe('theme structure', () => {
    it('should have consistent structure between light and dark themes', () => {
      const lightKeys = Object.keys(lightTheme.colors);
      const darkKeys = Object.keys(darkTheme.colors);

      expect(lightKeys.sort()).toEqual(darkKeys.sort());
    });
  });
});