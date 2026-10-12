import { useLayoutEffect, useRef, useState, type CSSProperties, type MouseEvent, type ReactNode } from 'react';
import type { NavbarLogo, SolidColorValue } from '@inithium/shared-contracts';
import { Button, Container, Icon, Tooltip, toCssColor, type IconName } from '@inithium/shared-ui-components';
import { Drawer, isCurrentPath, Navbar, type NavbarUser } from '@inithium/shared-ui-composites';
import { sidebarLayoutStyleSheet } from './sidebar-layout.styles';

/** Below this width the sidebar moves into a drawer behind a menu button (the lg breakpoint). */
const NARROW_WIDTH = 1024;

/** An entry in the sidebar. With `exact`, it's current only at its own address, not the ones under it (e.g. a dashboard at the app's root). */
export type SidebarItem = { label: string; href: string; icon: IconName; exact?: boolean };

export type SidebarLayoutProps = {
  /** The app's title, in the top bar. */
  title: string;
  /** A logo beside the title. */
  logo?: NavbarLogo;
  /** The sidebar's entries, in order. */
  items: SidebarItem[];
  /** The current address, so its entry is marked. */
  currentPath?: string;
  /** Takes plain left clicks on entries and the title, e.g. the app router's navigate. Default: the browser loads the page. */
  onNavigate?: (href: string) => void;
  /** The signed-in user, shown in the top bar with an account menu. */
  user?: NavbarUser;
  onLogout?: () => void;
  /** Where the title goes. Default '/'. */
  homeHref?: string;
  /** Starts with the sidebar collapsed to icons. Default false. */
  defaultCollapsed?: boolean;
  /** The current entry, hover and focus. Default 'primary'. */
  color?: SolidColorValue;
  /** The screen's content. */
  children?: ReactNode;
};

/** A plain left click, with no key held: the only kind handed to onNavigate. */
const isPlainClick = (event: MouseEvent) =>
  event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;

/**
 * An app frame with a top bar and a sidebar (decision 0086), for the CMS: the title and account menu across the
 * top, the entries down the left (collapsible to icons), and the content beside them. Below 1024px of its own
 * width the entries move into a drawer behind a menu button.
 */
export function SidebarLayout({
  title,
  logo,
  items,
  currentPath,
  onNavigate,
  user,
  onLogout,
  homeHref = '/',
  defaultCollapsed = false,
  color = 'primary',
  children,
}: SidebarLayoutProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [menuOpen, setMenuOpen] = useState(false);

  // The layout measures itself, so it collapses by its own width (the screen's, when it's full width).
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

  const accent = { '--ui-sidebar-accent': toCssColor(color) } as CSSProperties;

  const link = (item: SidebarItem, compact: boolean, onPick?: () => void) => {
    const anchor = (
      <a
        className="ui-sidebar-link"
        href={item.href}
        aria-current={(item.exact ? item.href === currentPath : isCurrentPath(item.href, currentPath)) ? 'page' : undefined}
        aria-label={compact ? item.label : undefined}
        onClick={(event) => {
          if (!isPlainClick(event)) return;
          onPick?.();
          if (!onNavigate) return;
          event.preventDefault();
          onNavigate(item.href);
        }}
      >
        <Icon name={item.icon} size={20} />
        <span className="ui-sidebar-label">{item.label}</span>
      </a>
    );
    return (
      <li key={item.href}>
        {compact ? (
          <Tooltip content={item.label} side="right">
            {anchor}
          </Tooltip>
        ) : (
          anchor
        )}
      </li>
    );
  };

  return (
    <>
      {/* React hoists this to <head> and keeps one copy. */}
      <style href="inithium-sidebar-layout" precedence="default">
        {sidebarLayoutStyleSheet}
      </style>
      <Container ref={root} minHeight="screen" flex={{ direction: 'column' }} bgColor={{ color: 'surface', intensity: 100 }}>
        <Navbar
          title={title}
          logo={logo}
          homeHref={homeHref}
          user={user}
          onLogout={onLogout}
          currentPath={currentPath}
          onNavigate={onNavigate}
          color={color}
          ancillary={
            narrow ? (
              <Button
                variant="ghost"
                color={{ color: 'surface', intensity: 800 }}
                leadingIcon="menu"
                aria-label="Open navigation"
                aria-haspopup="dialog"
                aria-expanded={menuOpen}
                padding={{ x: 6 }}
                onClick={() => setMenuOpen(true)}
              />
            ) : undefined
          }
        />
        <Container flex={{ direction: 'row' }} flexItem={{ grow: 1 }}>
          {!narrow && (
            <nav className="ui-sidebar" aria-label="Sections" data-collapsed={collapsed || undefined} style={accent}>
              <ul className="ui-sidebar-list">{items.map((item) => link(item, collapsed))}</ul>
              {collapsed ? (
                <Tooltip content="Expand" side="right">
                  <button type="button" className="ui-sidebar-link" aria-label="Expand sidebar" onClick={() => setCollapsed(false)}>
                    <Icon name="panel-left-open" size={20} />
                  </button>
                </Tooltip>
              ) : (
                <button type="button" className="ui-sidebar-link" onClick={() => setCollapsed(true)}>
                  <Icon name="panel-left-close" size={20} />
                  <span className="ui-sidebar-label">Collapse</span>
                </button>
              )}
            </nav>
          )}
          <Container as="main" flexItem={{ grow: 1 }} minWidth={0} padding={{ x: narrow ? 16 : 32, y: 32 }}>
            {children}
          </Container>
        </Container>
      </Container>
      {narrow && (
        <Drawer open={menuOpen} onOpenChange={setMenuOpen} title={title} side="left" size={280}>
          <nav aria-label="Sections" style={accent}>
            <ul className="ui-sidebar-list">{items.map((item) => link(item, false, () => setMenuOpen(false)))}</ul>
          </nav>
        </Drawer>
      )}
    </>
  );
}
