import bcrypt from 'bcryptjs';
import type { AuthTokens, JwtPayload, LoginCredentials } from '@inithium/types';
import type { User } from '@inithium/types';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '@inithium/api-core';
import { usersService } from '../users/user.service.js';
import type { TrianglifyOptions, AvatarOptions } from '@inithium/types';

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

    const GRADIENTS = [
      { colors: ['#4f46e5', '#7c3aed'], accent: '#06b6d4' },
      { colors: ['#059669', '#0284c7'], accent: '#34d399' },
      { colors: ['#dc2626', '#9333ea'], accent: '#f59e0b' },
      { colors: ['#0891b2', '#1d4ed8'], accent: '#818cf8' },
    ];

    const seed = data.email.charCodeAt(0) % GRADIENTS.length;
    const { colors, accent } = GRADIENTS[seed];

    const user_banner: TrianglifyOptions = {
      cell_size: 35,
      variance: 0.55,
      x_colors: ['#0f5066', '#ffffff'],
      y_colors: ['#08594c', '#000000'],
    };

    const user_avatar: AvatarOptions = {
      gradient: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`,
      font: 'display',
      variant: 'circular',
    };

    const created = await usersService.createOne({
      ...data,
      last_name: data.last_name ?? '',
      password: hashedPassword,
      role: 'user',
      user_banner,
      user_avatar,
    });

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
