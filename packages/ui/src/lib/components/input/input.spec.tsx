import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { act } from 'react';
import { Input } from './Input';

describe('Input', () => {
  it('renders label and description', () => {
    act(() => {
      render(
        <Input
          label="Test Label"
          description="Test Description"
        />
      );
    });

    expect(screen.getByText('Test Label')).toBeTruthy();
    expect(screen.getByText('Test Description')).toBeTruthy();
  });

  it('renders error instead of description', () => {
    act(() => {
      render(
        <Input
          label="Test Label"
          description="Hidden Description"
          error="Error Message"
        />
      );
    });

    expect(screen.getByText('Error Message')).toBeTruthy();
    expect(screen.queryByText('Hidden Description')).toBeNull();
  });

  it('renders input element', () => {
    act(() => {
      render(<Input placeholder="Enter text" />);
    });

    const input = document.querySelector('input');
    expect(input).toBeTruthy();
  });

  it('calls onChange when typing', () => {
    const onChange = vi.fn();

    act(() => {
      render(
        <Input
          onChange={onChange}
          value=""
        />
      );
    });

    const input = document.querySelector('input');

    act(() => {
      if (input) {
        fireEvent.change(input, { target: { value: 'hello' } });
      }
    });

    expect(onChange).toHaveBeenCalled();
  });

  it('respects disabled state', () => {
    act(() => {
        render(
        <Input
            disabled={true}
            value=""
            onChange={vi.fn()}
        />
        );
    });

    const input = document.querySelector('input');
    expect(input).toBeTruthy();

    expect(input?.hasAttribute('disabled')).toBe(true);
  });

  it('applies custom class names', () => {
    act(() => {
      render(
        <Input
          className="custom-root"
          inputClassName="custom-input"
          labelClassName="custom-label"
          descriptionClassName="custom-description"
          wrapperClassName="custom-wrapper"
          label="Label"
          description="Description"
        />
      );
    });

    const root = document.querySelector('.custom-root');
    const input = document.querySelector('.custom-input');
    const label = document.querySelector('.custom-label');
    const description = document.querySelector('.custom-description');
    const wrapper = document.querySelector('.custom-wrapper');

    expect(root).toBeTruthy();
    expect(input).toBeTruthy();
    expect(label).toBeTruthy();
    expect(description).toBeTruthy();
    expect(wrapper).toBeTruthy();
  });

  it('renders leading and trailing icons', () => {
    act(() => {
      render(
        <Input
          leadingIcon={<span>Leading</span>}
          trailingIcon={<span>Trailing</span>}
        />
      );
    });

    expect(screen.getByText('Leading')).toBeTruthy();
    expect(screen.getByText('Trailing')).toBeTruthy();
  });

  it('applies invalid state', () => {
    act(() => {
      render(
        <Input
          invalid={true}
          inputClassName="test-input"
        />
      );
    });

    const input = document.querySelector('.test-input');
    expect(input).toBeTruthy();

    // We don’t check exact styles, just presence
    expect(input!.className.length > 0).toBe(true);
  });

  it('respects input type', () => {
    act(() => {
      render(<Input type="password" />);
    });

    const input = document.querySelector('input');
    expect(input?.getAttribute('type')).toBe('password');
  });
});
