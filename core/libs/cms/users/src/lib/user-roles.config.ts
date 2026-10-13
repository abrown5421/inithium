import type { ColorValue, Role } from '@inithium/shared-contracts';

/** How the CMS names each role. `user` accounts are the site's members. */
export const ROLE_LABELS: Record<Role, string> = {
  dev: 'Developer',
  owner: 'Owner',
  admin: 'Admin',
  editor: 'Editor',
  user: 'Member',
};

/** What each role can do, for the role field's help. */
export const ROLE_HELP: Record<Role, string> = {
  dev: 'Everything, including what clients can’t change.',
  owner: 'Everything in the CMS, including making other owners.',
  admin: 'Everything in the CMS except managing owners.',
  editor: 'Edits pages, uploads files and adds members and editors.',
  user: 'Uses the site. No CMS access.',
};

/** Each role's badge colour. */
export const ROLE_COLORS: Record<Role, ColorValue> = {
  dev: { color: 'surface', intensity: 800 },
  owner: { color: 'primary', intensity: 700 },
  admin: { color: 'primary', intensity: 500 },
  editor: { color: 'secondary', intensity: 600 },
  user: { color: 'surface', intensity: 600 },
};
