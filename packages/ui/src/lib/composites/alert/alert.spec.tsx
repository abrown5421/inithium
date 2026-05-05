import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';

const mockDispatch = vi.fn();

vi.mock('react-redux', () => ({
  useDispatch: () => mockDispatch,
  useSelector: (selector: any) =>
    selector({
      alert: mockState,
    }),
}));

vi.mock('@inithium/store', () => ({
  closeAlert: () => ({ type: 'alert/close' }),
}));

// Stub UI components to keep tests simple
vi.mock('@inithium/ui', () => ({
  Box: (props: any) => <div {...props} />,
  Button: (props: any) => <button {...props} />,
  Text: (props: any) => <span {...props} />,
  Icon: () => <span data-testid="icon" />,
}));

vi.mock('@inithium/utils', () => ({
  cn: (...classes: string[]) => classes.filter(Boolean).join(' '),
}));

import { AlertComposite } from './alert';

let mockState: any;

describe('AlertComposite', () => {
  beforeEach(() => {
    vi.useFakeTimers();

    mockState = {
      open: false,
      severity: 'error',
      message: 'Test alert message',
      position: 'top-right',
      animationObject: {
        entry: 'fadeIn',
        exit: 'fadeOut',
        entrySpeed: 'fast',
        exitSpeed: 'slow',
      },
    };

    mockDispatch.mockClear();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('does not render when closed', () => {
    render(<AlertComposite />);
    expect(screen.queryByText('Test alert message')).toBeNull();
  });

  it('renders when open becomes true', () => {
    mockState.open = true;

    render(<AlertComposite />);
    expect(screen.queryByText('Test alert message')).not.toBeNull();
  });

  it('dispatches closeAlert when button is clicked', () => {
    mockState.open = true;

    render(<AlertComposite />);
    const button = screen.getByRole('button');

    fireEvent.click(button);

    expect(mockDispatch).toHaveBeenCalledWith({ type: 'alert/close' });
  });

  it('auto closes after 3 seconds', () => {
    mockState.open = true;

    render(<AlertComposite />);

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(mockDispatch).toHaveBeenCalledWith({ type: 'alert/close' });
  });

  it('remains rendered until animation ends when closing', () => {
    mockState.open = true;

    const { rerender } = render(<AlertComposite />);
    expect(screen.queryByText('Test alert message')).not.toBeNull();

    mockState = { ...mockState, open: false };
    rerender(<AlertComposite />);
    expect(screen.queryByText('Test alert message')).not.toBeNull();

    fireEvent.animationEnd(screen.getByText('Test alert message').closest('div')!);

    expect(screen.queryByText('Test alert message')).toBeNull();
  });
});