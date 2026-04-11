import { describe, it, expect } from 'vitest';
import { cn } from './cn.js';

describe('cn utility', () => {
  it('should flatten and join class names', () => {
    const result = cn('btn', ['btn-primary', 'active'], 'p-4');
    expect(result).toBe('btn btn-primary active p-4');
  });

  it('should filter out falsy values', () => {
    const isError = false;
    const result = cn('input', isError && 'border-red', null, undefined);
    expect(result).toBe('input');
  });

  it('should normalize erratic whitespace', () => {
    const result = cn('  fixed   top-0  ', ' left-0 ');
    expect(result).toBe('fixed top-0 left-0');
  });

  it('should handle deeply nested arrays', () => {
    const result = cn(['a', ['b', ['c']]]);
    expect(result).toBe('a b c');
  });
});