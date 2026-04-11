import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeColor, ButtonVariant, ButtonSize } from './button.types';
import { Button } from './button';

describe('Button Component', () => {
  const renderButton = (props = {}) => 
    render(<Button children="Action" {...props} />);

  const getButton = (): HTMLButtonElement => 
    screen.getByRole('button') as HTMLButtonElement;

  describe('Core Functionality', () => {
    it('should execute onClick callback', () => {
      const onClick = vi.fn();
      renderButton({ onClick });
      fireEvent.click(getButton());
      expect(onClick).toHaveBeenCalled();
    });

    it('should respect the disabled state', () => {
      renderButton({ disabled: true });
      expect(getButton().disabled).toBe(true);
    });
  });

  describe('Style Matrix', () => {
    const testMatrix: Array<[ThemeColor, ButtonVariant, string[]]> = [
      ['primary', 'filled', ['bg-primary', 'text-primary-contrast']],
      ['danger', 'outlined', ['bg-transparent', 'border-danger']],
      ['success', 'ghost', ['hover:shadow-glow', 'hover:border-b-success']],
    ];

    it.each(testMatrix)(
      'should apply correct classes for %s %s',
      (color, variant, expected) => {
        renderButton({ color, variant });
        const { className } = getButton();
        expected.forEach(cls => expect(className).toContain(cls));
      }
    );

    const sizeMatrix: Array<[ButtonSize, string]> = [
      ['sm', 'text-xs'],
      ['xl', 'text-xl'],
    ];

    it.each(sizeMatrix)(
      'should scale to %s size',
      (size, expected) => {
        renderButton({ size });
        expect(getButton().className).toContain(expected);
      }
    );
  });

  describe('Attributes', () => {
    it('should propagate aria-labels', () => {
      renderButton({ 'aria-label': 'test-label' });
      expect(getButton().getAttribute('aria-label')).toBe('test-label');
    });

    it('should include headless focus state', () => {
      renderButton();
      expect(getButton().className).toContain('data-[focus]:outline-white');
    });
  });
});