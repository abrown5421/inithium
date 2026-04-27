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
  initialize, 
  usePageTransition 
} from '@inithium/store';

vi.mock('@inithium/store', () => ({
  usePageTransition: vi.fn(),
  requestTransition: vi.fn(() => ({ type: 'transition/request' })),
  initialize: vi.fn(() => ({ type: 'transition/initialize' })),
}));

vi.mock('@inithium/ui', () => ({
  PageShell: ({ page }: any) => <div data-testid="page-shell">{page.key}</div>,
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
  const mockPages = ([
    { key: 'home', path: '/' },
    { key: 'about', path: '/about' }
  ] as any) as PageDefinition[];

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
    it('should configure a router with nested children for each page definition', () => {
      const router = createAppRouter(mockPages);
      const transitionLayoutRoute = router.routes[0].children?.[0];
      expect(transitionLayoutRoute?.children).toHaveLength(mockPages.length);
    });
  });

  describe('TransitionLayout Lifecycle', () => {
    it('should dispatch initialize on the first mount', () => {
      mockTransitionState();
      const router = createAppRouter(mockPages);

      renderWithContext(<AppRouter router={router} pages={mockPages} />);
      expect(initialize).toHaveBeenCalledTimes(1);
    });

    it('should render the PageShell corresponding to the activePage state', () => {
      mockTransitionState({ activePage: '/' });
      const router = createAppRouter(mockPages);

      renderWithContext(<AppRouter router={router} pages={mockPages} />);
      
      const shell = screen.getByTestId('page-shell');
      expect((shell as any).innerHTML).toBe('home');
    });

    it('should return null if the activePage does not match any page definition', () => {
      mockTransitionState({ activePage: '/unknown' });
      const router = createAppRouter(mockPages);

      renderWithContext(<AppRouter router={router} pages={mockPages} />);

      const shell = screen.queryByTestId('page-shell');
      expect(shell).toBeNull();
    });
  });
});