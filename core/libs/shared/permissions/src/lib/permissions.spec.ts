import { describe, expect, it } from 'vitest';
import { permissions, roles, type Role } from '@inithium/shared-contracts';
import { rolePermissions } from './permissions.config';
import { hasPermission } from './permissions.service';
import { assignableRoles, canManageRole } from './roles.service';

describe('hasPermission', () => {
  it('gives dev every permission', () => {
    for (const permission of permissions) expect(hasPermission('dev', permission)).toBe(true);
  });

  it('gives the user role no permissions, so end users never reach the CMS', () => {
    for (const permission of permissions) expect(hasPermission('user', permission)).toBe(false);
  });

  it('follows the matrix for every other role', () => {
    for (const [role, granted] of Object.entries(rolePermissions) as [Exclude<Role, 'dev'>, readonly string[]][]) {
      for (const permission of permissions) expect(hasPermission(role, permission)).toBe(granted.includes(permission));
    }
  });

  it('never gives a role more than the role above it', () => {
    const ladder: Exclude<Role, 'dev'>[] = ['owner', 'admin', 'editor', 'user'];
    for (let i = 1; i < ladder.length; i++) {
      const [senior, junior] = [ladder[i - 1] as Exclude<Role, 'dev'>, ladder[i] as Exclude<Role, 'dev'>];
      for (const permission of rolePermissions[junior]) expect(rolePermissions[senior]).toContain(permission);
    }
  });

  it('keeps publishing, deleting, settings and file deletion away from editors (decisions 0078, 0098, 0100)', () => {
    for (const permission of ['pages.publish', 'pages.delete', 'settings.edit', 'assets.delete', 'users.edit', 'users.delete'] as const) {
      expect(hasPermission('editor', permission)).toBe(false);
    }
  });
});

describe('assignableRoles', () => {
  it('never offers dev, to anyone', () => {
    for (const role of roles) expect(assignableRoles(role)).not.toContain('dev');
  });

  it('offers roles up to and including the actor’s own', () => {
    expect(assignableRoles('owner')).toEqual(['owner', 'admin', 'editor', 'user']);
    expect(assignableRoles('admin')).toEqual(['admin', 'editor', 'user']);
    expect(assignableRoles('editor')).toEqual(['editor', 'user']);
    expect(assignableRoles('user')).toEqual(['user']);
  });
});

describe('canManageRole', () => {
  it('never lets anyone manage a dev account, not even dev', () => {
    for (const role of roles) expect(canManageRole(role, 'dev')).toBe(false);
  });

  it('allows accounts at the actor’s level or below', () => {
    expect(canManageRole('owner', 'owner')).toBe(true);
    expect(canManageRole('admin', 'owner')).toBe(false);
    expect(canManageRole('admin', 'admin')).toBe(true);
    expect(canManageRole('editor', 'admin')).toBe(false);
    expect(canManageRole('editor', 'user')).toBe(true);
    expect(canManageRole('dev', 'owner')).toBe(true);
  });
});
