import React from 'react';
import { NavbarProps } from './navbar.types.js';
import {
  Menu,
  MenuButton,
  MenuItems,
  MenuItem,
  Button,
} from '@inithium/ui';
import { cn } from '@inithium/theme';

export const Navbar: React.FC<NavbarProps> = ({ links, user, onLogout }) => {
  return (
    <nav className="w-full bg-primary p-4 flex justify-between items-center">
      <div className="flex items-center space-x-1">
        {links.map((link) =>
          link.dropdown ? (
            <Menu key={link.label}>
              <MenuButton>{link.label}</MenuButton>
              <MenuItems>
                {link.dropdown.map((item) => (
                  <MenuItem
                    key={item.label}
                    onClick={item.onClick ?? (item.href ? () => {
                      if (typeof window !== "undefined") {
                        window.location.href = item.href!;
                      }
                    } : undefined)}
                  >
                    {item.label}
                  </MenuItem>
                ))}
              </MenuItems>
            </Menu>
          ) : (
            <a
              key={link.label}
              href={link.href}
              className={cn(
                'px-3 py-2 rounded-md text-sm font-medium',
                'text-primary-foreground hover:text-accent-foreground',
                'hover:bg-primary/80 transition-colors',
              )}
            >
              {link.label}
            </a>
          )
        )}
      </div>

      {user && (
        <div className="flex items-center space-x-3">
          {user.avatarUrl && (
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-primary-foreground/30"
            />
          )}
          <span className="text-sm font-medium text-primary-foreground">
            {user.name}
          </span>
          <Button variant="ghost" size="sm" onClick={onLogout}>
            Logout
          </Button>
        </div>
      )}
    </nav>
  );
};