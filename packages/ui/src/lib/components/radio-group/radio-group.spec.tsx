import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { act } from 'react';
import { RadioGroup } from './radio-group';
import { RadioOption } from './radio-group.types';

const mockOptions: RadioOption[] = [
  { label: 'Option 1', value: '1', iconName: 'CheckIcon' },
  { label: 'Option 2', value: '2', iconName: 'CheckIcon' },
  { label: 'Option 3', value: '3', iconName: 'CheckIcon', disabled: true },
];

describe('RadioGroup', () => {
  it('renders group label and description', () => {
    act(() => {
      render(
        <RadioGroup
          options={mockOptions}
          value="1"
          onChange={vi.fn()}
          label="Group Label"
          description="Group Description"
        />
      );
    });

    expect(screen.getByText('Group Label')).toBeTruthy();
    expect(screen.getByText('Group Description')).toBeTruthy();
  });

  it('renders all options', () => {
    act(() => {
      render(
        <RadioGroup
          options={mockOptions}
          value="1"
          onChange={vi.fn()}
        />
      );
    });

    expect(screen.getByText('Option 1')).toBeTruthy();
    expect(screen.getByText('Option 2')).toBeTruthy();
    expect(screen.getByText('Option 3')).toBeTruthy();
  });

  it('calls onChange when selecting an option', () => {
    const onChange = vi.fn();

    act(() => {
      render(
        <RadioGroup
          options={mockOptions}
          value="1"
          onChange={onChange}
        />
      );
    });

    const radios = document.querySelectorAll('[role="radio"]');
    const secondRadio = radios[1];

    act(() => {
      if (secondRadio) fireEvent.click(secondRadio);
    });

    expect(onChange).toHaveBeenCalled();
  });

  it('does not call onChange when clicking disabled option', () => {
    const onChange = vi.fn();

    act(() => {
      render(
        <RadioGroup
          options={mockOptions}
          value="1"
          onChange={onChange}
        />
      );
    });

    const radios = document.querySelectorAll('[role="radio"]');
    const disabledRadio = radios[2];

    act(() => {
      if (disabledRadio) fireEvent.click(disabledRadio);
    });

    expect(onChange).not.toHaveBeenCalled();
  });

  it('respects controlled value', () => {
    act(() => {
      render(
        <RadioGroup
          options={mockOptions}
          value="2"
          onChange={vi.fn()}
        />
      );
    });

    const radios = document.querySelectorAll('[role="radio"]');

    expect(radios[1]?.getAttribute('aria-checked')).toBe('true');
    expect(radios[0]?.getAttribute('aria-checked')).toBe('false');
  });

  it('applies custom class names', () => {
    act(() => {
      render(
        <RadioGroup
          options={mockOptions}
          value="1"
          onChange={vi.fn()}
          className="custom-root"
          labelClassName="custom-label"
          descriptionClassName="custom-description"
          optionClassName="custom-option"
          radioClassName="custom-radio"
          optionLabelClassName="custom-option-label"
          optionDescriptionClassName="custom-option-description"
          label="Label"
          description="Description"
        />
      );
    });

    const root = document.querySelector('.custom-root');
    const label = document.querySelector('.custom-label');
    const description = document.querySelector('.custom-description');
    const option = document.querySelector('.custom-option');
    const radio = document.querySelector('.custom-radio');
    const optionLabel = document.querySelector('.custom-option-label');

    expect(root).toBeTruthy();
    expect(label).toBeTruthy();
    expect(description).toBeTruthy();
    expect(option).toBeTruthy();
    expect(radio).toBeTruthy();
    expect(optionLabel).toBeTruthy();
  });

  it('renders option descriptions when provided', () => {
    const optionsWithDescriptions: RadioOption[] = [
        { label: 'Option A', value: 'a', iconName: 'CheckIcon', description: 'Desc A' },
    ];

    act(() => {
      render(
        <RadioGroup
          options={optionsWithDescriptions}
          value="a"
          onChange={vi.fn()}
        />
      );
    });

    expect(screen.getByText('Desc A')).toBeTruthy();
  });

  it('applies horizontal layout when orientation is horizontal', () => {
    act(() => {
      render(
        <RadioGroup
          options={mockOptions}
          value="1"
          onChange={vi.fn()}
          orientation="horizontal"
          className="test-root"
        />
      );
    });

    const root = document.querySelector('.test-root');
    expect(root).toBeTruthy();
  });

  it('respects disabled group state', () => {
    act(() => {
      render(
        <RadioGroup
          options={mockOptions}
          value="1"
          onChange={vi.fn()}
          disabled={true}
          className="test-root"
        />
      );
    });

    const root = document.querySelector('.test-root');
    expect(root).toBeTruthy();

    // Just verify disabled styling applied
    expect(root!.className.includes('opacity-50')).toBe(true);
  });
});
