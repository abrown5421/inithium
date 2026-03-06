import React, { useState, useCallback, useEffect } from 'react';
import { AvatarButtonProps, DrawerProps, NavbarProps } from './navbar.types.js';
import { Menu, MenuButton, MenuItems, MenuItem, Button } from '@inithium/ui';
import { useIsAtLeast } from '@inithium/shared';

function NavIcon({ open }: { open: boolean }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
      className="h-5 w-5" aria-hidden="true">
      {open ? (
        <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>
      ) : (
        <><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>
      )}
    </svg>
  );
}

function useActivePath() {
  const [path, setPath] = useState(() =>
    typeof window !== 'undefined' ? window.location.pathname : ''
  );
  useEffect(() => {
    const handler = () => setPath(window.location.pathname);
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, []);
  return path;
}

function isActive(href: string | undefined, currentPath: string) {
  return !!href && (currentPath === href || currentPath.startsWith(href + '/'));
}

function navigate(href?: string, onClose?: () => void) {
  if (href && typeof window !== 'undefined') window.location.href = href;
  onClose?.();
}

function DrawerLinks({
  links,
  onClose,
  currentPath,
  bordered,
}: {
  links: DrawerProps['links'];
  onClose: () => void;
  currentPath: string;
  bordered?: boolean;
}) {
  return (
    <ul
      className={`space-y-1 ${bordered ? 'border-t border-gray-200 mt-5 pt-5' : ''}`}
      role="list"
    >
      {links.map((link) =>
        link.dropdown ? (
          <li key={link.label}>
            <p className="px-3 pb-1 pt-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {link.label}
            </p>
            <ul className="space-y-1" role="list">
              {link.dropdown.map((item) => (
                <li key={item.label}>
                  <button
                    type="button"
                    className={`block w-full rounded px-3 py-2 ml-3 text-left text-sm transition-colors hover:bg-muted
                      ${isActive(item.href, currentPath) ? 'text-primary font-semibold' : 'text-foreground'}`}
                    onClick={() =>
                      item.onClick ? (item.onClick(), onClose()) : navigate(item.href, onClose)
                    }
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </li>
        ) : (
          <li key={link.label}>
            <button
              type="button"
              className={`block w-full rounded px-3 py-2 text-left text-sm font-medium transition-colors hover:bg-muted
                ${isActive(link.href, currentPath) ? 'text-primary' : 'text-foreground'}`}
              onClick={() => navigate(link.href, onClose)}
            >
              {link.label}
            </button>
          </li>
        )
      )}
    </ul>
  );
}

function Drawer({ open, onClose, links, secondaryLinks, user, onLogout }: DrawerProps) {
  const includeLinks = !useIsAtLeast('lg');
  const currentPath = useActivePath();

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <>
      <div
        aria-hidden="true"
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm transition-opacity duration-300
          ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={`fixed inset-y-0 right-0 z-50 flex h-full w-72 flex-col bg-background shadow-xl
          transition-transform duration-300 ease-in-out ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <span className="text-sm font-semibold text-foreground">{user?.name ?? 'Menu'}</span>
          <Button variant="ghost" size="sm" onClick={onClose} className="p-1">
            <NavIcon open />
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {includeLinks && (
            <DrawerLinks links={links} onClose={onClose} currentPath={currentPath} />
          )}
          {secondaryLinks?.length ? (
            <DrawerLinks
              links={secondaryLinks}
              onClose={onClose}
              currentPath={currentPath}
              bordered={includeLinks}
            />
          ) : null}
        </nav>

        {user && onLogout && (
          <div className="border-t border-border px-3 py-4">
            <Button variant="destructive" className="w-full" onClick={() => { onLogout(); onClose(); }}>
              Log out
            </Button>
          </div>
        )}
      </div>
    </>
  );
}

function AvatarButton({ user, onClick }: AvatarButtonProps) {
  const initials = user.name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase();
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Open menu for ${user.name}`}
      className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full ring-2 ring-primary/30 transition hover:ring-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      {user.avatarUrl ? (
        <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
      ) : (
        <span className="flex h-full w-full items-center justify-center bg-primary text-xs font-semibold text-primary-foreground">
          {initials}
        </span>
      )}
    </button>
  );
}

export const Navbar: React.FC<NavbarProps> = ({ logoSrc, logoText, links, secondaryLinks, user, onLogout }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);
  const currentPath = useActivePath();

  return (
    <>
      <nav className="w-full bg-background shadow-sm">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            {logoSrc && <img src={logoSrc} alt={logoText ?? 'Logo'} className="h-7 w-auto object-contain" />}
            {logoText && <span className="text-base font-semibold text-foreground">{logoText}</span>}
          </div>

          <div className="flex items-center gap-1">
            <div className="hidden items-center gap-1 lg:flex">
              {links.map((link) =>
                link.dropdown ? (
                  <div key={link.label} className="relative self-stretch flex items-center">
                    <Menu>
                      <MenuButton>{link.label}</MenuButton>
                      <MenuItems className="!fixed">
                        {link.dropdown.map((item) => (
                          <MenuItem
                            key={item.label}
                            onClick={item.onClick ?? (item.href ? () => { window.location.href = item.href!; } : undefined)}
                          >
                            <span className={isActive(item.href, currentPath) ? 'text-primary font-semibold' : ''}>
                              {item.label}
                            </span>
                          </MenuItem>
                        ))}
                      </MenuItems>
                    </Menu>
                  </div>
                ) : (
                  <Button
                    key={link.label}
                    variant="ghost"
                    className={isActive(link.href, currentPath) ? 'text-primary font-semibold' : ''}
                    onClick={link.href ? () => { window.location.href = link.href!; } : undefined}
                  >
                    {link.label}
                  </Button>
                )
              )}
            </div>

            <div className="ml-2">
              {user ? (
                <AvatarButton user={user} onClick={openDrawer} />
              ) : (
                <div className="lg:hidden">
                  <Button variant="ghost" size="sm" onClick={openDrawer} aria-label="Open navigation menu" className="p-1.5">
                    <NavIcon open={false} />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <Drawer open={drawerOpen} onClose={closeDrawer} links={links} secondaryLinks={secondaryLinks} user={user} onLogout={onLogout} />
    </>
  );
};