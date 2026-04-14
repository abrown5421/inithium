import { render, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { Textarea } from './textarea';

afterEach(() => {
  cleanup();
});

const renderTextarea = (props = {}) => {
  return render(
    <Textarea
      value=""
      onChange={vi.fn()}
      {...props}
    />
  );
};

describe('Textarea', () => {
  it('renders textarea element', () => {
    renderTextarea();
    expect(document.querySelector('textarea')).toBeTruthy();
  });

  it('renders label when provided', () => {
    renderTextarea({ label: 'Test Label' });
    expect(document.body.textContent).toContain('Test Label');
  });

  it('renders description when provided', () => {
    renderTextarea({ description: 'Test Description' });
    expect(document.body.textContent).toContain('Test Description');
  });

  it('renders error instead of description', () => {
    renderTextarea({
      description: 'Hidden Description',
      error: 'Error Message',
    });

    expect(document.body.textContent).toContain('Error Message');
    expect(document.body.textContent).not.toContain('Hidden Description');
  });

  it('calls onChange when typing', () => {
    const onChange = vi.fn();

    renderTextarea({ onChange });

    const textarea = document.querySelector('textarea');
    fireEvent.change(textarea!, { target: { value: 'hello' } });

    expect(onChange).toHaveBeenCalled();
  });

  it('respects controlled value', () => {
    renderTextarea({ value: 'controlled text' });

    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    expect(textarea.value).toBe('controlled text');
  });
  
  it('applies invalid state styling', () => {
    renderTextarea({ invalid: true });

    const textarea = document.querySelector('textarea');
    expect(textarea?.className).toContain('border-2');
  });

  // ✅ SIZE TEST
  it.each([
    ['sm', 'px-2.5 py-1.5 text-xs'],
    ['base', 'px-3 py-2 text-sm'],
    ['lg', 'px-4 py-3 text-base'],
    ['xl', 'px-5 py-3.5 text-lg'],
  ])('applies correct size classes for %s', (size, expected) => {
    renderTextarea({ size });

    const textarea = document.querySelector('textarea');
    expect(textarea?.className).toContain(expected);
  });

  // ✅ RESIZE TEST
  it.each([
    ['none', 'resize-none'],
    ['vertical', 'resize-y'],
    ['horizontal', 'resize-x'],
    ['both', 'resize'],
  ])('applies correct resize behavior for %s', (resize, expected) => {
    renderTextarea({ resize });

    const textarea = document.querySelector('textarea');
    expect(textarea?.className).toContain(expected);
  });

  // ✅ VARIANT TESTS (light touch — don’t overfit)
  it('applies filled variant styles', () => {
    renderTextarea({ variant: 'filled' });

    const textarea = document.querySelector('textarea');
    expect(textarea?.className).toContain('border-transparent');
  });

  it('applies outlined variant styles', () => {
    renderTextarea({ variant: 'outlined' });

    const textarea = document.querySelector('textarea');
    expect(textarea?.className).toContain('border-2');
  });

  it('applies ghost variant styles', () => {
    renderTextarea({ variant: 'ghost' });

    const textarea = document.querySelector('textarea');
    expect(textarea?.className).toContain('border-b-2');
    expect(textarea?.className).toContain('rounded-none');
  });

  // ✅ CHAR COUNT
  it('shows character count when enabled', () => {
    renderTextarea({
      value: 'hello',
      showCharCount: true,
    });

    expect(document.body.textContent).toContain('5');
  });

  it('shows maxLength in character count', () => {
    renderTextarea({
      value: 'hello',
      showCharCount: true,
      maxLength: 10,
    });

    expect(document.body.textContent).toContain('5/10');
  });

  it('applies danger color when exceeding maxLength', () => {
    renderTextarea({
      value: '1234567890',
      showCharCount: true,
      maxLength: 5,
    });

    const counter = document.body.querySelector('span:last-child');
    expect(counter?.className).toContain('text-danger');
  });

  // ✅ ROWS
  it('applies rows attribute', () => {
    renderTextarea({ rows: 6 });

    const textarea = document.querySelector('textarea');
    expect(textarea?.getAttribute('rows')).toBe('6');
  });

  // ✅ CLASS OVERRIDES
  it('applies custom textarea className', () => {
    renderTextarea({ textareaClassName: 'custom-textarea' });

    const textarea = document.querySelector('textarea');
    expect(textarea?.className).toContain('custom-textarea');
  });

  it('applies custom wrapper className', () => {
    renderTextarea({ wrapperClassName: 'custom-wrapper' });

    const wrapper = document.querySelector('textarea')?.parentElement;
    expect(wrapper?.className).toContain('custom-wrapper');
  });

  it('applies custom root className', () => {
    renderTextarea({ className: 'custom-root' });

    const root = document.querySelector('textarea')?.closest('div')?.parentElement;
    expect(root?.className).toContain('custom-root');
  });
});
