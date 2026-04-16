/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePageTransition } from './use-transition.js';
import { useDispatch, useSelector } from 'react-redux';

vi.mock('react-redux', () => ({
  useDispatch: vi.fn(),
  useSelector: vi.fn(),
}));

describe('usePageTransition', () => {
  const mockDispatch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useDispatch as any).mockReturnValue(mockDispatch);
  });

  it('returns current state from redux', () => {
    (useSelector as any).mockReturnValue({
      phase: 'idle',
      activePage: '/',
      pendingPage: null,
    });

    const { result } = renderHook(() => usePageTransition());

    expect(result.current.phase).toBe('idle');
    expect(result.current.activePage).toBe('/');
  });

  it('triggers exit animation and dispatches commit', async () => {
    vi.useFakeTimers();
    (useSelector as any).mockReturnValue({
      phase: 'exiting',
      activePage: '/',
      pendingPage: '/next',
    });

    const { result } = renderHook(() => usePageTransition());
    
    await act(async () => {
      const promise = result.current.controller.triggerExit();
      vi.advanceTimersByTime(600);
      await promise;
    });

    expect(mockDispatch).toHaveBeenCalled();
    vi.useRealTimers();
  });
});