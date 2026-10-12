/**
 * ProfileLayout's fixed CSS (decisions 0081, 0090, 0091): full width, two columns under the banner like the CMS
 * frame. The raised sidebar (surface 100, with a shadow) holds the avatar overlapping the banner's bottom edge, the
 * name and the actions; the main column is surface 200. They stack below 768px, and fill the height they're given.
 */
export const profileLayoutStyleSheet = `
.ui-profile { display: flex; flex-direction: column; flex-grow: 1; width: 100%; }
.ui-profile-body { display: grid; grid-template-columns: minmax(0, 1fr); grid-template-rows: auto 1fr; flex-grow: 1; }
.ui-profile-sidebar {
  position: relative; z-index: 1; display: flex; flex-direction: column; gap: 24px; min-width: 0;
  padding: 0 24px 32px; box-sizing: border-box; background: var(--color-surface-100);
  box-shadow: 0 6px 16px -6px rgb(0 0 0 / 0.25);
}
.ui-profile-identity { display: flex; flex-direction: column; align-items: flex-start; gap: 12px; }
.ui-profile-avatar {
  position: relative; margin-top: -52px; padding: 4px; border-radius: 50%; flex-shrink: 0;
  background: var(--color-surface-100);
}
.ui-profile-title { min-width: 0; max-width: 100%; overflow-wrap: anywhere; }
.ui-profile-actions { display: flex; flex-wrap: wrap; gap: 8px; }
.ui-profile-main { min-width: 0; padding: 24px; box-sizing: border-box; background: var(--color-surface-200); }
@media (min-width: 768px) {
  .ui-profile-body { grid-template-columns: 320px minmax(0, 1fr); grid-template-rows: 1fr; }
  .ui-profile-sidebar { padding: 0 28px 40px; box-shadow: 6px 0 20px -6px rgb(0 0 0 / 0.25); }
  .ui-profile-avatar { margin-top: -68px; }
  .ui-profile-main { padding: 32px; }
}
`;
