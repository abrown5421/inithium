/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useCurrentUser } from './use-current-user.js';
import { useSelector } from 'react-redux';
import { useGetMeQuery } from '../../apis/users-api.js';

vi.mock('react-redux', () => ({
  useSelector: vi.fn(),
}));

vi.mock('../../apis/users-api.js', () => ({
  useGetMeQuery: vi.fn(),
}));

describe('useCurrentUser', () => {
  const mockRefetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns null user and unauthenticated state when no userId in store', () => {
    (useSelector as any).mockReturnValue(null);
    (useGetMeQuery as any).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
    });

    const { result } = renderHook(() => useCurrentUser());

    expect(result.current.user).toBeNull();
    expect(result.current.userId).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isError).toBe(false);
  });

  it('skips query when userId is null', () => {
    (useSelector as any).mockReturnValue(null);
    (useGetMeQuery as any).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
    });

    renderHook(() => useCurrentUser());

    expect(useGetMeQuery).toHaveBeenCalledWith(null, { skip: true });
  });

  it('returns user and authenticated state when userId exists', () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' };
    (useSelector as any).mockReturnValue('user-123');
    (useGetMeQuery as any).mockReturnValue({
      data: mockUser,
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
    });

    const { result } = renderHook(() => useCurrentUser());

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.userId).toBe('user-123');
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isError).toBe(false);
  });

  it('does not skip query when userId exists', () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' };
    (useSelector as any).mockReturnValue('user-123');
    (useGetMeQuery as any).mockReturnValue({
      data: mockUser,
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
    });

    renderHook(() => useCurrentUser());

    expect(useGetMeQuery).toHaveBeenCalledWith('user-123', { skip: false });
  });

  it('returns isLoading true when userId exists and query is loading', () => {
    (useSelector as any).mockReturnValue('user-123');
    (useGetMeQuery as any).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: mockRefetch,
    });

    const { result } = renderHook(() => useCurrentUser());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.user).toBeUndefined();
  });

  it('returns isLoading false even if query is loading when userId is null', () => {
    (useSelector as any).mockReturnValue(null);
    (useGetMeQuery as any).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: mockRefetch,
    });

    const { result } = renderHook(() => useCurrentUser());

    expect(result.current.isLoading).toBe(false);
  });

  it('returns isError true when query errors', () => {
    (useSelector as any).mockReturnValue('user-123');
    (useGetMeQuery as any).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch: mockRefetch,
    });

    const { result } = renderHook(() => useCurrentUser());

    expect(result.current.isError).toBe(true);
  });

  it('exposes the refetch function from the query', () => {
    (useSelector as any).mockReturnValue('user-123');
    (useGetMeQuery as any).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
    });

    const { result } = renderHook(() => useCurrentUser());

    result.current.refetch();
    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });
});