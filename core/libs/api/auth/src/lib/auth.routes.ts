import { Router, type Response } from 'express';
import { rateLimit } from 'express-rate-limit';
import { loginRequestSchema, type AuthResponse } from '@inithium/shared-contracts';
import { findUserByEmailWithPassword, findUserById, toUser, type UserDocument } from '@inithium/api-users';
import { getAuth, requireAuth } from './auth.middleware';
import { clearAuthCookies, REFRESH_COOKIE, setAuthCookies } from './cookies.service';
import { hashPassword, verifyPassword } from './passwords.service';
import { issueRefreshToken, revokeRefreshToken, rotateRefreshToken } from './refresh-tokens.service';
import { signAccessToken } from './tokens.service';

// Counts failed logins only: 10 per IP per 15 minutes.
const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { message: 'Too many failed login attempts. Try again in 15 minutes.' },
});

function respondWithUser(res: Response, user: UserDocument): void {
  const body: AuthResponse = { user: toUser(user) };
  res.send(body);
}

function readRefreshCookie(cookies: unknown): string | null {
  const token: unknown = (cookies as Record<string, unknown> | undefined)?.[REFRESH_COOKIE];
  return typeof token === 'string' && token.length > 0 ? token : null;
}

/** Mounted at /api/auth. */
export const authRouter = Router();

authRouter.post('/login', loginRateLimit, async (req, res) => {
  const parsed = loginRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).send({ message: 'Enter a valid email address and password' });
    return;
  }

  const { email, password } = parsed.data;
  const user = await findUserByEmailWithPassword(email);
  // Hash anyway when the user doesn't exist, so response time doesn't reveal which emails have accounts.
  const valid = user ? await verifyPassword(password, user.passwordHash) : (await hashPassword(password), false);
  if (!user || !valid) {
    res.status(401).send({ message: 'Incorrect email or password' });
    return;
  }

  const userId = user._id.toString();
  setAuthCookies(res, {
    accessToken: signAccessToken({ id: userId, role: user.role }),
    refreshToken: await issueRefreshToken(userId),
  });
  respondWithUser(res, user);
});

authRouter.post('/refresh', async (req, res) => {
  const token = readRefreshCookie(req.cookies);
  const rotated = token ? await rotateRefreshToken(token) : null;
  const user = rotated ? await findUserById(rotated.userId) : null;
  if (!rotated || !user) {
    clearAuthCookies(res);
    res.status(401).send({ message: 'Session expired' });
    return;
  }

  setAuthCookies(res, {
    accessToken: signAccessToken({ id: rotated.userId, role: user.role }),
    refreshToken: rotated.token,
  });
  respondWithUser(res, user);
});

authRouter.post('/logout', async (req, res) => {
  const token = readRefreshCookie(req.cookies);
  if (token) await revokeRefreshToken(token);
  clearAuthCookies(res);
  res.status(204).end();
});

authRouter.get('/me', requireAuth, async (_req, res) => {
  const user = await findUserById(getAuth(res).sub);
  if (!user) {
    clearAuthCookies(res);
    res.status(401).send({ message: 'Not authenticated' });
    return;
  }
  respondWithUser(res, user);
});
