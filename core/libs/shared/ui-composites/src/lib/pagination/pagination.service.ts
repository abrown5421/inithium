/** One slot in the page row: a page number, or a gap ('…') before or after the current page's neighbours. */
export type PageSlot = number | 'gap-start' | 'gap-end';

const range = (from: number, to: number) => Array.from({ length: Math.max(0, to - from + 1) }, (_, index) => from + index);

/**
 * The slots to show (decision 0073): the first and last pages, the current page with `siblings` neighbours each
 * side, and a gap where pages are skipped. The row keeps the same number of slots wherever the current page is,
 * so buttons don't move as you page: 1 … 4 [5] 6 … 20, or [1] 2 3 4 5 … 20.
 */
export function pageSlots(page: number, count: number, siblings: number): PageSlot[] {
  const boundary = 1;
  const startPages = range(1, Math.min(boundary, count));
  const endPages = range(Math.max(count - boundary + 1, boundary + 1), count);
  const siblingsStart = Math.max(Math.min(page - siblings, count - boundary - siblings * 2 - 1), boundary + 2);
  const siblingsEnd = Math.min(
    Math.max(page + siblings, boundary + siblings * 2 + 2),
    endPages.length > 0 ? endPages[0] - 2 : count - 1,
  );

  // Where a gap would hide just one page, show that page instead.
  const before: PageSlot[] =
    siblingsStart > boundary + 2 ? ['gap-start'] : boundary + 1 < count - boundary ? [boundary + 1] : [];
  const after: PageSlot[] =
    siblingsEnd < count - boundary - 1 ? ['gap-end'] : count - boundary > boundary ? [count - boundary] : [];

  return [...startPages, ...before, ...range(siblingsStart, siblingsEnd), ...after, ...endPages];
}
