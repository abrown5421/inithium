export type DbStatus = 'connected' | 'disconnected' | 'connecting' | 'error';

export interface HealthResponse {
  status: 'ok' | 'error';
  db: DbStatus;
  timestamp: string;
}
