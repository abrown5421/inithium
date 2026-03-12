import mongoose from 'mongoose';
import { DbStatus } from '@inithium/shared';

const MONGO_URI = process.env.MONGO_URI;

export async function connectDB(): Promise<void> {
  if (!MONGO_URI) {
    throw new Error('MONGO_URI is not defined in environment variables');
  }

  mongoose.connection.on('connecting', () =>
    console.log('[DB] Connecting to MongoDB...'),
  );
  mongoose.connection.on('connected', () =>
    console.log('[DB] MongoDB connected successfully'),
  );
  mongoose.connection.on('error', (err) =>
    console.error('[DB] MongoDB connection error:', err),
  );
  mongoose.connection.on('disconnected', () =>
    console.warn('[DB] MongoDB disconnected'),
  );

  await mongoose.connect(MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
  });
}

export function getDbStatus() {
  const stateMap: Record<number, DbStatus> = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnected',
  };
  return stateMap[mongoose.connection.readyState] ?? 'error';
}
