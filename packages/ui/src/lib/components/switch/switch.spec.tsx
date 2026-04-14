import { render, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { Switch } from './switch';

afterEach(() => {
  cleanup();
});

const renderSwitch = (props = {}) => {
  return render(
    <Switch
      checked={false}
      onChange={vi.fn()}
      {...props}
    />
  );
};

describe('Switch', () => {
  it('renders without label or description', () => {
    renderSwitch();
    expect(document.querySelector('[role="switch"]')).toBeTruthy();
  });

  it('renders label and description on the right by default', () => {
    renderSwitch({ label: 'Test Label', description: 'Test Description' });

    expect(document.body.textContent).toContain('Test Label');
    expect(document.body.textContent).toContain('Test Description');
  });

  it('renders label on the left when labelPosition is left', () => {
    renderSwitch({
      label: 'Left Label',
      labelPosition: 'left',
    });

    const container = document.querySelector('label');
    expect(container?.textContent?.trim().startsWith('Left Label')).toBe(true);
  });

  it('calls onChange when toggled', () => {
    const onChange = vi.fn();

    renderSwitch({ onChange });

    const switchEl = document.querySelector('[role="switch"]');
    fireEvent.click(switchEl!);

    expect(onChange).toHaveBeenCalled();
  });

  it('respects controlled checked state', () => {
    renderSwitch({ checked: true });

    const switchEl = document.querySelector('[role="switch"]');
    expect(switchEl?.getAttribute('data-headlessui-state')).toContain('checked');
  });

  it('does not call onChange when disabled', () => {
    const onChange = vi.fn();

    renderSwitch({ onChange, disabled: true });

    const switchEl = document.querySelector('[role="switch"]');
    fireEvent.click(switchEl!);

    expect(onChange).not.toHaveBeenCalled();
  });

  it('applies disabled styling', () => {
    renderSwitch({ disabled: true });

    const wrapper = document.querySelector('label');
    expect(wrapper?.className).toContain('opacity-50');
  });

  it('applies custom class names', () => {
    renderSwitch({ className: 'custom-class' });

    const wrapper = document.querySelector('label');
    expect(wrapper?.className).toContain('custom-class');
  });

  // ✅ COLOR TEST
  it('applies checked color class when active', () => {
    renderSwitch({ checked: true, color: 'primary' });

    const switchEl = document.querySelector('[role="switch"]');
    expect(switchEl?.className).toContain('bg-primary');
  });

  it('applies default unchecked background when not active', () => {
    renderSwitch({ checked: false });

    const switchEl = document.querySelector('[role="switch"]');
    expect(switchEl?.className).toContain('bg-gray-300');
  });

  // ✅ SIZE TEST (FIXED)
  it.each([
    ['sm', 'h-4 w-7'],
    ['base', 'h-5 w-9'],
    ['lg', 'h-6 w-11'],
    ['xl', 'h-7 w-13'],
  ])('applies correct size classes for %s', (size, expected) => {
    renderSwitch({ size });

    const switchEl = document.querySelector('[role="switch"]');
    expect(switchEl?.className).toContain(expected);
  });

  // ✅ THUMB TESTS
  it('applies thumb translate when checked', () => {
    renderSwitch({ checked: true, size: 'base' });

    const thumb = document.querySelector('[role="switch"] span');
    expect(thumb?.className).toContain('translate-x-4');
  });

  it('keeps thumb at origin when unchecked', () => {
    renderSwitch({ checked: false });

    const thumb = document.querySelector('[role="switch"] span');
    expect(thumb?.className).toContain('translate-x-0');
  });

  it('does NOT expose name and value attributes on DOM (HeadlessUI behavior)', () => {
    renderSwitch({
      name: 'test-name',
      value: 'test-value',
    });

    const switchEl = document.querySelector('[role="switch"]');

    expect(switchEl?.getAttribute('name')).toBeNull();
    expect(switchEl?.getAttribute('value')).toBeNull();
  });
});
