import { describe, it, expect } from 'vitest';
import { 
  FONT_MAP, 
  TEXT_SIZE_MAP, 
  WEIGHT_MAP, 
  FONT_STYLE_MAP, 
  DECORATION_MAP, 
  COMPONENT_SIZE_MAP 
} from './typography-maps.js';

describe('Typography and Size Maps Abstraction', () => {
  
  describe('FONT_MAP', () => {
    it('should map standard tailwind fonts correctly', () => {
      expect(FONT_MAP.sans).toBe('font-sans');
      expect(FONT_MAP.mono).toBe('font-mono');
    });

    it('should map custom brand fonts correctly', () => {
      expect(FONT_MAP.sora).toBe('sora');
      expect(FONT_MAP.outfit).toBe('outfit');
    });
  });

  describe('TEXT_SIZE_MAP', () => {
    const sizes = Object.entries(TEXT_SIZE_MAP);
    it.each(sizes)('should map size %s to class %s', (key, value) => {
      expect(value).toBe(`text-${key}`);
    });
  });

  describe('WEIGHT_MAP', () => {
    const weights = Object.entries(WEIGHT_MAP);
    it.each(weights)('should map weight %s to class %s', (key, value) => {
      expect(value).toBe(`font-${key}`);
    });
  });

  describe('COMPONENT_SIZE_MAP', () => {
    it('should provide multi-token strings for component padding and text', () => {
      expect(COMPONENT_SIZE_MAP.sm).toContain('px-3');
      expect(COMPONENT_SIZE_MAP.sm).toContain('text-xs');
      
      expect(COMPONENT_SIZE_MAP.xl).toContain('px-8');
      expect(COMPONENT_SIZE_MAP.xl).toContain('text-xl');
    });
  });

  describe('Style and Decoration', () => {
    it('should map italic correctly', () => {
      expect(FONT_STYLE_MAP.italic).toBe('italic');
    });

    it('should map underline correctly', () => {
      expect(DECORATION_MAP.underline).toBe('underline');
    });
  });
});