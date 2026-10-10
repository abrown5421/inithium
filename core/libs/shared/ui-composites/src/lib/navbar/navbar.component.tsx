import { useId, useLayoutEffect, useRef, useState, type CSSProperties, type MouseEvent, type ReactNode } from 'react';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import type { AvatarRecipe, NavGroup, NavItem, NavLink, NavbarSerializableProps } from '@inithium/shared-contracts';
import { Button, Container, Divider, Icon, toCssColor, type AnimationRuntimeProps, type IconName } from '@inithium/shared-ui-components';
import { Avatar } from '../avatar/avatar.component';
import { Drawer } from '../drawer/drawer.component';
import { navbarStyleSheet } from './navbar.styles';

/** Breakpoint widths in px, matching the style props' breakpoints (16px rems). */
const BREAKPOINT_WIDTHS = { sm: 640, md: 768, lg: 1024, xl: 1280, '2xl': 1536 } as const;
const JUSTIFY = { start: 'flex-start', center: 'center', end: 'flex-end' } as const;

/** The signed-in user, as the app knows them from GET /api/auth/me. */
export type NavbarUser = {
  name: string;
  /** Their avatar's recipe. Default: initials from the name. */
  avatar?: AvatarRecipe;
};

export type NavbarProps = NavbarSerializableProps &
  AnimationRuntimeProps & {
    /** The signed-in user. With it, the bar shows their avatar; without it, Login. */
    user?: NavbarUser;
    /** The current address, so its link is marked, e.g. location.pathname. */
    currentPath?: string;
    /** Takes plain left clicks on links, e.g. the app router's navigate. Default: the browser loads the page. */
    onNavigate?: (href: string) => void;
    /** Called by the drawer's Logout button. */
    onLogout?: () => void;
    /** Plugin and app extras before the user section, e.g. a cart or notifications icon button. */
    ancillary?: ReactNode;
  };

const isGroup = (item: NavItem): item is NavGroup => 'children' in item;

/** A plain left click, with no key held: the only kind handed to onNavigate. */
const isPlainClick = (event: MouseEvent) =>
  event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;

/** Whether a link is the current page: its own path or anything under it ('/' matches only itself). */
export function isCurrentPath(href: string, currentPath?: string) {
  if (!currentPath) return false;
  if (href === '/') return currentPath === '/';
  return currentPath === href || currentPath.startsWith(href.endsWith('/') ? href : `${href}/`);
}

/**
 * The application's main navigation (decision 0076): a full-width bar with a brand (logo and title), the page
 * links (groups open dropdowns), plugin extras and the user section. Below `collapseAt` the page links move into
 * a drawer. Signed in, the avatar opens the drawer with the user's links and Logout; signed out, Login sits in the
 * bar (or in the drawer behind a menu button on narrow screens). Links are real links; plain clicks go to
 * `onNavigate` so the app's router can follow them.
 */
