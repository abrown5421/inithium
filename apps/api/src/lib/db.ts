import mongoose from 'mongoose';

let isConnected = false;

export async function connectDB(): Promise<void> {
  if (isConnected) return;

  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI is not defined');

  await mongoose.connect(uri);
  isConnected = true;
  console.log('[DB] Connected to MongoDB Atlas');
}
