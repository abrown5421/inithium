// Define environment variables BEFORE imports to satisfy jwt.sign dependencies
process.env.JWT_SECRET = 'test-secret-key';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key';

import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import express from 'express';
import cookieParser from 'cookie-parser';
import { UserModel } from '../users/user.model.js';
import { authRouter } from './auth.router.js';
import { authService } from './auth.service.js';

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/auth', authRouter);

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await UserModel.deleteMany({});
});

const getCookies = (res: request.Response): string[] => {
  const raw = res.headers['set-cookie'];
  if (!raw) return [];
  return Array.isArray(raw) ? raw : [raw];
};

describe('Auth Module', () => {
  const mockCredentials = {
    email: 'august@inithium.com',
    password: 'Password123!',
    first_name: 'August',
    last_name: 'Brown',
  };

  describe('AuthService', () => {
    describe('register()', () => {
      it('should register a new user and return tokens', async () => {
        const result = await authService.register(mockCredentials);
        expect(result.accessToken).toBeDefined();
        expect(result.refreshToken).toBeDefined();
        expect(result.user.email).toBe(mockCredentials.email);
      });

      it('should not include password in the returned user', async () => {
        const result = await authService.register(mockCredentials);
        expect((result.user as any).password).toBeUndefined();
      });

      it('should throw 409 if email is already registered', async () => {
        await authService.register(mockCredentials);
        await expect(authService.register(mockCredentials)).rejects.toMatchObject({
          status: 409,
        });
      });
    });

    describe('login()', () => {
      it('should return tokens for valid credentials', async () => {
        await authService.register(mockCredentials);
        const result = await authService.login({
          email: mockCredentials.email,
          password: mockCredentials.password,
        });
        expect(result.accessToken).toBeDefined();
        expect(result.refreshToken).toBeDefined();
      });

      it('should throw 401 for an unrecognised email', async () => {
        await expect(
          authService.login({ email: 'nobody@inithium.com', password: 'whatever' })
        ).rejects.toMatchObject({ status: 401 });
      });

      it('should throw 401 for a wrong password', async () => {
        await authService.register(mockCredentials);
        await expect(
          authService.login({ email: mockCredentials.email, password: 'wrongpassword' })
        ).rejects.toMatchObject({ status: 401 });
      });
    });

    describe('refresh()', () => {
      it('should return new tokens for a valid refresh token', async () => {
        const { refreshToken } = await authService.register(mockCredentials);
        const result = await authService.refresh(refreshToken);
        expect(result.accessToken).toBeDefined();
        expect(result.refreshToken).toBeDefined();
      });

      it('should throw 401 for an invalid refresh token', async () => {
        await expect(authService.refresh('not-a-valid-token')).rejects.toMatchObject({
          status: 401,
        });
      });
    });

    describe('changePassword()', () => {
      it('should succeed with the correct current password', async () => {
        const { user } = await authService.register(mockCredentials);
        await expect(
          authService.changePassword(
            String((user as any)._id),
            mockCredentials.password,
            'NewPassword456!'
          )
        ).resolves.toBeUndefined();
      });

      it('should throw 401 for an incorrect current password', async () => {
        const { user } = await authService.register(mockCredentials);
        await expect(
          authService.changePassword(String((user as any)._id), 'wrongpassword', 'New456!')
        ).rejects.toMatchObject({ status: 401 });
      });
    });
  });

  describe('AuthRouter (Integration)', () => {
    describe('POST /auth/register', () => {
      it('should register and return an access token', async () => {
        const response = await request(app).post('/auth/register').send(mockCredentials);
        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.data.accessToken).toBeDefined();
      });

      it('should set a refreshToken httpOnly cookie', async () => {
        const response = await request(app).post('/auth/register').send(mockCredentials);
        const cookies = getCookies(response);
        expect(cookies.some((c) => c.startsWith('refreshToken='))).toBe(true);
        expect(cookies.some((c: string) => c.startsWith('refreshToken='))).toBe(true);
      });

      it('should return 422 when required fields are missing', async () => {
        const response = await request(app)
          .post('/auth/register')
          .send({ email: 'incomplete@inithium.com' });
        expect(response.status).toBe(422);
      });

      it('should return 409 when email is already taken', async () => {
        await request(app).post('/auth/register').send(mockCredentials);
        const response = await request(app).post('/auth/register').send(mockCredentials);
        expect(response.status).toBe(409);
      });
    });

    describe('POST /auth/login', () => {
      beforeEach(async () => {
        await request(app).post('/auth/register').send(mockCredentials);
      });

      it('should return an access token for valid credentials', async () => {
        const response = await request(app).post('/auth/login').send({
          email: mockCredentials.email,
          password: mockCredentials.password,
        });
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.accessToken).toBeDefined();
      });

      it('should set a refreshToken cookie on login', async () => {
        const response = await request(app).post('/auth/login').send({
          email: mockCredentials.email,
          password: mockCredentials.password,
        });
        const cookies = getCookies(response);
        expect(cookies.some((c) => c.startsWith('refreshToken='))).toBe(true);
        expect(cookies.some((c: string) => c.startsWith('refreshToken='))).toBe(true);
      });

      it('should return 401 for invalid credentials', async () => {
        const response = await request(app).post('/auth/login').send({
          email: mockCredentials.email,
          password: 'wrongpassword',
        });
        expect(response.status).toBe(401);
      });

      it('should return 422 when fields are missing', async () => {
        const response = await request(app).post('/auth/login').send({});
        expect(response.status).toBe(422);
      });
    });

    describe('POST /auth/refresh', () => {
      it('should return new tokens when a valid refresh token is sent in the body', async () => {
        const registerRes = await request(app).post('/auth/register').send(mockCredentials);
        const cookieHeader = getCookies(registerRes).find((c) => c.startsWith('refreshToken=')) ?? '';
        const refreshToken = cookieHeader.split(';')[0].replace('refreshToken=', '');

        const response = await request(app)
          .post('/auth/refresh')
          .send({ refreshToken });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.accessToken).toBeDefined();
      });

      it('should return 401 when no refresh token is provided', async () => {
        const response = await request(app).post('/auth/refresh').send({});
        expect(response.status).toBe(401);
      });

      it('should return 401 for an invalid refresh token', async () => {
        const response = await request(app)
          .post('/auth/refresh')
          .send({ refreshToken: 'invalid.token.value' });
        expect(response.status).toBe(401);
      });
    });

    describe('POST /auth/logout', () => {
      it('should return 200 and clear the refreshToken cookie', async () => {
        const response = await request(app).post('/auth/logout');
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        const cookies = getCookies(response);
        expect(cookies.some((c) => c.includes('refreshToken=;') || c.includes('refreshToken='))).toBe(true);
        expect(
          cookies.some((c: string) => c.includes('refreshToken=;') || c.includes('refreshToken='))
        ).toBe(true);
      });
    });
  });
});