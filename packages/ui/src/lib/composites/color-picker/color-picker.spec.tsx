import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

vi.mock('react-colorful', () => ({
  HexColorPicker: ({ color, onChange }: { color: string; onChange: (hex: string) => void }) => (
    <div
      data-testid="hex-color-picker"
      data-color={color}
      onClick={() => onChange('#ff0000')}
    />
  ),
}));

vi.mock('@inithium/utils', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
}));

vi.mock('../../components/input/input', () => ({
  Input: ({
    value,
    onChange,
    onFocus,
    disabled,
    invalid,
    error,
    placeholder,
    leadingIcon,
    label,
    description,
  }: any) => (
    <div>
      {label && <label>{label}</label>}
      {description && <span>{description}</span>}
      {leadingIcon}
      <input
        data-testid="color-input"
        value={value}
        onChange={onChange}
        onFocus={onFocus}
        disabled={disabled}
        placeholder={placeholder}
        aria-invalid={invalid}
      />
      {error && <span data-testid="error-message">{error}</span>}
    </div>
  ),
}));

vi.mock('../../components/box/box', () => ({
  Box: ({ children, ...props }: any) => <div {...props}>{children}</div>,
}));

vi.mock('../../components/icon/icon', () => ({
  Icon: ({ name, 'aria-label': ariaLabel, color }: any) => (
    <span data-testid={`icon-${name}`} aria-label={ariaLabel} data-color={color} />
  ),
}));

import { ColorPicker } from './color-picker';

