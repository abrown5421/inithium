export type UserRole = 'admin' | 'member' | 'guest';

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile extends User {
  avatarUrl?: string;
  bio?: string;
}
