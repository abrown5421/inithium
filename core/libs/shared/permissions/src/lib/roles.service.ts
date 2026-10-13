import { roles, type Role } from '@inithium/shared-contracts';

/** How senior each role is: higher outranks lower. */
const RANK: Record<Role, number> = { dev: 5, owner: 4, admin: 3, editor: 2, user: 1 };

/**
 * The roles an account may give (decision 0100): any role up to and including its own, never `dev`. So owners make
 * owners, admins make admins and editors make editors, but nobody makes someone more senior than themselves.
 */
export function assignableRoles(actor: Role): Role[] {
  return roles.filter((role) => role !== 'dev' && RANK[role] <= RANK[actor]);
}

/** Whether an account may change or delete one with this role: its role is at the actor's level or below, never dev. */
export function canManageRole(actor: Role, target: Role): boolean {
  return target !== 'dev' && RANK[target] <= RANK[actor];
}
