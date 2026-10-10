/**
 * Footer's fixed CSS (decision 0077): a row of main links over a smaller row of the copyright and secondary links,
 * separated by thin rules. Below 640px (data-narrow) the rows stack into columns and the rules go.
 */
export const footerStyleSheet = `
.ui-footer { display: flex; flex-direction: column; gap: 16px; }
.ui-footer[data-align=center] { align-items: center; text-align: center; }
.ui-footer-links, .ui-footer-more { display: flex; flex-wrap: wrap; margin: 0; padding: 0; list-style: none; }
.ui-footer-links { gap: 4px 28px; }
.ui-footer[data-align=center] .ui-footer-links, .ui-footer[data-align=center] .ui-footer-secondary,
.ui-footer[data-align=center] .ui-footer-more { justify-content: center; }
.ui-footer-link { border-radius: 4px; text-decoration: none; color: var(--color-surface-900); font-size: 16px; font-weight: 500; }
.ui-footer-more .ui-footer-link { color: var(--color-surface-600); font-size: 14px; font-weight: 400; }
.ui-footer-link:hover, .ui-footer-link[aria-current=page] { color: var(--ui-footer-accent); }
.ui-footer-link:focus-visible { outline: 2px solid var(--ui-footer-accent); outline-offset: 2px; }
.ui-footer-secondary { display: flex; flex-wrap: wrap; align-items: center; gap: 4px 12px; }
.ui-footer-copyright { margin: 0; font-size: 14px; color: var(--color-surface-600); }
.ui-footer-more { gap: 4px 12px; }
.ui-footer-more li { display: inline-flex; align-items: center; gap: 12px; }
.ui-footer-more li + li::before, .ui-footer-more[data-after-copyright] li:first-child::before {
  content: ''; width: 1px; height: 16px; background: color-mix(in oklab, var(--color-surface-500) 40%, transparent);
}
.ui-footer[data-narrow] .ui-footer-links, .ui-footer[data-narrow] .ui-footer-secondary,
.ui-footer[data-narrow] .ui-footer-more { flex-direction: column; align-items: inherit; gap: 10px; }
.ui-footer[data-narrow] .ui-footer-more li::before { display: none; }
`;
