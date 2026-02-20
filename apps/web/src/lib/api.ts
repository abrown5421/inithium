import { createApiClient } from '@inithium/api-client';

export const api = createApiClient(
  import.meta.env.VITE_API_URL || 'http://localhost:5000'
);
