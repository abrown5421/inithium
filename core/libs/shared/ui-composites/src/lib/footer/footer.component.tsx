import { useLayoutEffect, useRef, useState, type CSSProperties, type MouseEvent } from 'react';
import type { FooterSerializableProps, NavItem, NavLink } from '@inithium/shared-contracts';
import { Container, toCssColor, type AnimationRuntimeProps } from '@inithium/shared-ui-components';
import { isCurrentPath } from '../navbar/navbar.component';
import { footerStyleSheet } from './footer.styles';

/** Below this width (sm), the rows stack into columns. */
const NARROW_WIDTH = 640;

export type FooterProps = FooterSerializableProps &
  AnimationRuntimeProps & {
    /** The current address, so its link is marked, e.g. location.pathname. */
    currentPath?: string;
    /** Takes plain left clicks on links, e.g. the app router's navigate. Default: the browser loads the page. */
    onNavigate?: (href: string) => void;
  };

/** Groups give their links in order: a footer has no dropdowns. */
const flatten = (items: NavItem[]): NavLink[] => items.flatMap((item) => ('children' in item ? item.children : [item]));

/** A plain left click, with no key held: the only kind handed to onNavigate. */
const isPlainClick = (event: MouseEvent) =>
  event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;

/** '© 2026 Holder. All rights reserved.', or '© 2024–2026 …' with a start year. The year is always the current one. */
export function copyrightText(holder: string, startYear?: number, year = new Date().getFullYear()) {
  const years = startYear && startYear < year ? `${startYear}–${year}` : String(year);
  return `© ${years} ${holder}. All rights reserved.`;
}

/**
 * The site's footer (decision 0077): a row of main links over a smaller row with the copyright (its year kept
 * current) and secondary links. Links are real links; plain clicks go to `onNavigate`. Narrow footers stack.
 */
export function Footer({
  links = [],
  secondaryLinks = [],
  copyright,
  copyrightStartYear,
  align = 'start',
  color = 'primary',
  bgColor = { color: 'surface', intensity: 50 },
  currentPath,
  onNavigate,
  margin,
  padding = { x: 24, y: 32 },
  animation,
  show,
  replay,
  onEntranceEnd,
  onExitEnd,
}: FooterProps) {
  // The footer measures itself, so it stacks by its own width (the screen's, when it's full width).
  const root = useRef<HTMLElement>(null);
  const [narrow, setNarrow] = useState(false);
  useLayoutEffect(() => {
    const element = root.current;
    if (!element) return;
    const measure = () => setNarrow(element.getBoundingClientRect().width < NARROW_WIDTH);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const link = (item: NavLink) => (
    <li key={item.href}>
      <a
        className="ui-footer-link"
        href={item.href}
        aria-current={isCurrentPath(item.href, currentPath) ? 'page' : undefined}
        onClick={(event) => {
          if (!onNavigate || !isPlainClick(event)) return;
          event.preventDefault();
          onNavigate(item.href);
        }}
      >
        {item.label}
      </a>
    </li>
  );

  const mainLinks = flatten(links);
  const hasSecondary = Boolean(copyright) || secondaryLinks.length > 0;

  return (
    <>
      {/* React hoists this to <head> and keeps one copy however many render. */}
      <style href="inithium-footer" precedence="default">
        {footerStyleSheet}
      </style>
      <Container
        as="footer"
        ref={root}
        width="full"
        bgColor={bgColor}
        borderWidth={{ top: 1 }}
        borderColor={{ color: 'surface', intensity: 500, opacity: 40 }}
        margin={margin}
        padding={padding}
        animation={animation}
        show={show}
        replay={replay}
        onEntranceEnd={onEntranceEnd}
        onExitEnd={onExitEnd}
      >
        <div
          className="ui-footer"
          data-align={align}
          data-narrow={narrow || undefined}
          style={{ '--ui-footer-accent': toCssColor(color) } as CSSProperties}
        >
          {mainLinks.length > 0 && (
            <nav aria-label="Footer">
              <ul className="ui-footer-links">{mainLinks.map(link)}</ul>
            </nav>
          )}
          {hasSecondary && (
            <div className="ui-footer-secondary">
              {copyright && <p className="ui-footer-copyright">{copyrightText(copyright, copyrightStartYear)}</p>}
              {secondaryLinks.length > 0 && (
                <nav aria-label="More links">
                  <ul className="ui-footer-more" data-after-copyright={copyright ? '' : undefined}>
                    {secondaryLinks.map(link)}
                  </ul>
                </nav>
              )}
            </div>
          )}
        </div>
      </Container>
    </>
  );
}
