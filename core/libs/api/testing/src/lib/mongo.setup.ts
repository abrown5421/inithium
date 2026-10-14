import { MongoMemoryServer } from 'mongodb-memory-server';
import type { TestProject } from 'vitest/node';

declare module 'vitest' {
  export interface ProvidedContext {
    /** The in-memory MongoDB server's address, without a database name. */
    mongoUri: string;
  }
}

/**
 * Vitest global setup for `database: true` projects: starts one in-memory MongoDB server for the run (its binary is
 * downloaded once, on first use) and stops it afterwards. Each test file gets its own database on it.
 */
export default async function startMongo(project: TestProject): Promise<() => Promise<void>> {
  const server = await MongoMemoryServer.create();
  project.provide('mongoUri', server.getUri());
  return async () => {
    await server.stop();
  };
}
