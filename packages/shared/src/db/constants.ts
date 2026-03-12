import { DbStatus } from './types.js';

export const DB_STATUS = {
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
  CONNECTING: 'connecting',
  ERROR: 'error',
} as const satisfies Record<string, DbStatus>;

export const HEALTH_ROUTE = '/api/health' as const;
