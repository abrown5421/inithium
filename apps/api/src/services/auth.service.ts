import type { User, AuthResponse, JwtPayload } from '@inithium/shared';
import { sanitizeUser, AUTH_ERRORS } from '@inithium/shared';
import { userRepository } from '../db/repositories/user.repository.js';
import { passwordService } from './password.service.js';
import { tokenService } from './token.service.js';
import {
  ConflictError,
  UnauthorizedError,
  NotFoundError,
} from '../errors/index.js';

export class AuthService {
  async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<AuthResponse> {
    const existingUser = await userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new ConflictError(AUTH_ERRORS.USER_EXISTS);
    }

    const passwordHash = await passwordService.hash(data.password);

    const user = await userRepository.create({
      email: data.email,
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      role: 'user',
    });

    const jwtPayload: JwtPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role ?? 'user',
    };

    const { accessToken, refreshToken } =
      tokenService.generateTokenPair(jwtPayload);

    return {
      user: sanitizeUser(user),
      accessToken,
      refreshToken,
    };
  }

  async login(data: {
    email: string;
    password: string;
  }): Promise<AuthResponse> {
    const user = await userRepository.findByEmail(data.email);
    if (!user) {
      throw new UnauthorizedError(AUTH_ERRORS.INVALID_CREDENTIALS);
    }

    const isValidPassword = await passwordService.compare(
      data.password,
      user.passwordHash,
    );
    if (!isValidPassword) {
      throw new UnauthorizedError(AUTH_ERRORS.INVALID_CREDENTIALS);
    }

    const jwtPayload: JwtPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role ?? 'user',
    };

    const { accessToken, refreshToken } =
      tokenService.generateTokenPair(jwtPayload);

    return {
      user: sanitizeUser(user),
      accessToken,
      refreshToken,
    };
  }

  async refresh(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    let payload: JwtPayload;
    try {
      payload = tokenService.verifyRefreshToken(refreshToken);
    } catch (error) {
      throw new UnauthorizedError(AUTH_ERRORS.INVALID_REFRESH_TOKEN);
    }

    const user = await userRepository.findById(payload.userId);
    if (!user) {
      throw new UnauthorizedError(AUTH_ERRORS.USER_NOT_FOUND);
    }

    const jwtPayload: JwtPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role ?? 'user',
    };

    return tokenService.generateTokenPair(jwtPayload);
  }

  async getUserById(userId: string): Promise<User> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError(AUTH_ERRORS.USER_NOT_FOUND);
    }
    return user;
  }
}

export const authService = new AuthService();
