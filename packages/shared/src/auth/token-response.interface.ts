import type { UserDocument } from './user-document.interface.js';

export interface TokenResponse {
  accessToken: string;
  user: Pick<UserDocument, '_id' | 'email' | 'role' | 'isEmailVerified' | 'isActive'>;
}
