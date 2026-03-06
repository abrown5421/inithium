import React, { useState, useCallback, useEffect } from 'react';
import { AvatarButtonProps, DrawerProps, NavbarProps } from './navbar.types.js';
import {
  Menu,
  MenuButton,
  MenuItems,
  MenuItem,
  Button,
} from '@inithium/ui';

function HamburgerIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function Drawer({ open, onClose, links, user, onLogout }: DrawerProps) {
  const navigate = (href?: string) => {
    if (href && typeof window !== 'undefined') {
      window.location.href = href;
    }
    onClose();
  };

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
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
        className={[
          'fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm',
          'transition-opacity duration-300',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        ].join(' ')}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={[
          'fixed inset-y-0 right-0 z-50 flex h-full w-72 flex-col bg-surface shadow-xl',
          'transition-transform duration-300 ease-in-out',
          open ? 'translate-x-0' : 'translate-x-full',
        ].join(' ')}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <span className="text-sm font-semibold text-foreground">
            {user ? user.name : 'Menu'}
          </span>
          <Button variant="ghost" size="sm" onClick={onClose} className="p-1">
            <CloseIcon className="h-4 w-4" />
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1" role="list">
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
                          className="block w-full rounded px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-muted"
                          onClick={() => {
                            if (item.onClick) {
                              item.onClick();
                              onClose();
                            } else {
                              navigate(item.href);
                            }
                          }}
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
                    className="block w-full rounded px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted"
                    onClick={() => navigate(link.href)}
                  >
                    {link.label}
                  </button>
                </li>
              )
            )}
          </ul>
        </nav>

        {user && onLogout && (
          <div className="border-t border-border px-3 py-4">
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => {
                onLogout();
                onClose();
              }}
            >
              Log out
            </Button>
          </div>
        )}
      </div>
    </>
  );
}

function AvatarButton({ user, onClick }: AvatarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Open menu for ${user.name}`}
      className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full ring-2 ring-primary/30 transition hover:ring-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      {user.avatarUrl ? (
        <img
          src={user.avatarUrl}
          alt={user.name}
          className="h-full w-full object-cover"
        />
      ) : (
        <span className="flex h-full w-full items-center justify-center bg-primary text-xs font-semibold text-primary-foreground">
          {user.name
            .split(' ')
            .slice(0, 2)
            .map((n) => n[0])
            .join('')
            .toUpperCase()}
        </span>
      )}
    </button>
  );
}

export const Navbar: React.FC<NavbarProps> = ({
  logoSrc,
  logoText,
  links,
  user,
  onLogout,
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  return (
    <>
      <nav className="w-full bg-surface shadow-sm">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            {logoSrc && (
              <img
                src={logoSrc}
                alt={logoText ?? 'Logo'}
                className="h-7 w-auto object-contain"
              />
            )}
            {logoText && (
              <span className="text-base font-semibold text-foreground">
                {logoText}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <div className="hidden items-center gap-1 lg:flex">
              {links.map((link) =>
                link.dropdown ? (
                  <div
                    key={link.label}
                    className="relative self-stretch flex items-center"
                  >
                    <Menu>
                      <MenuButton>{link.label}</MenuButton>
                      <MenuItems className="!fixed">
                        {link.dropdown.map((item) => (
                          <MenuItem
                            key={item.label}
                            onClick={
                              item.onClick ??
                              (item.href
                                ? () => {
                                    if (typeof window !== 'undefined') {
                                      window.location.href = item.href!;
                                    }
                                  }
                                : undefined)
                            }
                          >
                            {item.label}
                          </MenuItem>
                        ))}
                      </MenuItems>
                    </Menu>
                  </div>
                ) : (
                  <Button
                    key={link.label}
                    variant="ghost"
                    onClick={
                      link.href
                        ? () => {
                            if (typeof window !== 'undefined') {
                              window.location.href = link.href!;
                            }
                          }
                        : undefined
                    }
                  >
                    {link.label}
                  </Button>
                )
              )}
            </div>

            {user ? (
              <div className="ml-2">
                <AvatarButton user={user} onClick={openDrawer} />
              </div>
            ) : (
              <div className="ml-2 lg:hidden">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={openDrawer}
                  aria-label="Open navigation menu"
                  className="p-1.5"
                >
                  <HamburgerIcon className="h-5 w-5" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <Drawer
        open={drawerOpen}
        onClose={closeDrawer}
        links={links}
        user={user}
        onLogout={onLogout}
      />
    </>
  );
};