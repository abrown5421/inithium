import React, { useEffect } from 'react';
import {
  createBrowserRouter,
  RouterProvider,
  useLocation,
  Outlet,
  matchPath,
} from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { PageShell } from '@inithium/ui';
import { usePageTransition, requestTransition } from '@inithium/store';
import type { AppDispatch } from '@inithium/store';
import { Box } from '@inithium/ui';
import type { PageDefinition } from '@inithium/types';

type AppRouterInstance = ReturnType<typeof createBrowserRouter>;

interface AppRouterProps {
  pages: PageDefinition[];
  router: AppRouterInstance;
}

interface TransitionLayoutProps {
  pages: PageDefinition[];
  notFoundPage: PageDefinition;
  errorPage: PageDefinition;
  footer?: React.ReactNode;
}

interface RouterShellProps {
  navbar: React.ReactNode;
  footer?: React.ReactNode;
}

const TransitionLayout: React.FC<TransitionLayoutProps> = ({
  pages,
  notFoundPage,
  footer,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();
  const { controller, activePage, phase } = usePageTransition();

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

  const currentPageDef =
    pages.find((p) =>
      matchPath({ path: p.path, end: true }, activePage ?? location.pathname)
    ) ?? notFoundPage;

  return <PageShell page={currentPageDef} controller={controller} footer={footer} />;
};

const RouterShell: React.FC<RouterShellProps> = ({ navbar, footer }) => {
  return (
    <Box direction="col" fullHeight className="overflow-scroll no-scrollbar">
      {navbar}
      <Outlet context={{ footer }} />
    </Box>
  );
};

export const createAppRouter = (
  pages: PageDefinition[],
  notFoundPage: PageDefinition,
  errorPage: PageDefinition,
  navbar: React.ReactNode,
  footer?: React.ReactNode,
): AppRouterInstance =>
  createBrowserRouter([
    {
      path: '/',
      element: <RouterShell navbar={navbar} footer={footer} />,
      errorElement: <PageShell page={errorPage} controller={{ triggerEnter: () => {} } as any} />,
      children: [
        {
          path: '',
          element: (
            <TransitionLayout
              pages={pages}
              notFoundPage={notFoundPage}
              errorPage={errorPage}
              footer={footer}
            />
          ),
          children: [
            ...pages.map((page) => ({
              path: page.path === '/' ? '' : page.path.replace(/^\//, ''),
              element: <Outlet />,
            })),
            { path: '*', element: <Outlet /> },
          ],
        },
      ],
    },
  ]);

export let router: AppRouterInstance;

export const initRouter = (
  pages: PageDefinition[],
  notFoundPage: PageDefinition,
  errorPage: PageDefinition,
  navbar: React.ReactNode,
  footer?: React.ReactNode,
): AppRouterInstance => {
  router = createAppRouter(pages, notFoundPage, errorPage, navbar, footer);
  return router;
};

export const AppRouter: React.FC<AppRouterProps> = ({ router }) => {
  return <RouterProvider router={router} />;
};