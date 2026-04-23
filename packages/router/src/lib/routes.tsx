import React, { useEffect, useRef } from 'react';
import {
  createBrowserRouter,
  RouterProvider,
  useLocation,
  Outlet,
} from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { PAGE_REGISTRY, PageShell } from '@inithium/pages'; 
import { usePageTransition, requestTransition, initialize } from '@inithium/store';
import type { AppDispatch } from '@inithium/store';
import { Box } from '@inithium/ui';

const TransitionLayout: React.FC = () => {
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

  const currentPageDef = PAGE_REGISTRY.find(
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

export const router: ReturnType<typeof createBrowserRouter> = createBrowserRouter([
  {
    path: '/',
    element: <RouterShell />, 
    children: [
      {
        path: '',
        element: <TransitionLayout />,
        children: PAGE_REGISTRY.map((page) => ({
          path: page.path === '/' ? '' : page.path.replace(/^\//, ''),
          element: <Outlet />,
        })),
      },
    ],
  },
]);

export const AppRouter: React.FC = () => {
  return <RouterProvider router={router} />;
};