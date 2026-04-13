import bcrypt from 'bcryptjs';
import type { AuthTokens, JwtPayload, LoginCredentials } from '@inithium/types';
import type { User } from '@inithium/types';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '@inithium/api-core';
import { usersService } from '../users/user.service.js';

const SALT_ROUNDS = 12;

const buildPayload = (user: User & { _id: unknown }): JwtPayload => ({
  sub:   String(user._id),
  email: user.email,
  role:  user.role,
});

export class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthTokens> {
    const { email, password } = credentials;

    const user = await usersService.findByEmail(email);
    if (!user) {
      throw Object.assign(new Error('Invalid email or password'), { status: 401 });
    }

    const passwordHash = (user as any).password as string;
    const valid = await bcrypt.compare(password, passwordHash);
    if (!valid) {
      throw Object.assign(new Error('Invalid email or password'), { status: 401 });
    }

    const payload = buildPayload(user as any);
    return {
      accessToken:  signAccessToken(payload),
      refreshToken: signRefreshToken(payload),
    };
  }

  async register(
    data: Pick<User, 'email' | 'first_name' | 'last_name'> & { password: string }
  ): Promise<AuthTokens> {
    const existing = await usersService.findByEmail(data.email);
    if (existing) {
      throw Object.assign(new Error('Email already in use'), { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

    const created = await usersService.createOne({
      ...data,
      password: hashedPassword,
      role: 'user',
    } as Partial<User>);

    const payload = buildPayload(created as any);
    return {
      accessToken:  signAccessToken(payload),
      refreshToken: signRefreshToken(payload),
    };
  }

  async refresh(refreshToken: string): Promise<Pick<AuthTokens, 'accessToken'>> {
    let payload: JwtPayload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw Object.assign(new Error('Refresh token invalid or expired'), { status: 401 });
    }

    // Verify the user still exists
    const user = await usersService.findById(payload.sub);
    if (!user) {
      throw Object.assign(new Error('User not found'), { status: 401 });
    }

    const newPayload: JwtPayload = {
      sub:   payload.sub,
      email: payload.email,
      role:  payload.role,
    };

    return { accessToken: signAccessToken(newPayload) };
  }
}

export const authService = new AuthService();
