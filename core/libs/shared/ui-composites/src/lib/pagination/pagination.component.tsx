import { useEffect, useRef, useState, type CSSProperties, type MouseEvent, type ReactNode } from 'react';
import type { PaginationSerializableProps } from '@inithium/shared-contracts';
import { Container, Icon, Select, toCssColor, type AnimationRuntimeProps, type IconName } from '@inithium/shared-ui-components';
import { pageSlots } from './pagination.service';
import { paginationStyleSheet } from './pagination.styles';

const ICON_SIZE = 16;

export type PaginationProps = PaginationSerializableProps &
  AnimationRuntimeProps & {
    /** How many pages there are. */
    pageCount: number;
    /** The current page, from 1. */
    page?: number;
    defaultPage?: number;
    onPageChange?: (page: number) => void;
    /** Makes each page a real link to this address (bookmarkable, opens in new tabs). Plain clicks still call onPageChange. */
    getPageHref?: (page: number) => string;
    /** Items per page, for the 'Rows per page' select and the summary. Default: the first of pageSizeOptions. */
    pageSize?: number;
    /** Called with the new size; the page goes back to 1. */
    onPageSizeChange?: (size: number) => void;
    /** With pageSize, shows '21–40 of 312' at the start. */
    totalItems?: number;
    /** Names the control for screen readers. Default 'Pagination'. */
    'aria-label'?: string;
  };

/** A plain left click, with no key held: the only kind handed to onPageChange from a link. */
const isPlainClick = (event: MouseEvent) =>
  event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;

/**
 * Moves through pages of a list (decision 0073): previous and next arrows around the page numbers, with gaps in
 * long ranges so the row keeps its length; optional first and last buttons, a compact 'Page 5 of 20' mode, a
 * 'Rows per page' select and a '21–40 of 312' summary. Pages are buttons, or real links with getPageHref.
 */
export function Pagination({
  pageCount,
  page: pageProp,
  defaultPage = 1,
  onPageChange,
  getPageHref,
  color = 'primary',
  siblingCount = 1,
  showFirstLast = false,
  compact = false,
  pageSizeOptions,
  pageSize: pageSizeProp,
  onPageSizeChange,
  totalItems,
  'aria-label': ariaLabel = 'Pagination',
  margin,
  padding,
  animation,
  show,
  replay,
  onEntranceEnd,
  onExitEnd,
}: PaginationProps) {
  const count = Math.max(1, pageCount);
  const [ownPage, setOwnPage] = useState(defaultPage);
  const page = Math.min(Math.max(pageProp ?? ownPage, 1), count);
  const [ownPageSize, setOwnPageSize] = useState(pageSizeOptions?.[0]);
  const pageSize = pageSizeProp ?? ownPageSize;

  const pages = useRef<HTMLUListElement>(null);
  // An arrow that was used and is now disabled (e.g. ← on page 1) can't keep focus; the current page takes it.
  const arrowUsed = useRef(false);
  useEffect(() => {
    if (!arrowUsed.current) return;
    arrowUsed.current = false;
    const active = document.activeElement;
    if (active instanceof HTMLButtonElement && active.disabled) {
      pages.current?.querySelector<HTMLElement>('[aria-current=page], .ui-pagination-text')?.focus();
    }
  }, [page]);

  const goTo = (next: number, fromArrow = false) => {
    const target = Math.min(Math.max(next, 1), count);
    if (target === page) return;
    arrowUsed.current = fromArrow;
    setOwnPage(target);
    onPageChange?.(target);
  };

  const accent = typeof color === 'string' ? color : color.color;
  const style = {
    '--ui-pagination-accent': toCssColor(color),
    '--ui-pagination-on-accent': toCssColor({ color: accent, intensity: 100 }),
  } as CSSProperties;

  // A page item: a link with getPageHref (plain clicks still go through goTo), otherwise a button.
  const pageItem = (target: number, label: string, content: ReactNode, current = false) => {
    const common = { className: 'ui-page', 'aria-label': label, 'aria-current': current ? ('page' as const) : undefined };
    if (getPageHref) {
      return (
        <a
          {...common}
          href={getPageHref(target)}
          onClick={(event) => {
            if (!isPlainClick(event)) return;
            event.preventDefault();
            goTo(target);
          }}
        >
          {content}
        </a>
      );
    }
    return (
      <button {...common} type="button" onClick={() => goTo(target)}>
        {content}
      </button>
    );
  };

  // Arrows are always buttons: they're disabled at the ends, which links can't be.
  const arrow = (target: number, label: string, icon: IconName, disabled: boolean) => (
    <li>
      <button type="button" className="ui-page" aria-label={label} disabled={disabled} onClick={() => goTo(target, true)}>
        <Icon name={icon} size={ICON_SIZE} />
      </button>
    </li>
  );

  const first = page === 1;
  const last = page === count;
  const summary =
    totalItems !== undefined && pageSize ? (
      <span className="ui-pagination-text">
        {totalItems === 0 ? 0 : (page - 1) * pageSize + 1}–{Math.min(page * pageSize, totalItems)} of {totalItems}
      </span>
    ) : null;

  return (
    <>
      {/* React hoists this to <head> and keeps one copy however many render. */}
      <style href="inithium-pagination" precedence="default">
        {paginationStyleSheet}
      </style>
      <Container
        as="nav"
        aria-label={ariaLabel}
        margin={margin}
        padding={padding}
        animation={animation}
        show={show}
        replay={replay}
        onEntranceEnd={onEntranceEnd}
        onExitEnd={onExitEnd}
      >
        <div className="ui-pagination" style={style}>
          {summary}
          <ul ref={pages} className="ui-pagination-pages">
            {showFirstLast && arrow(1, 'First page', 'chevrons-left', first)}
            {arrow(page - 1, 'Previous page', 'chevron-left', first)}
            {compact ? (
              <li>
                <span className="ui-pagination-text" tabIndex={-1} aria-current="page">
                  Page {page} of {count}
                </span>
              </li>
            ) : (
              pageSlots(page, count, siblingCount).map((slot) =>
                typeof slot === 'number' ? (
                  <li key={slot}>{pageItem(slot, `Page ${slot}`, slot, slot === page)}</li>
                ) : (
                  <li key={slot} className="ui-pagination-gap" aria-hidden="true">
                    …
                  </li>
                ),
              )
            )}
            {arrow(page + 1, 'Next page', 'chevron-right', last)}
            {showFirstLast && arrow(count, 'Last page', 'chevrons-right', last)}
          </ul>
          {pageSizeOptions && (
            <div className="ui-pagination-size">
              <span className="ui-pagination-text">Rows per page</span>
              <Select
                aria-label="Rows per page"
                width={80}
                value={pageSize ? String(pageSize) : undefined}
                onValueChange={(value) => {
                  const size = Number(value);
                  setOwnPageSize(size);
                  onPageSizeChange?.(size);
                  goTo(1);
                }}
                options={pageSizeOptions.map((size) => ({ value: String(size), label: String(size) }))}
              />
            </div>
          )}
        </div>
      </Container>
    </>
  );
}
