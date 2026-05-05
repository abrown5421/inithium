/// <reference lib="dom" />
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { waitFor } from '@testing-library/react';

const renderMock = vi.fn();
const createRootMock = vi.fn(() => ({
  render: renderMock,
}));

const navigateMock = vi.fn();

const refreshMock = vi.fn(() => ({
  unwrap: () =>
    Promise.resolve({
      user: { dark_mode: true },
    }),
}));

vi.mock('react-dom/client', () => ({
  createRoot: createRootMock,
}));

vi.mock('@inithium/store', () => ({
  store: {},
  useCurrentUser: () => ({
    user: { id: '1' },
    isAuthenticated: true,
  }),
  authApi: {
    useRefreshMutation: () => [refreshMock],
  },
}));

vi.mock('@inithium/router', () => ({
  initRouter: vi.fn(() => ({
    navigate: navigateMock,
  })),
  AppRouter: () => null,
}));

vi.mock('@inithium/pages', () => ({
  PAGE_REGISTRY: [
    {
      key: 'home',
      path: '/',
      isErrorPage: false,
      navigation: {
        label: 'Home',
        location: 'top',
        order: 1,
        authenticated: false,
        anonymous: true,
      },
    },
    {
      key: 'not-found',
      path: '/404',
      isErrorPage: true,
    },
  ],
  getPageByKey: (key: string) => ({
    key,
    path: key === 'not-found' ? '/404' : '/error',
  }),
}));

vi.mock('@inithium/utils', () => ({
  initDarkMode: vi.fn(),
}));

vi.mock('@inithium/ui', () => ({
  AlertComposite: () => null,
  Navbar: () => null,
  Footer: () => null,
}));

vi.mock('react-redux', () => ({
  Provider: ({ children }: any) => children,
}));

describe('main entry', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="root"></div>'; //here
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('creates root and renders app', async () => {
    await import('./main');

    expect(createRootMock).toHaveBeenCalledTimes(1);
    expect(document.getElementById('root')).not.toBeNull();//here
    expect(renderMock).toHaveBeenCalledTimes(1);
  });

  it('initializes router with config', async () => {
    const router = await import('@inithium/router');
    const initRouterSpy = router.initRouter as unknown as ReturnType<typeof vi.fn>;

    await import('./main');

    expect(initRouterSpy).toHaveBeenCalled();
  });
});