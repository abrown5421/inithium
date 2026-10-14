import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import express from 'express';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { apiErrorHandler, apiNotFound, type HttpError } from './errors.middleware';

// The test kit builds on this lib, so this spec makes its own small app rather than importing the kit.
const app = express();
app.get('/api/conflict', () => {
  throw Object.assign(new Error('Another page already uses that address'), { status: 409, field: 'path' }) satisfies HttpError;
});
app.get('/api/forbidden', () => {
  throw Object.assign(new Error('Not allowed'), { status: 403 });
});
app.get('/api/crash', async () => {
  throw new Error('database password is hunter2');
});
app.get('/api/upstream', () => {
  throw Object.assign(new Error('bucket unreachable'), { status: 503 });
});
app.use('/api', apiNotFound);
app.use('/api', apiErrorHandler);

let server: Server;
let base = '';
beforeAll(async () => {
  server = app.listen(0, '127.0.0.1');
  await new Promise<void>((resolve) => server.once('listening', resolve));
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});
afterAll(() => new Promise<void>((resolve) => server.close(() => resolve())));

const call = async (path: string) => {
  const response = await fetch(base + path);
  return { status: response.status, body: await response.json() };
};

describe('apiErrorHandler', () => {
  it('passes a 4xx through with its message and field', async () => {
    expect(await call('/api/conflict')).toEqual({ status: 409, body: { message: 'Another page already uses that address', field: 'path' } });
    expect(await call('/api/forbidden')).toEqual({ status: 403, body: { message: 'Not allowed' } });
  });

  it('hides anything else behind a generic 500, logging it on the server', async () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(await call('/api/crash')).toEqual({ status: 500, body: { message: 'Something went wrong' } });
    expect(await call('/api/upstream')).toEqual({ status: 500, body: { message: 'Something went wrong' } });
    expect(log).toHaveBeenCalledTimes(2);
    log.mockRestore();
  });
});

describe('apiNotFound', () => {
  it('answers unknown /api paths with a JSON 404, never the SPA', async () => {
    expect(await call('/api/nothing-here')).toEqual({ status: 404, body: { message: 'Not found' } });
  });
});
