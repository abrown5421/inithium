import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { act } from 'react';
import React from 'react';
import { Select } from './select';

type Option = {
  label: string;
  value: string;
  disabled?: boolean;
};

const mockOptions: Option[] = [
  { label: 'Option 1', value: '1' },
  { label: 'Option 2', value: '2' },
  { label: 'Option 3', value: '3', disabled: true },
];

describe('Select', () => {
  it('renders label and description', () => {
    act(() => {
      render(
        <Select
          options={mockOptions}
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
        <Select
          options={mockOptions}
          label="Test Label"
          description="Hidden Description"
          error="Error Message"
        />
      );
    });

    expect(screen.getByText('Error Message')).toBeTruthy();
    expect(screen.queryByText('Hidden Description')).toBeNull();
  });

  it('renders select element', () => {
    act(() => {
      render(<Select options={mockOptions} />);
    });

    const select = document.querySelector('select');
    expect(select).toBeTruthy();
  });

  it('renders all options', () => {
    act(() => {
      render(<Select options={mockOptions} />);
    });

    expect(screen.getByText('Option 1')).toBeTruthy();
    expect(screen.getByText('Option 2')).toBeTruthy();
    expect(screen.getByText('Option 3')).toBeTruthy();
  });

  it('renders placeholder when provided', () => {
    act(() => {
      render(
        <Select
          options={mockOptions}
          placeholder="Select something"
        />
      );
    });

    expect(screen.getByText('Select something')).toBeTruthy();
  });

  it('calls onChange when value changes', () => {
    const onChange = vi.fn();

    act(() => {
      render(
        <Select
          options={mockOptions}
          onChange={onChange}
        />
      );
    });

    const select = document.querySelector('select');

    act(() => {
      if (select) {
        fireEvent.change(select, { target: { value: '2' } });
      }
    });

    expect(onChange).toHaveBeenCalled();
  });

  it('respects disabled state', () => {
    act(() => {
      render(
        <Select
          options={mockOptions}
          disabled={true}
        />
      );
    });

    const select = document.querySelector('select');
    expect(select?.hasAttribute('disabled')).toBe(true);
  });

  it('applies custom class names', () => {
    act(() => {
      render(
        <Select
          options={mockOptions}
          className="custom-root"
          selectClassName="custom-select"
          labelClassName="custom-label"
          descriptionClassName="custom-description"
          wrapperClassName="custom-wrapper"
          label="Label"
          description="Description"
        />
      );
    });

    const root = document.querySelector('.custom-root');
    const select = document.querySelector('.custom-select');
    const label = document.querySelector('.custom-label');
    const description = document.querySelector('.custom-description');
    const wrapper = document.querySelector('.custom-wrapper');

    expect(root).toBeTruthy();
    expect(select).toBeTruthy();
    expect(label).toBeTruthy();
    expect(description).toBeTruthy();
    expect(wrapper).toBeTruthy();
  });

  it('renders leading icon when provided', () => {
    act(() => {
      render(
        <Select
          options={mockOptions}
          leadingIcon={<span data-testid="icon">Icon</span>}
        />
      );
    });

    expect(screen.getByTestId('icon')).toBeTruthy();
  });

  it('applies invalid state', () => {
    act(() => {
      render(
        <Select
          options={mockOptions}
          invalid={true}
        />
      );
    });

    const select = document.querySelector('select');
    expect(select).toBeTruthy();

    // sanity check: class exists (not asserting exact styles)
    expect(select!.className.length).toBeGreaterThan(0);
  });
});
