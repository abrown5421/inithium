import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from 'react';
import type { BreadcrumbItem, BreadcrumbsSerializableProps } from '@inithium/shared-contracts';
import { Container, Icon, Tooltip, toCssColor, type AnimationRuntimeProps, type IconName } from '@inithium/shared-ui-components';
import { breadcrumbsStyleSheet } from './breadcrumbs.styles';

const ICON_SIZE = 16;
const SEPARATOR_SIZE = 14;
/** A separator that looks like an icon name ('chevron-right', 'slash') is drawn as one; anything else is text. */
const ICON_NAME = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** One step in the trail, with its icon typed as Lucide's names. */
export type BreadcrumbsItem = Omit<BreadcrumbItem, 'icon'> & { icon?: IconName };

export type BreadcrumbsProps = Omit<BreadcrumbsSerializableProps, 'items'> &
  AnimationRuntimeProps & {
    items: BreadcrumbsItem[];
    /** Follows a link on a plain click, e.g. with the app's router. Without it, links navigate normally. */
    onNavigate?: (href: string) => void;
    /** Names the trail for screen readers. Default 'Breadcrumb'. */
    'aria-label'?: string;
  };

/** A plain left click, with no key held: the only kind handed to `onNavigate` (others open tabs and so on). */
const isPlainClick = (event: MouseEvent) =>
  event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;

/**
 * The path from the top of the site to the current page (decision 0072): links separated by chevrons, with the
 * current page last and bold. Links are real links (middle-click and new tabs work); `onNavigate` lets the app's
 * router follow plain clicks. Long trails can collapse to '…', and long labels are cut short with a tooltip.
 */
export function Breadcrumbs({
  items,
  separator = 'chevron-right',
  maxItems,
  color = 'primary',
  onNavigate,
  'aria-label': ariaLabel = 'Breadcrumb',
  margin,
  padding,
  animation,
  show,
  replay,
  onEntranceEnd,
  onExitEnd,
}: BreadcrumbsProps) {
  const [expanded, setExpanded] = useState(false);
  const list = useRef<HTMLOListElement>(null);
  // After expanding with '…', focus moves to the first step that was hidden.
  const revealFocus = useRef(false);
  useEffect(() => {
    if (!revealFocus.current) return;
    revealFocus.current = false;
    list.current?.querySelectorAll<HTMLElement>('.ui-breadcrumbs-item')[1]?.querySelector<HTMLElement>('a')?.focus();
  }, [expanded]);

  const collapsed = maxItems !== undefined && !expanded && items.length > maxItems;
  // Collapsed: the first step, '…', then the last ones, maxItems steps in all.
  const shown: (BreadcrumbsItem | 'more')[] = collapsed ? [items[0], 'more', ...items.slice(-(maxItems - 1))] : items;

  const separatorMark = ICON_NAME.test(separator) ? <Icon name={separator as IconName} size={SEPARATOR_SIZE} /> : separator;

  return (
    <>
      {/* React hoists this to <head> and keeps one copy however many render. */}
      <style href="inithium-breadcrumbs" precedence="default">
        {breadcrumbsStyleSheet}
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
        <ol ref={list} className="ui-breadcrumbs" style={{ '--ui-breadcrumbs-accent': toCssColor(color) } as CSSProperties}>
          {shown.map((step, index) => (
            <li key={step === 'more' ? 'more' : `${index}-${step.label}`} className="ui-breadcrumbs-item">
              {index > 0 && (
                <span className="ui-breadcrumbs-separator" aria-hidden="true">
                  {separatorMark}
                </span>
              )}
              {step === 'more' ? (
                <Tooltip content="Show the full path">
                  <button
                    type="button"
                    className="ui-breadcrumbs-more"
                    aria-label="Show the full path"
                    onClick={() => {
                      revealFocus.current = true;
                      setExpanded(true);
                    }}
                  >
                    …
                  </button>
                </Tooltip>
              ) : (
                <Step item={step} current={index === shown.length - 1} onNavigate={onNavigate} />
              )}
            </li>
          ))}
        </ol>
      </Container>
    </>
  );
}

function Step({
  item,
  current,
  onNavigate,
}: {
  item: BreadcrumbsItem;
  current: boolean;
  onNavigate?: (href: string) => void;
}) {
  const content = (
    <>
      {item.icon && <Icon name={item.icon} size={ICON_SIZE} />}
      {item.iconOnly ? <span className="ui-breadcrumbs-hidden">{item.label}</span> : <Label text={item.label} />}
    </>
  );

  if (current) {
    return (
      <span className="ui-breadcrumbs-current" aria-current="page">
        {content}
      </span>
    );
  }
  if (!item.href) return <span className="ui-breadcrumbs-text">{content}</span>;

  const href = item.href;
  const link = (
    <a
      href={href}
      className="ui-breadcrumbs-link"
      onClick={(event) => {
        if (onNavigate && isPlainClick(event)) {
          event.preventDefault();
          onNavigate(href);
        }
      }}
    >
      {content}
    </a>
  );
  return item.iconOnly ? <Tooltip content={item.label}>{link}</Tooltip> : link;
}

/** A label cut short past 200px, showing the whole of it in a tooltip only when it's actually cut. */
function Label({ text }: { text: string }) {
  const span = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);
  const isCut = () => Boolean(span.current && span.current.scrollWidth > span.current.clientWidth);

  return (
    <Tooltip content={text} open={open} onOpenChange={(next) => setOpen(next && isCut())}>
      <span ref={span} className="ui-breadcrumbs-label">
        {text}
      </span>
    </Tooltip>
  );
}

