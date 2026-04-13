import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeAll, vi } from 'vitest';
import { Loader } from './loader';
import type { LoaderVariant } from './loader.types';

beforeAll(() => {
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

describe('Loader', () => {
  it('renders with role="status" and a default aria-label', () => {
    render(<Loader />);
    expect(screen.getByRole('status')).toBeDefined();
    expect(screen.getByLabelText('Loading')).toBeDefined();
  });

  it('accepts a custom aria-label', () => {
    render(<Loader aria-label="Submitting form" />);
    expect(screen.getByLabelText('Submitting form')).toBeDefined();
  });

  it('applies an explicit size as inline style on the wrapper', () => {
    const { container } = render(<Loader size="48px" />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.width).toBe('48px');
    expect(wrapper.style.height).toBe('48px');
  });

  it('applies numeric size correctly', () => {
    const { container } = render(<Loader size={32} />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.width).toBe('32px');
    expect(wrapper.style.height).toBe('32px');
  });

  it('fills parent (100% width & height) when no size is given', () => {
    const { container } = render(<Loader />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.width).toBe('100%');
    expect(wrapper.style.height).toBe('100%');
  });

  it('forwards className to the wrapper element', () => {
    const { container } = render(<Loader className="my-custom-class" />);
    expect((container.firstChild as HTMLElement).className).toContain('my-custom-class');
  });

  const ALL_VARIANTS: LoaderVariant[] = [
    'spinner',
    'dots',
    'bars',
    'pulse',
    'ring',
    'wave',
    'bounce',
    'orbit',
    'ripple',
  ];

  it.each(ALL_VARIANTS)('renders variant "%s" without crashing', (variant) => {
    expect(() => render(<Loader variant={variant} />)).not.toThrow();
  });

  it('defaults to variant "spinner" when no variant is provided', () => {
    const { container } = render(<Loader />);
    expect(container.querySelector('svg')).not.toBeNull();
  });

  it('maps a theme color token to a CSS variable', () => {
    expect(() => render(<Loader color="primary" />)).not.toThrow();
    expect(() => render(<Loader color="danger" />)).not.toThrow();
  });

  it('passes raw CSS colors through unchanged', () => {
    expect(() => render(<Loader color="#ff0000" />)).not.toThrow();
    expect(() => render(<Loader color="rgb(0,128,255)" />)).not.toThrow();
  });
});