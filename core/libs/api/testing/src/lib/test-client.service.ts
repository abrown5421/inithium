import type { AddressInfo } from 'node:net';
import type { Express } from 'express';

// Response bodies default to `any` so tests can read the JSON they expect without a cast at every step.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Json = any;

/** A response as tests check it: status, parsed JSON body (or text), and headers. */
export type TestResponse<T = Json> = { status: number; body: T; headers: Headers };

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * Calls a test app over real HTTP, like a browser on one origin: it keeps the cookies the api sets (and drops the ones
 * it clears), so a client that signs in stays signed in. Use one client per simulated person.
 */
export class TestClient {
  private readonly cookies = new Map<string, string>();

  constructor(private readonly app: Express) {}

  get<T = Json>(path: string) {
    return this.request<T>('GET', path);
  }
  post<T = Json>(path: string, body?: unknown) {
    return this.request<T>('POST', path, body);
  }
  put<T = Json>(path: string, body?: unknown) {
    return this.request<T>('PUT', path, body);
  }
  patch<T = Json>(path: string, body?: unknown) {
    return this.request<T>('PATCH', path, body);
  }
  delete<T = Json>(path: string) {
    return this.request<T>('DELETE', path);
  }

  /** The value of a cookie the api set, e.g. 'inithium_access'. */
  cookie(name: string): string | undefined {
    return this.cookies.get(name);
  }

  /** Sets or replaces a cookie by hand, e.g. to replay an old refresh token. */
  setCookie(name: string, value: string): void {
    this.cookies.set(name, value);
  }

  /** Forgets every cookie: the same person on a fresh browser. */
  clearCookies(): void {
    this.cookies.clear();
  }

  async request<T = Json>(method: Method, path: string, body?: unknown): Promise<TestResponse<T>> {
    // A fresh server per request on a free port, so nothing is left listening after the test.
    const server = this.app.listen(0, '127.0.0.1');
    await new Promise<void>((resolve) => server.once('listening', resolve));
    try {
      const { port } = server.address() as AddressInfo;
      const headers: Record<string, string> = {};
      if (body !== undefined) headers['content-type'] = 'application/json';
      if (this.cookies.size) headers['cookie'] = [...this.cookies].map(([name, value]) => `${name}=${value}`).join('; ');
      const response = await fetch(`http://127.0.0.1:${port}${path}`, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
        redirect: 'manual',
      });
      this.storeCookies(response.headers.getSetCookie());
      const text = await response.text();
      const json = response.headers.get('content-type')?.includes('application/json');
      return { status: response.status, body: (json && text ? JSON.parse(text) : text) as T, headers: response.headers };
    } finally {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  }

  private storeCookies(setCookies: string[]): void {
    for (const header of setCookies) {
      const [pair = '', ...attributes] = header.split(';');
      const index = pair.indexOf('=');
      const name = pair.slice(0, index).trim();
      const value = pair.slice(index + 1).trim();
      const expired = attributes.some((attribute) => {
        const [key = '', setting = ''] = attribute.split('=').map((part) => part.trim());
        return (key.toLowerCase() === 'expires' && new Date(setting).getTime() <= Date.now()) || (key.toLowerCase() === 'max-age' && Number(setting) <= 0);
      });
      if (!value || expired) this.cookies.delete(name);
      else this.cookies.set(name, value);
    }
  }
}

/** A new client for the app, with no cookies. */
export const testClient = (app: Express) => new TestClient(app);
