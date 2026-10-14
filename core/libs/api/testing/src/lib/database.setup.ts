import { randomUUID } from 'node:crypto';
import mongoose from 'mongoose';
import { afterAll, beforeAll, beforeEach, inject } from 'vitest';
import type {} from './mongo.setup';
import { clearDatabase } from './test-database.service';

// Vitest setup file for `database: true` projects: each test file connects Mongoose to its own database, which is
// emptied before every test and dropped at the end. Create test data in beforeEach or in the test, not in beforeAll.

beforeAll(async () => {
  const server = inject('mongoUri').replace(/\/?$/, '/');
  await mongoose.connect(`${server}test-${randomUUID().slice(0, 8)}`);
  // Build every model's indexes first, so unique constraints (emails, page paths) hold from the first test.
  await Promise.all(mongoose.modelNames().map((name) => mongoose.model(name).init()));
});

beforeEach(clearDatabase);

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});
