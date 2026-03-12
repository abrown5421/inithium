import jwt from 'jsonwebtoken';
import type {
  JwtPayload,
  AccessTokenPayload,
  RefreshTokenPayload,
} from '@inithium/shared';
import { TOKEN_TYPES } from '@inithium/shared';

const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET!;
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET!;
const ACCESS_TOKEN_EXPIRY = '30m';
const REFRESH_TOKEN_EXPIRY = '7d';

if (!ACCESS_TOKEN_SECRET || !REFRESH_TOKEN_SECRET) {
  throw new Error('JWT secrets are not defined in environment variables');
}

export class TokenService {
  generateAccessToken(payload: JwtPayload): string {
    return jwt.sign(
      {
        ...payload,
        type: TOKEN_TYPES.ACCESS,
      },
      ACCESS_TOKEN_SECRET,
      {
        expiresIn: ACCESS_TOKEN_EXPIRY,
      },
    );
  }

  generateRefreshToken(payload: JwtPayload): string {
    return jwt.sign(
      {
        ...payload,
        type: TOKEN_TYPES.REFRESH,
      },
      REFRESH_TOKEN_SECRET,
      {
        expiresIn: REFRESH_TOKEN_EXPIRY,
      },
    );
  }

  generateTokenPair(payload: JwtPayload): {
    accessToken: string;
    refreshToken: string;
  } {
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload),
    };
  }

  verifyAccessToken(token: string): AccessTokenPayload {
    try {
      const decoded = jwt.verify(
        token,
        ACCESS_TOKEN_SECRET,
      ) as AccessTokenPayload;

      if (decoded.type !== TOKEN_TYPES.ACCESS) {
        throw new Error('Invalid token type');
      }

      return decoded;
    } catch (error) {
      throw new Error('Invalid or expired access token');
    }
  }

  verifyRefreshToken(token: string): RefreshTokenPayload {
    try {
      const decoded = jwt.verify(
        token,
        REFRESH_TOKEN_SECRET,
      ) as RefreshTokenPayload;

      if (decoded.type !== TOKEN_TYPES.REFRESH) {
        throw new Error('Invalid token type');
      }

      return decoded;
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }
  }

  decode(token: string): AccessTokenPayload | RefreshTokenPayload | null {
    return jwt.decode(token) as AccessTokenPayload | RefreshTokenPayload | null;
  }
}

export const tokenService = new TokenService();
