import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { act } from 'react';
import { Checkbox } from './Checkbox';

describe('Checkbox', () => {
  it('renders label and description', () => {
    act(() => {
      render(
        <Checkbox
          checked={false}
          onChange={vi.fn()}
          label="Test Label"
          description="Test Description"
        />
      );
    });

    expect(screen.getByText('Test Label')).toBeTruthy();
    expect(screen.getByText('Test Description')).toBeTruthy();
  });

  it('calls onChange when clicked', () => {
    const onChange = vi.fn();

    act(() => {
      render(
        <Checkbox
          checked={false}
          onChange={onChange}
          label="Click Me"
        />
      );
    });

    const checkbox = document.querySelector('[role="checkbox"]');

    act(() => {
    if (checkbox) fireEvent.click(checkbox);
    });

    expect(onChange).toHaveBeenCalled();
  });

  it('respects checked state (controlled)', () => {
    act(() => {
      render(
        <Checkbox
          checked={true}
          onChange={vi.fn()}
          label="Checked"
        />
      );
    });

    const checkbox = document.querySelector('[role="checkbox"]');
    expect(checkbox).toBeTruthy();

    // Headless UI uses aria-checked
    expect(checkbox?.getAttribute('aria-checked')).toBe('true');
  });

  it('does not trigger onChange when disabled', () => {
    const onChange = vi.fn();

    act(() => {
      render(
        <Checkbox
          checked={false}
          onChange={onChange}
          label="Disabled"
          disabled={true}
        />
      );
    });

    const label = screen.getByText('Disabled');

    act(() => {
      fireEvent.click(label);
    });

    expect(onChange).not.toHaveBeenCalled();
  });

  it('applies custom class names', () => {
    act(() => {
      render(
        <Checkbox
          checked={false}
          onChange={vi.fn()}
          label="Styled"
          className="custom-root"
          checkboxClassName="custom-checkbox"
          labelClassName="custom-label"
          descriptionClassName="custom-description"
          description="Desc"
        />
      );
    });

    const root = document.querySelector('.custom-root');
    const checkbox = document.querySelector('.custom-checkbox');
    const label = document.querySelector('.custom-label');
    const description = document.querySelector('.custom-description');

    expect(root).toBeTruthy();
    expect(checkbox).toBeTruthy();
    expect(label).toBeTruthy();
    expect(description).toBeTruthy();
  });

  it('renders checkbox input element', () => {
    act(() => {
      render(
        <Checkbox
          checked={false}
          onChange={vi.fn()}
          label="Checkbox"
        />
      );
    });

    const checkbox = document.querySelector('[role="checkbox"]');
    expect(checkbox).toBeTruthy();
  });
});
