import { describe, it, expect } from 'vitest';
import { getPageByKey, getPageByPath, PAGE_REGISTRY } from './registry';

describe('Page Registry Utilities', () => {
  it('should find a page by key', () => {
    const page = getPageByKey('home');
    expect(page).toBeDefined();
    expect(page?.path).toBe('/');
  });

  it('should return undefined for non-existent key', () => {
    const page = getPageByKey('non-existent');
    expect(page).toBeUndefined();
  });

  it('should find a page by path', () => {
    const page = getPageByPath('/auth/login');
    expect(page).toBeDefined();
    expect(page?.key).toBe('login');
  });

  it('should contain the expected number of routes', () => {
    expect(PAGE_REGISTRY.length).toBeGreaterThan(0);
  });
});