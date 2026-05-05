import { describe, it, expect } from 'vitest';
import reducer, { showAlert, closeAlert } from './alert.slice.js';
import type { AlertProps } from '@inithium/types';

describe('alertSlice', () => {
  const initialState: AlertProps = {
    open: false,
    severity: 'primary',
    message: '',
    position: 'bottom-right',
    animationObject: {
      entry: 'fadeInRight',
      exit: 'fadeOutRight',
    },
  };

  it('should handle initial state', () => {
    expect(reducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle showAlert and set open to true', () => {
    const payload: Omit<AlertProps, 'open'> = {
      severity: 'danger',
      message: 'Something went wrong',
      position: 'top-left',
      animationObject: { entry: 'fadeInLeft', exit: 'fadeOutLeft' },
    };
    const actual = reducer(initialState, showAlert(payload));
    expect(actual.open).toBe(true);
    expect(actual.severity).toBe('danger');
    expect(actual.message).toBe('Something went wrong');
    expect(actual.position).toBe('top-left');
    expect(actual.animationObject).toEqual({ entry: 'fadeInLeft', exit: 'fadeOutLeft' });
  });

  it('should handle closeAlert and set open to false', () => {
    const openState: AlertProps = { ...initialState, open: true, message: 'Hello' };
    const actual = reducer(openState, closeAlert());
    expect(actual.open).toBe(false);
  });

  it('should preserve other fields when closing alert', () => {
    const openState: AlertProps = {
      open: true,
      severity: 'success',
      message: 'Saved!',
      position: 'top-right',
      animationObject: { entry: 'fadeInRight', exit: 'fadeOutRight' },
    };
    const actual = reducer(openState, closeAlert());
    expect(actual.severity).toBe('success');
    expect(actual.message).toBe('Saved!');
    expect(actual.position).toBe('top-right');
  });

  it('should overwrite previous alert state on consecutive showAlert calls', () => {
    const first = reducer(initialState, showAlert({
      severity: 'warning',
      message: 'First alert',
      position: 'bottom-left',
      animationObject: { entry: 'fadeInLeft', exit: 'fadeOutLeft' },
    }));
    const second = reducer(first, showAlert({
      severity: 'success',
      message: 'Second alert',
      position: 'top-right',
      animationObject: { entry: 'fadeInRight', exit: 'fadeOutRight' },
    }));
    expect(second.open).toBe(true);
    expect(second.severity).toBe('success');
    expect(second.message).toBe('Second alert');
  });
});