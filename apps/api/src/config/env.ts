export interface AppConfig {
  host: string;
  port: number;
  mongoUri: string;
  nodeEnv: string;
}

export function getConfig(): AppConfig {
  const host = process.env.HOST ?? 'localhost';
  const port = process.env.PORT ? Number(process.env.PORT) : 3000;
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error('MONGO_URI environment variable is required');
  }

  const nodeEnv = process.env.NODE_ENV ?? 'development';

  return {
    host,
    port,
    mongoUri,
    nodeEnv,
  };
}
