import type { Permission, Role } from '@inithium/shared-contracts';
import { rolePermissions } from './permissions.config';

export function hasPermission(role: Role, permission: Permission): boolean {
  return role === 'dev' || rolePermissions[role].includes(permission);
}
