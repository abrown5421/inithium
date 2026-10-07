import { envSchema } from './env.schema';
import type { Env } from './env.types';

let env: Env | undefined;

/**
 * Validates process.env once and returns the typed result.
 * Locally, Nx loads core/.env for `nx serve`; on Render the variables come from the service settings.
 */
export function loadEnv(): Env {
  if (env) return env;

  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    const issues = result.error.issues.map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`);
    throw new Error(`Invalid environment variables:\n${issues.join('\n')}`);
  }

  env = result.data;
  return env;
}