describe('ColorPicker', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders the input', () => {
      render(<ColorPicker />);
      expect(screen.getByTestId('color-input')).not.toBeNull();
    });

    it('renders with defaultValue in the input', () => {
      render(<ColorPicker defaultValue="#abcdef" />);
      expect(screen.getByTestId('color-input').getAttribute('value')).toBe('#abcdef');
    });

    it('falls back to #6366f1 when no defaultValue is given', () => {
      render(<ColorPicker />);
      expect(screen.getByTestId('color-input').getAttribute('value')).toBe('#6366f1');
    });

    it('renders a color swatch when the default value is a valid hex', () => {
      render(<ColorPicker defaultValue="#ff0000" />);
      // swatch is a plain span with inline backgroundColor — no icon
      expect(screen.queryByTestId('icon-NoSymbolIcon')).toBeNull();
    });

    it('renders the invalid icon when value is not a valid hex', () => {
      render(<ColorPicker defaultValue="#gg0000" />);
      expect(screen.getByTestId('icon-NoSymbolIcon')).not.toBeNull();
    });

    it('does not render the picker dialog initially', () => {
      render(<ColorPicker />);
      expect(screen.queryByRole('dialog')).toBeNull();
    });

    it('renders a label when provided', () => {
      render(<ColorPicker label="Pick a color" />);
      expect(screen.getByText('Pick a color')).not.toBeNull();
    });

    it('renders a description when provided', () => {
      render(<ColorPicker description="Choose wisely" />);
      expect(screen.getByText('Choose wisely')).not.toBeNull();
    });

    it('renders the placeholder on the input', () => {
      render(<ColorPicker placeholder="#aabbcc" />);
      expect(screen.getByTestId('color-input').getAttribute('placeholder')).toBe('#aabbcc');
    });
  });

  describe('picker visibility', () => {
    it('opens the picker dialog on input focus', () => {
      render(<ColorPicker />);
      fireEvent.focus(screen.getByTestId('color-input'));
      expect(screen.getByRole('dialog')).not.toBeNull();
    });

    it('closes the picker when the close button is clicked', () => {
      render(<ColorPicker />);
      fireEvent.focus(screen.getByTestId('color-input'));
      fireEvent.click(screen.getByLabelText('Close color picker'));
      expect(screen.queryByRole('dialog')).toBeNull();
    });

    it('closes the picker on Escape key', () => {
      render(<ColorPicker />);
      fireEvent.focus(screen.getByTestId('color-input'));
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(screen.queryByRole('dialog')).toBeNull();
    });

    it('closes the picker on pointerdown outside the container', () => {
      render(<ColorPicker />);
      fireEvent.focus(screen.getByTestId('color-input'));
      fireEvent.pointerDown(document.body);
      expect(screen.queryByRole('dialog')).toBeNull();
    });

    it('does not close the picker on pointerdown inside the container', () => {
      const { container } = render(<ColorPicker />);
      fireEvent.focus(screen.getByTestId('color-input'));
      fireEvent.pointerDown(container.firstChild as Element);
      expect(screen.getByRole('dialog')).not.toBeNull();
    });

    it('does not open the picker when disabled', () => {
      render(<ColorPicker disabled />);
      fireEvent.focus(screen.getByTestId('color-input'));
      expect(screen.queryByRole('dialog')).toBeNull();
    });

    it('dialog has accessible label', () => {
      render(<ColorPicker />);
      fireEvent.focus(screen.getByTestId('color-input'));
      expect(screen.getByRole('dialog').getAttribute('aria-label')).toBe('Color picker');
    });
  });

  describe('input changes', () => {
    it('updates the input text as the user types', () => {
      render(<ColorPicker />);
      fireEvent.change(screen.getByTestId('color-input'), { target: { value: '#123456' } });
      expect(screen.getByTestId('color-input').getAttribute('value')).toBe('#123456');
    });

    it('prepends # when the user types without it', () => {
      render(<ColorPicker />);
      fireEvent.change(screen.getByTestId('color-input'), { target: { value: 'aabbcc' } });
      expect(screen.getByTestId('color-input').getAttribute('value')).toBe('#aabbcc');
    });

    it('truncates input to 7 characters max', () => {
      render(<ColorPicker />);
      fireEvent.change(screen.getByTestId('color-input'), { target: { value: '#123456789' } });
      expect(screen.getByTestId('color-input').getAttribute('value')).toBe('#123456');
    });

    it('calls onChange with the hex when a valid hex is typed', () => {
      const onChange = vi.fn();
      render(<ColorPicker onChange={onChange} />);
      fireEvent.change(screen.getByTestId('color-input'), { target: { value: '#ff6b6b' } });
      expect(onChange).toHaveBeenCalledWith('#ff6b6b');
    });

    it('does not call onChange when the typed hex is invalid', () => {
      const onChange = vi.fn();
      render(<ColorPicker onChange={onChange} />);
      fireEvent.change(screen.getByTestId('color-input'), { target: { value: '#zzzzzz' } });
      expect(onChange).not.toHaveBeenCalled();
    });

    it('shows an error message for invalid hex longer than 1 char', () => {
      render(<ColorPicker defaultValue="#ff0000" />);
      fireEvent.change(screen.getByTestId('color-input'), { target: { value: '#gg' } });
      expect(screen.getByTestId('error-message')).not.toBeNull();
    });

    it('does not show an error for a single-char input', () => {
      render(<ColorPicker />);
      fireEvent.change(screen.getByTestId('color-input'), { target: { value: '#' } });
      expect(screen.queryByTestId('error-message')).toBeNull();
    });
  });

  describe('HexColorPicker interaction', () => {
    it('renders HexColorPicker inside the dialog with the current color', () => {
      render(<ColorPicker defaultValue="#abcdef" />);
      fireEvent.focus(screen.getByTestId('color-input'));
      const picker = screen.getByTestId('hex-color-picker');
      expect(picker.getAttribute('data-color')).toBe('#abcdef');
    });

    it('updates input text when HexColorPicker fires onChange', () => {
      render(<ColorPicker />);
      fireEvent.focus(screen.getByTestId('color-input'));
      fireEvent.click(screen.getByTestId('hex-color-picker')); // mock fires #ff0000
      expect(screen.getByTestId('color-input').getAttribute('value')).toBe('#ff0000');
    });

    it('calls onChange when HexColorPicker fires onChange', () => {
      const onChange = vi.fn();
      render(<ColorPicker onChange={onChange} />);
      fireEvent.focus(screen.getByTestId('color-input'));
      fireEvent.click(screen.getByTestId('hex-color-picker'));
      expect(onChange).toHaveBeenCalledWith('#ff0000');
    });
  });

  describe('controlled mode', () => {
    it('displays the controlled value', () => {
      render(<ColorPicker value="#123abc" />);
      expect(screen.getByTestId('color-input').getAttribute('value')).toBe('#123abc');
    });

    it('updates the input when the controlled value changes', () => {
      const { rerender } = render(<ColorPicker value="#111111" />);
      rerender(<ColorPicker value="#222222" />);
      expect(screen.getByTestId('color-input').getAttribute('value')).toBe('#222222');
    });

    it('does not update internal hex from defaultValue when controlled', () => {
      render(<ColorPicker value="#aabbcc" defaultValue="#ff0000" />);
      expect(screen.getByTestId('color-input').getAttribute('value')).toBe('#aabbcc');
    });

    it('calls onChange but does not self-update internal state when controlled', () => {
      const onChange = vi.fn();
      render(<ColorPicker value="#aabbcc" onChange={onChange} />);
      fireEvent.change(screen.getByTestId('color-input'), { target: { value: '#ffffff' } });
      expect(onChange).toHaveBeenCalledWith('#ffffff');
      // value stays at what the controller provides
      expect(screen.getByTestId('color-input').getAttribute('value')).toBe('#ffffff');
    });
  });

  describe('disabled state', () => {
    it('passes disabled to the Input', () => {
      render(<ColorPicker disabled />);
      expect(screen.getByTestId('color-input')).toHaveProperty('disabled', true);
    });
  });
});