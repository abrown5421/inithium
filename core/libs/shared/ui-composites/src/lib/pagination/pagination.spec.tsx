import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Pagination } from './pagination.component';
import { pageSlots } from './pagination.service';

describe('pageSlots (decision 0073)', () => {
  it('shows every page when there are few', () => {
    expect(pageSlots(1, 5, 1)).toEqual([1, 2, 3, 4, 5]);
  });

  it('keeps the same number of slots wherever the current page is', () => {
    const lengths = Array.from({ length: 20 }, (_, i) => pageSlots(i + 1, 20, 1).length);
    expect(new Set(lengths)).toEqual(new Set([7]));
  });

  it('puts gaps around the current page’s neighbours', () => {
    expect(pageSlots(1, 20, 1)).toEqual([1, 2, 3, 4, 5, 'gap-end', 20]);
    expect(pageSlots(10, 20, 1)).toEqual([1, 'gap-start', 9, 10, 11, 'gap-end', 20]);
    expect(pageSlots(20, 20, 1)).toEqual([1, 'gap-start', 16, 17, 18, 19, 20]);
  });

  it('never hides a single page behind a gap', () => {
    expect(pageSlots(4, 7, 1)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });
});

describe('<Pagination />', () => {
  afterEach(cleanup);

  it('marks the current page and moves with the arrows', async () => {
    const onPageChange = vi.fn();
    render(<Pagination pageCount={20} defaultPage={10} onPageChange={onPageChange} />);
    expect(screen.getByRole('button', { current: 'page' }).textContent).toBe('10');

    await userEvent.click(screen.getByRole('button', { name: /next/i }));
    expect(onPageChange).toHaveBeenLastCalledWith(11);
    expect(screen.getByRole('button', { current: 'page' }).textContent).toBe('11');
  });

  it('disables the previous arrow on the first page', () => {
    render(<Pagination pageCount={5} />);
    expect(screen.getByRole('button', { name: /previous/i }).hasAttribute('disabled')).toBe(true);
  });

  it('makes pages real links with getPageHref, still handing plain clicks to onPageChange', async () => {
    const onPageChange = vi.fn();
    render(<Pagination pageCount={5} getPageHref={(page) => `?page=${page}`} onPageChange={onPageChange} />);
    const link = screen.getByRole('link', { name: /page 3/i });
    expect(link.getAttribute('href')).toBe('?page=3');
    await userEvent.click(link);
    expect(onPageChange).toHaveBeenCalledWith(3);
  });
});
