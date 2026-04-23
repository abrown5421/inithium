import React, { useEffect, useRef } from 'react';
import {
  createBrowserRouter,
  RouterProvider,
  useLocation,
  Outlet,
} from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { PageShell } from '@inithium/ui';
import { usePageTransition, requestTransition, initialize } from '@inithium/store';
import type { AppDispatch } from '@inithium/store';
import { Box } from '@inithium/ui';
import type { PageDefinition } from '@inithium/types';

type AppRouterInstance = ReturnType<typeof createBrowserRouter>;

interface AppRouterProps {
  pages: PageDefinition[];
  router: AppRouterInstance;
}

const TransitionLayout: React.FC<{ pages: PageDefinition[] }> = ({ pages }) => {
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();
  const { controller, activePage, phase } = usePageTransition();
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      dispatch(initialize(location.pathname));
    }
  }, [dispatch]);

  useEffect(() => {
    if (activePage !== null && activePage !== location.pathname) {
      dispatch(requestTransition(location.pathname));
    }
  }, [location.pathname, activePage, dispatch]);

  useEffect(() => {
    if (phase === 'entering') {
      controller.triggerEnter();
    }
  }, [phase]);

  const currentPageDef = pages.find(
    (p) => p.key === activePage || p.path === activePage,
  );

  if (!currentPageDef) return null;

  return <PageShell page={currentPageDef} controller={controller} />;
};

const RouterShell: React.FC = () => {
  return (
    <Box className="h-shell bg-surface-contrast" direction="col">
      <Outlet />
    </Box>
  );
};

export const createAppRouter = (pages: PageDefinition[]): AppRouterInstance =>
  createBrowserRouter([
    {
      path: '/',
      element: <RouterShell />,
      children: [
        {
          path: '',
          element: <TransitionLayout pages={pages} />,
          children: pages.map((page) => ({
            path: page.path === '/' ? '' : page.path.replace(/^\//, ''),
            element: <Outlet />,
          })),
        },
      ],
    },
  ]);

export let router: AppRouterInstance;

export const initRouter = (pages: PageDefinition[]): AppRouterInstance => {
  router = createAppRouter(pages);
  return router;
};

export const AppRouter: React.FC<AppRouterProps> = ({ router }) => {
  return <RouterProvider router={router} />;
};