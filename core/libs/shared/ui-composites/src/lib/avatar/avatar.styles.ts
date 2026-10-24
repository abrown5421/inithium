/**
 * Avatar's fixed CSS (decision 0075). The edit button sits on the circle's edge at 45° (85.36% across and down)
 * and shrinks on avatars under 64px, measured with a container query. A status light (decision 0124) takes that
 * bottom-right spot, a quarter of the avatar wide (at least 10px), ringed in the page's background; the edit button
 * then moves to the top-right edge (14.64% down).
 */
export const avatarStyleSheet = `
.ui-avatar { position: relative; width: 100%; height: 100%; container-type: inline-size; }
.ui-avatar-circle { position: absolute; inset: 0; border-radius: 50%; overflow: hidden; background: var(--ui-avatar-bg); }
.ui-avatar-circle > svg { display: block; width: 100%; height: 100%; }
.ui-avatar-photo { width: 100%; height: 100%; object-fit: cover; }
.ui-avatar-edit {
  position: absolute; left: calc(85.36% - 14px); top: calc(85.36% - 14px); width: 28px; height: 28px; padding: 0;
  display: inline-flex; align-items: center; justify-content: center; cursor: pointer;
  border: 2px solid var(--color-surface-50); border-radius: 50%;
  background: var(--color-surface-900); color: var(--color-surface-100);
}
.ui-avatar-edit[data-corner=top] { top: calc(14.64% - 14px); }
.ui-avatar-edit:hover { background: var(--color-surface-800); }
.ui-avatar-presence {
  position: absolute; width: max(25%, 10px); aspect-ratio: 1; left: 85.36%; top: 85.36%; transform: translate(-50%, -50%);
  box-sizing: border-box; border: 2px solid var(--color-surface-50); border-radius: 50%; background: var(--ui-avatar-presence);
}
.ui-avatar-edit:focus-visible { outline: 2px solid var(--color-primary-500); outline-offset: 2px; }
@container (max-width: 63.98px) {
  .ui-avatar-edit { left: calc(85.36% - 12px); top: calc(85.36% - 12px); width: 24px; height: 24px; }
  .ui-avatar-edit[data-corner=top] { top: calc(14.64% - 12px); }
}
.ui-avatar-preview { position: relative; width: 160px; height: 160px; flex-shrink: 0; }
.ui-avatar-thumb { position: relative; width: 48px; height: 48px; }
.ui-avatar-options { display: grid; grid-template-columns: repeat(auto-fill, minmax(72px, 1fr)); gap: 8px; }
.ui-avatar-option {
  display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 6px 4px; cursor: pointer;
  border: 2px solid transparent; border-radius: 8px; background: none;
  font: inherit; font-size: 12px; color: var(--color-surface-800);
}
.ui-avatar-option:hover { background: var(--color-surface-100); }
.ui-avatar-option[data-state=checked] {
  border-color: var(--color-primary-500); background: color-mix(in oklab, var(--color-primary-500) 10%, transparent);
}
.ui-avatar-option:focus-visible { outline: 2px solid var(--color-primary-500); outline-offset: 2px; }
`;
