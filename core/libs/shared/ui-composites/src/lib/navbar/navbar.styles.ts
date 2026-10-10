/**
 * Navbar's fixed CSS (decision 0076): a 64px row of the brand, the page links (with dropdowns) and the right-hand
 * sections, and the drawer's link list. --ui-navbar-accent is the current page, hover and focus colour.
 */
export const navbarStyleSheet = `
.ui-navbar-row { display: flex; align-items: center; gap: 24px; height: 64px; }
.ui-navbar-brand {
  display: flex; align-items: center; gap: 12px; min-width: 0; flex-shrink: 1;
  color: var(--color-surface-950); text-decoration: none; border-radius: 6px;
}
.ui-navbar-brand img { display: block; height: 40px; width: auto; }
.ui-navbar-title {
  font-family: var(--font-display); font-size: 20px; line-height: 1.2;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.ui-navbar-links { flex: 1; display: flex; min-width: 0; justify-content: var(--ui-navbar-justify); }
.ui-navbar-links > div { display: flex; }
.ui-navbar-spacer { flex: 1; }
.ui-navbar-list { display: flex; align-items: center; gap: 4px; margin: 0; padding: 0; list-style: none; }
.ui-navbar-item { position: relative; }
.ui-navbar-link {
  display: inline-flex; align-items: center; gap: 6px; height: 40px; padding: 0 12px; border: 0; border-radius: 6px;
  background: none; cursor: pointer; white-space: nowrap; text-decoration: none;
  font: inherit; font-size: 16px; font-weight: 500; color: var(--color-surface-900);
}
.ui-navbar-link:hover, .ui-navbar-link[data-state=open] {
  color: var(--ui-navbar-accent); background: color-mix(in oklab, var(--ui-navbar-accent) 8%, transparent);
}
.ui-navbar-link[aria-current=page], .ui-navbar-link[data-current] { color: var(--ui-navbar-accent); }
.ui-navbar-brand:focus-visible, .ui-navbar-link:focus-visible, .ui-navbar-account:focus-visible {
  outline: 2px solid var(--ui-navbar-accent); outline-offset: 2px;
}
.ui-navbar-chevron { display: inline-flex; transition: transform 150ms ease; }
.ui-navbar-link[data-state=open] .ui-navbar-chevron { transform: rotate(180deg); }
.ui-navbar-dropdown {
  position: absolute; top: calc(100% + 8px); left: 0; z-index: 50; min-width: 200px; padding: 6px;
  border: 1px solid color-mix(in oklab, var(--color-surface-500) 30%, transparent); border-radius: 8px;
  background: var(--color-surface-50); box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
}
.ui-navbar-dropdown .ui-navbar-list { flex-direction: column; align-items: stretch; gap: 2px; }
.ui-navbar-dropdown .ui-navbar-link { width: 100%; }
.ui-navbar-end { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.ui-navbar-account { display: block; padding: 0; border: 0; border-radius: 50%; background: none; cursor: pointer; }
.ui-navbar-menu { display: flex; flex-direction: column; gap: 2px; margin: 0; padding: 0; list-style: none; }
.ui-navbar-menu .ui-navbar-link { width: 100%; height: 44px; }
.ui-navbar-menu-heading {
  padding: 12px 12px 4px; font-size: 12px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase;
  color: var(--color-surface-600);
}
.ui-navbar-menu-group .ui-navbar-link { padding-left: 28px; }
@media (prefers-reduced-motion: reduce) { .ui-navbar-chevron { transition: none; } }
`;
