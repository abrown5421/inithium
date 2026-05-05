import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import type { PageDefinition } from '@inithium/types';
import { 
  AppRouter, 
  createAppRouter 
} from './routes';
import { 
  usePageTransition 
} from '@inithium/store';

vi.mock('@inithium/store', () => ({
  usePageTransition: vi.fn(),
  requestTransition: vi.fn((path) => ({ type: 'transition/request', payload: path })),
}));

vi.mock('@inithium/ui', () => ({
  PageShell: ({ page }: any) => 
    page ? <div data-testid="page-shell">{page.key}</div> : null,
  Box: ({ children, className }: any) => <div className={className}>{children}</div>,
}));

const createMockStore = (initialState = {}) => 
  configureStore({
    reducer: (state = initialState) => state,
  });

const renderWithContext = (ui: React.ReactElement) => {
  const store = createMockStore();
  return {
    ...render(<Provider store={store}>{ui}</Provider>),
    store,
  };
};

describe('AppRouter & TransitionLayout Logic', () => {
  const mockPages = [
    { key: 'home', path: '/' },
    { key: 'about', path: '/about' }
  ] as PageDefinition[];

  const notFoundPage = { key: '404', path: '/404' } as PageDefinition;
  const errorPage = { key: 'error', path: '/error' } as PageDefinition;
  const mockNavbar = <nav data-testid="navbar" />;

  const mockTransitionState = (overrides = {}) => {
    (usePageTransition as any).mockReturnValue({
      controller: { triggerEnter: vi.fn() },
      activePage: '/',
      phase: 'idle',
      ...overrides,
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createAppRouter', () => {
    it('should configure a router with nested children for each page definition plus a wildcard', () => {
      const router = createAppRouter(mockPages, notFoundPage, errorPage, mockNavbar);
      const transitionLayoutRoute = router.routes[0].children?.[0];
      
      expect(transitionLayoutRoute?.children).toHaveLength(mockPages.length + 1);
    });
  });

  describe('TransitionLayout Lifecycle', () => {
    it('should render the PageShell corresponding to the activePage state', () => {
      mockTransitionState({ activePage: '/' });
      const router = createAppRouter(mockPages, notFoundPage, errorPage, mockNavbar);

      renderWithContext(<AppRouter router={router} pages={mockPages} />);
      
      const shell = screen.getByTestId('page-shell') as any;
      expect(shell.textContent).toBe('home');
    });

    it('should fallback to notFoundPage if the activePage does not match any page definition', () => {
      mockTransitionState({ activePage: '/unknown' });
      const router = createAppRouter(mockPages, notFoundPage, errorPage, mockNavbar);

      renderWithContext(<AppRouter router={router} pages={mockPages} />);

      const shell = screen.getByTestId('page-shell') as any;
      expect(shell.textContent).toBe('404');
    });
  });
});