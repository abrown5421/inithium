import { StrictMode, useEffect, useState } from 'react';
import * as ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { AppRouter, initRouter } from '@inithium/router';
import { store, useCurrentUser } from '@inithium/store';
import { authApi } from '@inithium/store';
import { PAGE_REGISTRY, getPageByKey } from '@inithium/pages';
import { AlertComposite, Navbar, Footer } from '@inithium/ui';
import { User } from '@inithium/types';
import { initDarkMode } from '@inithium/utils';
import './styles.css';
import 'animate.css';

const CONFIG = Object.freeze({
  LOGO_URL: import.meta.env.VITE_LOGO_URL,
  APP_TITLE: 'Inithium',
});

const buildNavLinks = (
  registry: typeof PAGE_REGISTRY,
  user?: User | null
) =>
  registry
    .filter((p) => !!p.navigation && !p.isErrorPage)
    .map((p) => {
      const nav = p.navigation!;
      const path =
        nav.resolveNavPath && user
          ? nav.resolveNavPath(user)
          : p.path;

      return {
        type: 'link' as const,
        path,
        label: nav.label,
        location: nav.location,
        order: nav.order,
        authenticated: nav.authenticated,
        anonymous: nav.anonymous,
      };
    });

const notFoundPage = getPageByKey('not-found')!;
const errorPage = getPageByKey('error')!;

const SessionGate = ({ children }: { children: React.ReactNode }) => {
  const [ready, setReady] = useState(false);
  const [refresh] = authApi.useRefreshMutation();

  useEffect(() => {
    refresh()
      .unwrap()
      .then((result) => {
        initDarkMode(result.user.dark_mode);
      })
      .catch(() => {
        initDarkMode();
      })
      .finally(() => setReady(true));
  }, []);

  if (!ready) return null;
  return <>{children}</>;
};

const AppNavbar: React.FC = () => {
  const { user, isAuthenticated } = useCurrentUser();
  const navLinks = buildNavLinks(PAGE_REGISTRY, user);

  return (
    <Navbar
      pages={navLinks}
      isAuthenticated={isAuthenticated}
      user={user}
      onNavigate={router.navigate}
      onLoginClick={() => router.navigate('/auth/login')}
      logo={{
        imageSrc: CONFIG.LOGO_URL,
        title: CONFIG.APP_TITLE,
      }}
    />
  );
};

const AppFooter: React.FC = () => {
  const { user } = useCurrentUser();
  const navLinks = buildNavLinks(PAGE_REGISTRY, user);

  return (
    <Footer
      pages={navLinks}
      onNavigate={router.navigate}
      copyright={`© ${new Date().getFullYear()} ${CONFIG.APP_TITLE}. All rights reserved.`}
    />
  );
};

const router = initRouter(PAGE_REGISTRY, notFoundPage, errorPage, <AppNavbar />, <AppFooter />);

const App = () => (
  <>
    <AlertComposite />
    <AppRouter pages={PAGE_REGISTRY} router={router} />
  </>
);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <StrictMode>
    <Provider store={store}>
      <SessionGate>
        <App />
      </SessionGate>
    </Provider>
  </StrictMode>
);