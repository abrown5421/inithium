import { describe, it, expect, vi } from 'vitest';
import reducer, { setTokens, clearTokens, AuthState } from './auth.slice.js';
import { AuthTokens } from '@inithium/types';

vi.mock('../../apis/index.js', () => ({
  authApi: {
    endpoints: {
      login:    { matchFulfilled: (action: any) => action.type === 'login/fulfilled' },
      register: { matchFulfilled: (action: any) => action.type === 'register/fulfilled' },
      refresh:  { matchFulfilled: (action: any) => action.type === 'refresh/fulfilled' },
      logout:   { matchFulfilled: (action: any) => action.type === 'logout/fulfilled' },
    },
  },
}));

const makeToken = (sub: string): string => {
  const payload = btoa(JSON.stringify({ sub }));
  return `header.${payload}.signature`;
};

const makeTokens = (accessToken: string): AuthTokens => ({
  accessToken,
  refreshToken: 'refresh-token',
  user: { id: 'placeholder' } as any,
});

describe('authSlice', () => {
  const initialState: AuthState = {
    accessToken: null,
    userId: null,
  };

  it('should handle initial state', () => {
    expect(reducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle setTokens and decode userId from JWT', () => {
    const token = makeToken('user-abc');
    const actual = reducer(initialState, setTokens(makeTokens(token)));
    expect(actual.accessToken).toBe(token);
    expect(actual.userId).toBe('user-abc');
  });

it('should set userId to null when JWT payload is malformed', () => {
  const actual = reducer(initialState, setTokens(makeTokens('not.a.jwt')));
  expect(actual.userId).toBeNull();
});

it('should set userId to null when JWT has no sub claim', () => {
  const payload = btoa(JSON.stringify({ role: 'admin' }));
  const token = `header.${payload}.signature`;
  const actual = reducer(initialState, setTokens(makeTokens(token)));
  expect(actual.userId).toBeNull();
});

  it('should handle clearTokens', () => {
    const state: AuthState = { accessToken: 'some-token', userId: 'user-abc' };
    const actual = reducer(state, clearTokens());
    expect(actual.accessToken).toBeNull();
    expect(actual.userId).toBeNull();
  });

  it('should apply tokens on login fulfilled', () => {
    const token = makeToken('user-login');
    const actual = reducer(initialState, { type: 'login/fulfilled', payload: { accessToken: token } } as any);
    expect(actual.accessToken).toBe(token);
    expect(actual.userId).toBe('user-login');
  });

  it('should apply tokens on register fulfilled', () => {
    const token = makeToken('user-register');
    const actual = reducer(initialState, { type: 'register/fulfilled', payload: { accessToken: token } } as any);
    expect(actual.accessToken).toBe(token);
    expect(actual.userId).toBe('user-register');
  });

  it('should apply tokens on refresh fulfilled', () => {
    const token = makeToken('user-refresh');
    const actual = reducer(initialState, { type: 'refresh/fulfilled', payload: { accessToken: token } } as any);
    expect(actual.accessToken).toBe(token);
    expect(actual.userId).toBe('user-refresh');
  });

  it('should clear tokens on logout fulfilled', () => {
    const state: AuthState = { accessToken: 'old-token', userId: 'user-abc' };
    const actual = reducer(state, { type: 'logout/fulfilled' } as any);
    expect(actual.accessToken).toBeNull();
    expect(actual.userId).toBeNull();
  });
});