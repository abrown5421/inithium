import React, { useEffect } from "react";
import { Dialog, DialogPanel, DialogBackdrop } from "@headlessui/react";
import { PageRegistryEntry, ProfileLink, NavItemGroup } from "./navbar.types";
import { Icon } from "../../components/icon";
import { Button } from "../../components/button";
import { usePageTransition, useLogoutMutation } from "@inithium/store";
import { Box } from "../../components/box";

interface NavSlideoutProps {
  open: boolean;
  onClose: () => void;
  isAuthenticated: boolean;
  pages: PageRegistryEntry[];
  onNavigate?: (path: string) => void;
  profileLinks?: ProfileLink[];
}

const isGroup = (item: PageRegistryEntry): item is NavItemGroup =>
  item.type === "group";

const flattenNavPages = (pages: PageRegistryEntry[]) => {
  const result: { path: string; label: string }[] = [];
  for (const page of pages) {
    if (page.showInNav === false) continue;
    if (isGroup(page)) {
      for (const child of page.children) {
        if (child.showInNav !== false) {
          result.push({ path: child.path, label: `${page.label} / ${child.label}` });
        }
      }
    } else {
      result.push({ path: page.path, label: page.label });
    }
  }
  return result;
};

const SlideoutLink: React.FC<{
  path: string;
  label: string;
  onClose: () => void;
  onNavigate?: (path: string) => void;
}> = ({ path, label, onClose, onNavigate }) => {
  const { controller } = usePageTransition();

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    onClose();
    await controller.triggerExit();
    onNavigate?.(path);
  };

  return (
    <a
      href={path}
      onClick={handleClick}
      className="block rounded-md px-3 py-2 text-sm font-medium text-on-surface hover:bg-surface3 transition-colors"
    >
      {label}
    </a>
  );
};

export const NavSlideout: React.FC<NavSlideoutProps> = ({
  open,
  onClose,
  isAuthenticated,
  pages,
  onNavigate,
  profileLinks = [],
}) => {
  const flatNav = flattenNavPages(pages);
  const [logout] = useLogoutMutation();

  const handleLogout = async () => {
    onClose();
    try {
      await logout().unwrap();
    } catch (error) {
      // Functional error handling: the state clears on success via extraReducers
      // Failures can be handled here if logging/toast is required
    }
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <DialogBackdrop
        transition
        className="fixed inset-0 backdrop-blur-sm bg-black/30 transition-opacity duration-300 data-[closed]:opacity-0"
      />
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full">
            <DialogPanel
              transition
              className="pointer-events-auto w-screen max-w-xs transform transition duration-300 ease-in-out data-[closed]:translate-x-full"
            >
              <div className="flex h-full flex-col overflow-y-auto bg-surface2 shadow-xl">
                <div className="flex items-center justify-between px-4 py-3 border-b border-surface3">
                  <span className="text-sm font-semibold text-on-surface">
                    {isAuthenticated ? "Menu" : "Navigation"}
                  </span>
                  <button
                    onClick={onClose}
                    className="rounded-md p-1.5 text-on-surface-muted hover:text-on-surface hover:bg-surface3 transition-colors"
                    aria-label="Close menu"
                  >
                    <Icon name="XMarkIcon" iconStyle="solid-24" size="sm" aria-hidden />
                  </button>
                </div>

                <div className="flex-1 px-4 py-4 space-y-6">
                  {isAuthenticated && profileLinks.length > 0 && (
                    <section>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-on-surface-muted">
                        Account
                      </p>
                      <ul className="space-y-1">
                        {profileLinks.map((link) => (
                          <li key={link.path}>
                            <SlideoutLink
                              path={link.path}
                              label={link.label}
                              onClose={onClose}
                              onNavigate={onNavigate}
                            />
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}

                  {flatNav.length > 0 && (
                    <section>
                      <p className="mb-2 text-xs font-semibond uppercase tracking-widest text-on-surface-muted">
                        Pages
                      </p>
                      <ul className="space-y-1">
                        {flatNav.map((page) => (
                          <li key={page.path}>
                            <SlideoutLink
                              path={page.path}
                              label={page.label}
                              onClose={onClose}
                              onNavigate={onNavigate}
                            />
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}
                </div>

                {isAuthenticated && (
                  <Box m="4">
                    <Button
                      className="w-full"
                      color="danger"
                      onClick={handleLogout}
                    >
                      Logout
                    </Button>
                  </Box>
                )}
              </div>
            </DialogPanel>
          </div>
        </div>
      </div>
    </Dialog>
  );
};