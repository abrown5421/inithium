import { describe, it, expect } from 'vitest';
import reducer, {
  requestTransition,
  enterComplete,
  initialize,
  TransitionState
} from './transition.slice.js';

describe('transitionSlice', () => {
  const initialState: TransitionState = {
    activePage: null,
    pendingPage: null,
    phase: 'idle',
  };

  it('should handle initial state', () => {
    expect(reducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle initialize', () => {
    const actual = reducer(initialState, initialize('/home'));
    expect(actual.activePage).toBe('/home');
    expect(actual.phase).toBe('entered');
  });

  it('should handle requestTransition', () => {
    const state = { ...initialState, activePage: '/home', phase: 'entered' as const };
    const actual = reducer(state, requestTransition('/about'));
    expect(actual.pendingPage).toBe('/about');
    expect(actual.phase).toBe('exiting');
  });

  it('should not update pendingPage if requesting current activePage', () => {
    const state = { ...initialState, activePage: '/home', phase: 'entered' as const };
    const actual = reducer(state, requestTransition('/home'));
    expect(actual.pendingPage).toBeNull();
  });

  it('should handle enterComplete', () => {
    const state = { ...initialState, phase: 'entering' as const };
    const actual = reducer(state, enterComplete());
    expect(actual.phase).toBe('entered');
  });
});