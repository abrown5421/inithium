import { MongoClient } from 'mongodb';
import { getConfig } from '../config/env';

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;

export async function getMongoClient(): Promise<MongoClient> {
  if (client) {
    return client;
  }

  if (!clientPromise) {
    const { mongoUri } = getConfig();
    client = new MongoClient(mongoUri);
    clientPromise = client.connect().then(() => {
      if (!client) {
        throw new Error('MongoClient instance was not initialized');
      }

      return client;
    });
  }

  return clientPromise;
}

export async function disconnectMongoClient(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    clientPromise = null;
  }
}

