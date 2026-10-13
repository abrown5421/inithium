import type { z } from 'zod';
import type {
  createUserRequestSchema,
  deleteUsersRequestSchema,
  deleteUsersResponseSchema,
  managedUserSchema,
  updateUserRequestSchema,
  userListQuerySchema,
  userListResponseSchema,
  userManagementInfoSchema,
} from './user-management.schema';

export type ManagedUser = z.infer<typeof managedUserSchema>;
export type UserListQuery = z.input<typeof userListQuerySchema>;
export type UserListResponse = z.infer<typeof userListResponseSchema>;
export type UserManagementInfo = z.infer<typeof userManagementInfoSchema>;
export type CreateUserRequest = z.infer<typeof createUserRequestSchema>;
export type UpdateUserRequest = z.infer<typeof updateUserRequestSchema>;
export type DeleteUsersRequest = z.infer<typeof deleteUsersRequestSchema>;
export type DeleteUsersResponse = z.infer<typeof deleteUsersResponseSchema>;
