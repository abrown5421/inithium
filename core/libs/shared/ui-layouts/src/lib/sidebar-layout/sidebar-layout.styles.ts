/**
 * SidebarLayout's fixed CSS (decision 0086): a sticky sidebar under the Navbar, its links (icon and label, the
 * current one tinted), the collapsed icons-only state, and the round button that opens the drawer on narrow screens
 * (0123). --ui-sidebar-accent is the current link's colour.
 */
export const sidebarLayoutStyleSheet = `
.ui-sidebar {
  position: sticky; top: var(--ui-navbar-height, 65px); align-self: flex-start; flex-shrink: 0;
  display: flex; flex-direction: column; gap: 4px; width: 240px; height: calc(100dvh - var(--ui-navbar-height, 65px));
  padding: 16px 12px; overflow-y: auto; box-sizing: border-box;
  background: var(--color-surface-50); border-right: 1px solid color-mix(in oklab, var(--color-surface-500) 40%, transparent);
  transition: width 150ms ease;
}
.ui-sidebar[data-collapsed] { width: 64px; }
.ui-sidebar-list { display: flex; flex-direction: column; gap: 2px; margin: 0; padding: 0; list-style: none; flex: 1; }
.ui-sidebar-link {
  display: flex; align-items: center; gap: 12px; height: 40px; padding: 0 10px; border: 0; border-radius: 6px; width: 100%;
  box-sizing: border-box; background: none; cursor: pointer; text-decoration: none; white-space: nowrap; overflow: hidden;
  font: inherit; font-size: 15px; font-weight: 500; color: var(--color-surface-800);
}
.ui-sidebar-link:hover { background: color-mix(in oklab, var(--ui-sidebar-accent) 8%, transparent); color: var(--ui-sidebar-accent); }
.ui-sidebar-link[aria-current=page] { background: color-mix(in oklab, var(--ui-sidebar-accent) 12%, transparent); color: var(--ui-sidebar-accent); }
.ui-sidebar-link:focus-visible { outline: 2px solid var(--ui-sidebar-accent); outline-offset: 2px; }
.ui-sidebar-link > svg { flex-shrink: 0; }
.ui-sidebar[data-collapsed] .ui-sidebar-label { display: none; }
/* Fixed to the screen's bottom left (alerts take the bottom right), above the page and Navbar, under overlays (40). */
.ui-sidebar-toggle {
  position: fixed; z-index: 30; left: 16px; bottom: calc(16px + env(safe-area-inset-bottom, 0px));
  display: flex; align-items: center; justify-content: center; width: 48px; height: 48px; padding: 0;
  border-radius: 50%; border: 1px solid color-mix(in oklab, var(--color-surface-500) 40%, transparent);
  background: var(--color-surface-50); color: var(--ui-sidebar-accent); cursor: pointer;
  box-shadow: 0 4px 12px rgb(0 0 0 / 0.18); transition: transform 150ms ease, background 150ms ease;
}
.ui-sidebar-toggle:hover { background: color-mix(in oklab, var(--ui-sidebar-accent) 8%, var(--color-surface-50)); transform: scale(1.05); }
.ui-sidebar-toggle:active { transform: scale(0.97); }
.ui-sidebar-toggle:focus-visible { outline: 2px solid var(--ui-sidebar-accent); outline-offset: 2px; }
@media (prefers-reduced-motion: reduce) { .ui-sidebar, .ui-sidebar-toggle { transition: none; } }
`;
