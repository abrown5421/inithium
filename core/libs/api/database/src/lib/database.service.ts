import mongoose from 'mongoose';

/**
 * Opens the shared Mongoose connection. The URI (which contains credentials) is never logged.
 */
export async function connectDatabase(uri: string): Promise<typeof mongoose> {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10_000 });
  console.log(`[ db ] connected to "${mongoose.connection.name}"`);

  // Attached after the first connect so a failed startup reports a single error.
  mongoose.connection.on('error', (error) => {
    console.error('[ db ] connection error:', error.message);
  });
  mongoose.connection.on('disconnected', () => {
    console.warn('[ db ] disconnected');
  });

  return mongoose;
}

export async function disconnectDatabase(): Promise<void> {
  mongoose.connection.removeAllListeners('disconnected');
  await mongoose.disconnect();
}
