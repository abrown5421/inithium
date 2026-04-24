import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { AppRouter } from './routes';

vi.mock('@inithium/store', () => ({
  usePageTransition: vi.fn(() => ({
    controller: { phase: 'entered', triggerExit: vi.fn(), triggerEnter: vi.fn() },
    activePage: '/',
  })),
  initialize: vi.fn((path) => ({ type: 'transition/initialize', payload: path })),
  requestTransition: vi.fn((path) => ({ type: 'transition/requestTransition', payload: path })),
}));

vi.mock('@inithium/pages', () => ({
  PAGE_REGISTRY: [
    { 
      key: 'home', 
      path: '/', 
      entry: 'fadeIn', 
      exit: 'fadeOut', 
      bg: 'surface', 
      component: () => <div data-testid="home-page">Home</div> 
    }
  ],
  PageShell: ({ page }: any) => <div data-testid="page-shell"><page.component /></div>,
}));

vi.mock('@inithium/ui', () => ({
  Box: ({ children }: any) => <div data-testid="ui-box">{children}</div>,
}));

describe('AppRouter', () => {
  let store: any;
  let routerInstance: any;

  const mockPages = [
    { 
      key: 'home', 
      path: '/', 
      entry: 'fadeIn', 
      exit: 'fadeOut', 
      bg: 'surface', 
      component: () => <div data-testid="home-page">Home</div> 
    }
  ];

  beforeEach(() => {
    store = configureStore({
      reducer: {
        transition: (state = { activePage: '/' }) => state,
      },
    });
    
    routerInstance = createAppRouter(mockPages);
  });

  it('renders the router provider and initial route', () => {
    render(
      <Provider store={store}>
        <AppRouter router={routerInstance} />
      </Provider>
    );

    expect(screen.getByTestId('home-page')).toBeDefined();
  });

  it('contains the RouterShell structure', () => {
    render(
      <Provider store={store}>
        <AppRouter router={routerInstance} />
      </Provider>
    );

    expect(screen.getByTestId('ui-box')).toBeDefined();
  });
});