export function Navbar({
  title,
  logo,
  homeHref = '/',
  loginHref = '/login',
  links = [],
  userLinks = [],
  collapseAt = 'lg',
  sticky = true,
  linksAlign = 'end',
  color = 'primary',
  bgColor = { color: 'surface', intensity: 50 },
  user,
  currentPath,
  onNavigate,
  onLogout,
  ancillary,
  margin,
  padding = { x: 24 },
  animation,
  show,
  replay,
  onEntranceEnd,
  onExitEnd,
}: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = useId();

  // The bar measures itself, so it collapses by its own width (the screen's, when it's full width).
  const root = useRef<HTMLElement>(null);
  const [wide, setWide] = useState(true);
  useLayoutEffect(() => {
    const element = root.current;
    if (!element) return;
    const measure = () => setWide(element.getBoundingClientRect().width >= BREAKPOINT_WIDTHS[collapseAt]);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [collapseAt]);

  const go = (href: string) => (onNavigate ? onNavigate(href) : window.location.assign(href));
  const follow = (href: string, then?: () => void) => (event: MouseEvent) => {
    if (!onNavigate || !isPlainClick(event)) return;
    event.preventDefault();
    then?.();
    onNavigate(href);
  };
  const logout = () => {
    setMenuOpen(false);
    onLogout?.();
  };
  const closeAndGo = (href: string) => {
    setMenuOpen(false);
    go(href);
  };

  const label = (text: string, icon?: IconName) => (
    <>
      {icon && <Icon name={icon} size={18} />}
      {text}
    </>
  );

  // A link in the bar or its dropdowns; Radix marks the current one with aria-current.
  const barLink = (link: NavLink) => (
    <NavigationMenu.Link asChild active={isCurrentPath(link.href, currentPath)}>
      <a className="ui-navbar-link" href={link.href} onClick={follow(link.href)}>
        {label(link.label, link.icon as IconName | undefined)}
      </a>
    </NavigationMenu.Link>
  );

  // A link in the drawer, which closes it.
  const menuLink = (link: NavLink) => (
    <li key={link.href}>
      <a
        className="ui-navbar-link"
        href={link.href}
        aria-current={isCurrentPath(link.href, currentPath) ? 'page' : undefined}
        onClick={follow(link.href, () => setMenuOpen(false))}
      >
        {label(link.label, link.icon as IconName | undefined)}
      </a>
    </li>
  );
  const menuItems = (items: NavItem[]) =>
    items.map((item, index) =>
      isGroup(item) ? (
        <li key={`group-${item.label}`}>
          <div className="ui-navbar-menu-heading" id={`${menuId}-${index}`}>
            {item.label}
          </div>
          <ul className="ui-navbar-menu ui-navbar-menu-group" aria-labelledby={`${menuId}-${index}`}>
            {item.children.map(menuLink)}
          </ul>
        </li>
      ) : (
        menuLink(item)
      ),
    );

  const style = {
    '--ui-navbar-accent': toCssColor(color),
    '--ui-navbar-justify': JUSTIFY[linksAlign],
  } as CSSProperties;

  const showLinksInBar = wide && links.length > 0;
  const pageLinksInMenu = !wide && links.length > 0;
  const menuLinks = (
    // The drawer renders in a portal, so it carries the accent colour itself.
    <nav aria-label={user ? 'Account and pages' : 'Pages'} style={style}>
      {pageLinksInMenu && <ul className="ui-navbar-menu">{menuItems(links)}</ul>}
      {pageLinksInMenu && user && userLinks.length > 0 && <Divider margin={{ y: 12 }} />}
      {user && userLinks.length > 0 && <ul className="ui-navbar-menu">{menuItems(userLinks)}</ul>}
    </nav>
  );
  const hasMenu = Boolean(user) || !wide;

  return (
    <>
      {/* React hoists this to <head> and keeps one copy however many render. */}
      <style href="inithium-navbar" precedence="default">
        {navbarStyleSheet}
      </style>
      <Container
        as="header"
        ref={root}
        width="full"
        position={sticky ? { type: 'sticky', top: 0, z: 30 } : { type: 'relative', z: 30 }}
        bgColor={bgColor}
        borderWidth={{ bottom: 1 }}
        borderColor={{ color: 'surface', intensity: 500, opacity: 40 }}
        margin={margin}
        padding={padding}
        animation={animation}
        show={show}
        replay={replay}
        onEntranceEnd={onEntranceEnd}
        onExitEnd={onExitEnd}
      >
        <div className="ui-navbar-row" style={style}>
          {(logo || title) && (
            <a className="ui-navbar-brand" href={homeHref} onClick={follow(homeHref)} aria-label={title ? undefined : logo?.alt || 'Home'}>
              {logo && <img src={logo.src} alt={title ? '' : logo.alt} />}
              {title && <span className="ui-navbar-title">{title}</span>}
            </a>
          )}

          {showLinksInBar ? (
            <NavigationMenu.Root className="ui-navbar-links" aria-label="Main">
              <NavigationMenu.List className="ui-navbar-list">
                {links.map((item) =>
                  isGroup(item) ? (
                    <NavigationMenu.Item key={`group-${item.label}`} className="ui-navbar-item">
                      <NavigationMenu.Trigger
                        className="ui-navbar-link"
                        data-current={item.children.some((child) => isCurrentPath(child.href, currentPath)) || undefined}
                      >
                        {label(item.label, item.icon as IconName | undefined)}
                        <span className="ui-navbar-chevron" aria-hidden="true">
                          <Icon name="chevron-down" size={16} />
                        </span>
                      </NavigationMenu.Trigger>
                      <NavigationMenu.Content className="ui-navbar-dropdown">
                        <ul className="ui-navbar-list">
                          {item.children.map((child) => (
                            <li key={child.href}>{barLink(child)}</li>
                          ))}
                        </ul>
                      </NavigationMenu.Content>
                    </NavigationMenu.Item>
                  ) : (
                    <NavigationMenu.Item key={item.href}>{barLink(item)}</NavigationMenu.Item>
                  ),
                )}
              </NavigationMenu.List>
            </NavigationMenu.Root>
          ) : (
            <div className="ui-navbar-spacer" />
          )}

          <div className="ui-navbar-end">
            {ancillary}
            {user ? (
              <button
                type="button"
                className="ui-navbar-account"
                aria-label={`${user.name}: account menu`}
                aria-haspopup="dialog"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen(true)}
              >
                <Avatar width={36} height={36} name={user.name} value={user.avatar ?? { style: 'initials', seed: user.name }} />
              </button>
            ) : wide ? (
              <Button color={color} onClick={() => go(loginHref)}>
                Login
              </Button>
            ) : (
              <Button
                variant="ghost"
                color={{ color: 'surface', intensity: 800 }}
                leadingIcon="menu"
                aria-label="Open menu"
                aria-haspopup="dialog"
                aria-expanded={menuOpen}
                padding={{ x: 6 }}
                onClick={() => setMenuOpen(true)}
              />
            )}
          </div>
        </div>
      </Container>

      {hasMenu && (
        <Drawer
          open={menuOpen}
          onOpenChange={setMenuOpen}
          title="Menu"
          side="right"
          size={360}
          footer={
            user ? (
              <Button width="full" color="red" onClick={logout}>
                Logout
              </Button>
            ) : (
              <Button width="full" color={color} onClick={() => closeAndGo(loginHref)}>
                Login
              </Button>
            )
          }
        >
          {menuLinks}
        </Drawer>
      )}
    </>
  );
}
