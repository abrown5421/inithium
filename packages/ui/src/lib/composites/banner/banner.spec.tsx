/// <reference path="../../../../../../types/trianglify.d.ts" />" />
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

const mockSvgElement = {
  setAttribute: vi.fn(),
  outerHTML: '<svg data-testid="mock-svg"></svg>',
};

const mockPattern = {
  toSVG: vi.fn(() => mockSvgElement),
};

vi.mock('trianglify', () => ({
  default: vi.fn(() => mockPattern),
}));

import trianglify from 'trianglify';
import { Banner } from './banner';

describe('Banner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSvgElement.setAttribute.mockClear();
    mockPattern.toSVG.mockReturnValue(mockSvgElement);
  });

  describe('container', () => {
    it('renders the root element with the base class', () => {
      const { container } = render(<Banner />);
      expect(container.querySelector('.inithium-banner-root')).not.toBeNull();
    });

    it('appends extra className to root element', () => {
      const { container } = render(<Banner className="my-class" />);
      const root = container.querySelector('.inithium-banner-root');
      expect(root?.classList.contains('my-class')).toBe(true);
    });

    it('applies the height style to the container', () => {
      const { container } = render(<Banner height="400px" />);
      const root = container.querySelector('.inithium-banner-root') as HTMLElement;
      expect(root.style.height).toBe('400px');
    });

    it('defaults height to 250px', () => {
      const { container } = render(<Banner />);
      const root = container.querySelector('.inithium-banner-root') as HTMLElement;
      expect(root.style.height).toBe('250px');
    });
  });

  describe('when src is provided', () => {
    it('renders an img element', () => {
      render(<Banner src="https://example.com/image.jpg" />);
      expect(screen.getByRole('img')).not.toBeNull();
    });

    it('sets the src attribute on the img', () => {
      render(<Banner src="https://example.com/image.jpg" />);
      expect(screen.getByRole('img').getAttribute('src')).toBe('https://example.com/image.jpg');
    });

    it('sets the alt attribute on the img', () => {
      render(<Banner src="https://example.com/image.jpg" alt="My banner" />);
      expect(screen.getByRole('img').getAttribute('alt')).toBe('My banner');
    });

    it('defaults alt to "Profile Banner"', () => {
      render(<Banner src="https://example.com/image.jpg" />);
      expect(screen.getByRole('img').getAttribute('alt')).toBe('Profile Banner');
    });

    it('does not call trianglify when src is provided', () => {
      render(<Banner src="https://example.com/image.jpg" />);
      expect(trianglify).not.toHaveBeenCalled();
    });
  });

  describe('when src is not provided', () => {
    it('does not render an img element', () => {
      render(<Banner />);
      expect(screen.queryByRole('img')).toBeNull();
    });

    it('calls trianglify to generate a pattern', () => {
      render(<Banner />);
      expect(trianglify).toHaveBeenCalledTimes(1);
    });

    it('passes the parsed height to trianglify', () => {
      render(<Banner height="400px" />);
      expect(trianglify).toHaveBeenCalledWith(expect.objectContaining({ height: 400 }));
    });

    it('defaults to height 250 when height cannot be parsed', () => {
      render(<Banner height="auto" />);
      expect(trianglify).toHaveBeenCalledWith(expect.objectContaining({ height: 250 }));
    });

    it('always passes width 1920 to trianglify', () => {
      render(<Banner />);
      expect(trianglify).toHaveBeenCalledWith(expect.objectContaining({ width: 1920 }));
    });

    it('uses default cellSize of 75 when no options provided', () => {
      render(<Banner />);
      expect(trianglify).toHaveBeenCalledWith(expect.objectContaining({ cellSize: 75 }));
    });

    it('uses default variance of 0.75 when no options provided', () => {
      render(<Banner />);
      expect(trianglify).toHaveBeenCalledWith(expect.objectContaining({ variance: 0.75 }));
    });

    it('uses default xColors of "Blues" when no options provided', () => {
      render(<Banner />);
      expect(trianglify).toHaveBeenCalledWith(expect.objectContaining({ xColors: 'Blues' }));
    });

    it('forwards options.cell_size to trianglify', () => {
      render(<Banner options={{ cell_size: 100 }} />);
      expect(trianglify).toHaveBeenCalledWith(expect.objectContaining({ cellSize: 100 }));
    });

    it('forwards options.variance to trianglify', () => {
      render(<Banner options={{ variance: 0.5 }} />);
      expect(trianglify).toHaveBeenCalledWith(expect.objectContaining({ variance: 0.5 }));
    });

    it('forwards options.x_colors to trianglify', () => {
      render(<Banner options={{ x_colors: 'Greens' }} />);
      expect(trianglify).toHaveBeenCalledWith(expect.objectContaining({ xColors: 'Greens' }));
    });

    it('forwards options.y_colors to trianglify', () => {
      render(<Banner options={{ y_colors: 'Reds' }} />);
      expect(trianglify).toHaveBeenCalledWith(expect.objectContaining({ yColors: 'Reds' }));
    });

    it('sets SVG attributes for full-size responsive rendering', () => {
      render(<Banner height="300px" />);
      expect(mockSvgElement.setAttribute).toHaveBeenCalledWith('width', '100%');
      expect(mockSvgElement.setAttribute).toHaveBeenCalledWith('height', '100%');
      expect(mockSvgElement.setAttribute).toHaveBeenCalledWith('viewBox', '0 0 1920 300');
      expect(mockSvgElement.setAttribute).toHaveBeenCalledWith('preserveAspectRatio', 'xMidYMid slice');
    });

    it('renders the SVG outerHTML into the DOM', () => {
      mockSvgElement.outerHTML = '<svg data-testid="triangle-svg"></svg>';
      const { container } = render(<Banner />);
      expect(container.querySelector('[data-testid="triangle-svg"]')).not.toBeNull();
    });

    it('renders an empty div when trianglify throws', () => {
      vi.mocked(trianglify).mockImplementationOnce(() => { throw new Error('fail'); });
      const { container } = render(<Banner />);
      expect(screen.queryByRole('img')).toBeNull();
      // root still renders
      expect(container.querySelector('.inithium-banner-root')).not.toBeNull();
    });

    it('does not re-call trianglify on unrelated re-renders', () => {
      const { rerender } = render(<Banner />);
      rerender(<Banner />);
      expect(trianglify).toHaveBeenCalledTimes(1);
    });

    it('re-calls trianglify when height changes', () => {
      const { rerender } = render(<Banner height="200px" />);
      rerender(<Banner height="400px" />);
      expect(trianglify).toHaveBeenCalledTimes(2);
    });

    it('re-calls trianglify when options change', () => {
      const { rerender } = render(<Banner options={{ cell_size: 50 }} />);
      rerender(<Banner options={{ cell_size: 100 }} />);
      expect(trianglify).toHaveBeenCalledTimes(2);
    });
  });
});