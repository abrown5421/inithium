import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server'; 
import express from 'express';
import { UserModel } from './user.model.js';
import { usersService } from './user.service.js';
import { usersRouter } from './user.router.js';

const app = express();
app.use(express.json());
app.use('/users', usersRouter);

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await UserModel.deleteMany({});
});

describe('User Module', () => {
  const mockUser = {
    email: 'august@inithium.com',
    password: 'password123',
    first_name: 'August',
    last_name: 'Brown',
    role: 'admin' as const,
    gender: { type: 'Other' as const, custom: 'Non-binary' },
    address: { city: 'Detroit', country: 'USA' }
  };

  describe('UserModel & Schema', () => {
    it('should create a user with inclusive gender and address fields', async () => {
      const user = await UserModel.create(mockUser);
      expect(user.email).toBe(mockUser.email);
      expect(user.gender?.type).toBe('Other');
      expect(user.gender?.custom).toBe('Non-binary');
      expect(user.address?.city).toBe('Detroit');
    });

    it('should fail if required fields are missing', async () => {
      const invalidUser = new UserModel({ email: 'test@test.com' });
      await expect(invalidUser.save()).rejects.toThrow();
    });
  });

  describe('UserService', () => {
    it('should find a user by email and include password', async () => {
      await UserModel.create(mockUser);
      const user = await usersService.findByEmail(mockUser.email);
      expect(user).toBeDefined();
      expect(user?.password).toBeDefined();
    });

    it('should find users by role', async () => {
      await UserModel.create(mockUser);
      const admins = await usersService.findByRole('admin');
      expect(admins.length).toBe(1);
      expect(admins[0].role).toBe('admin');
    });
  });

  describe('UserRouter (Integration)', () => {
    it('GET /users/by-role/:role - should return users by role', async () => {
      await UserModel.create(mockUser);
      
      const response = await request(app).get('/users/by-role/admin');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data[0].email).toBe(mockUser.email);
    });

    it('GET /users/by-role/:role - should return 422 for invalid role', async () => {
      const response = await request(app).get('/users/by-role/not-a-role');
      expect(response.status).toBe(422);
      expect(response.body.error).toBeDefined();
    });
  });
});
