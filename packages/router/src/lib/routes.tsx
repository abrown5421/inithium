import React, { useEffect } from 'react';
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
  const { controller, activePage } = usePageTransition();

  useEffect(() => {
    dispatch(initialize(location.pathname));
  }, [dispatch, location.pathname]);

  useEffect(() => {
    if (activePage !== null && activePage !== location.pathname) {
      dispatch(requestTransition(location.pathname));
    }
  }, [location.pathname, activePage, dispatch]);

  const currentPageDef = PAGE_REGISTRY.find(
    (p) => p.key === activePage || p.path === activePage,
  );

  if (!currentPageDef) return null;

  return (
    <PageShell page={currentPageDef} controller={controller} />
  );
};

const RouterShell: React.FC = () => {
  return (
    <Box className="min-h-screen bg-surface" direction="col">
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