/**
 * ProfileLayout's fixed CSS (decisions 0081, 0090): the head (avatar overlapping the banner's bottom edge by half,
 * the name, the actions) and the two columns, which stack below 768px.
 */
export const profileLayoutStyleSheet = `
.ui-profile { display: flex; flex-direction: column; width: 100%; }
.ui-profile-frame { width: 100%; max-width: 1200px; margin: 0 auto; padding: 0 24px; box-sizing: border-box; }
.ui-profile-head { display: flex; align-items: flex-end; flex-wrap: wrap; gap: 8px 16px; }
.ui-profile-avatar {
  position: relative; margin-top: -52px; padding: 4px; border-radius: 50%; flex-shrink: 0;
  background: var(--color-surface-50);
}
.ui-profile-title { flex: 1 1 200px; min-width: 0; padding-bottom: 8px; }
.ui-profile-actions { display: flex; flex-wrap: wrap; gap: 8px; padding-bottom: 8px; }
.ui-profile-body { display: grid; grid-template-columns: minmax(0, 1fr); gap: 24px; padding-top: 24px; padding-bottom: 32px; }
.ui-profile-sidebar { display: flex; flex-direction: column; gap: 20px; min-width: 0; }
.ui-profile-main { min-width: 0; }
@media (min-width: 768px) {
  .ui-profile-avatar { margin-top: -68px; }
  .ui-profile-body { grid-template-columns: 280px minmax(0, 1fr); gap: 32px; }
}
`;
