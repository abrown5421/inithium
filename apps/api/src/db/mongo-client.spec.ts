import { getMongoClient, disconnectMongoClient } from './mongo-client';

describe('MongoDB connection', () => {
  const mongoUri = process.env.MONGO_URI;

  it('fails if MONGO_URI is not set', () => {
    if (!mongoUri) {
      throw new Error(
        'Missing MONGO_URI environment variable. Please set it in your .env file.'
      );
    }
  });

  it('connects to the MongoDB cluster and responds to a ping command', async () => {
    if (!mongoUri) {
      return;
    }

    const client = await getMongoClient();
    const adminDb = client.db().admin();

    const result = await adminDb.ping();

    expect(result.ok).toBe(1);
  });

  afterAll(async () => {
    if (mongoUri) {
      await disconnectMongoClient();
    }
  });
});