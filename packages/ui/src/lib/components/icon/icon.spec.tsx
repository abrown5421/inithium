import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Icon } from './icon';
import type { IconSize, IconStyle } from './icon.types';
import type { ThemeColor } from '@inithium/types';

const svgClass = () => document.querySelector('svg')?.className.baseVal ?? '';

describe('Icon Component', () => {
  const renderIcon = (props = {}) =>
    render(<Icon name="HomeIcon" aria-label="home" {...props} />);

  describe('Rendering', () => {
    it('should render a valid heroicon by name', () => {
      renderIcon();
      expect(document.querySelector('svg')).not.toBeNull();
    });

    it('should return null for an unrecognized icon name', () => {
      const { container } = render(<Icon name={'NonExistentIcon' as any} />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('Size Map', () => {
    const sizes: Array<[IconSize, string]> = [
      ['xs', 'size-3'],
      ['sm', 'size-4'],
      ['base', 'size-5'],
      ['lg', 'size-6'],
      ['xl', 'size-8'],
      ['2xl', 'size-10'],
    ];

    it.each(sizes)('should apply %s size class "%s"', (size, expected) => {
      renderIcon({ size });
      expect(svgClass()).toContain(expected);
    });
  });

  describe('Color', () => {
    const colors: ThemeColor[] = ['primary', 'danger', 'success', 'warning', 'info', 'accent', 'secondary', 'surface2'];

    it.each(colors)('should apply text color class for "%s"', (color) => {
      renderIcon({ color });
      expect(svgClass()).toContain(`text-${color}`);
    });

    it('should not apply a color class when color is omitted', () => {
      renderIcon({ color: undefined });
      expect(svgClass()).not.toMatch(/text-(primary|secondary|accent|success|warning|danger|info|surface2)/);
    });
  });

  describe('Icon Style', () => {
    const styles: IconStyle[] = ['solid-16', 'solid-20', 'solid-24', 'outline-24'];

    it.each(styles)('should resolve icon from "%s" library', (iconStyle) => {
      render(<Icon name="HomeIcon" iconStyle={iconStyle} aria-label="home" />);
      expect(document.querySelector('svg')).not.toBeNull();
    });
  });

  describe('Accessibility', () => {
    it('should set aria-hidden when no aria-label is provided', () => {
      render(<Icon name="HomeIcon" />);
      expect(document.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
    });

    it('should set aria-label when provided', () => {
      renderIcon({ 'aria-label': 'home icon' });
      expect(document.querySelector('svg')?.getAttribute('aria-label')).toBe('home icon');
    });
  });

  describe('Overrides', () => {
    it('should merge custom className', () => {
      renderIcon({ className: 'custom-class' });
      expect(svgClass()).toContain('custom-class');
    });

    it('should apply inline style', () => {
      renderIcon({ style: { opacity: 0.5 } });
      expect((document.querySelector('svg') as unknown as HTMLElement)?.style.opacity).toBe('0.5');
    });
  });
});