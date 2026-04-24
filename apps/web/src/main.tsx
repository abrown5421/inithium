import { StrictMode, useEffect, useState } from 'react';
import * as ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { AppRouter, initRouter } from '@inithium/router';
import { store, useCurrentUser } from '@inithium/store';
import { authApi } from '@inithium/store';
import { PAGE_REGISTRY } from '@inithium/pages';
import { Navbar, NavbarUser } from '@inithium/ui';
import './styles.css';
import 'animate.css';
import { User } from '@inithium/types';

const CONFIG = Object.freeze({
  LOGO_URL: import.meta.env.VITE_LOGO_URL,
  APP_TITLE: 'Inithium',
});

const getNavLinks = (registry: typeof PAGE_REGISTRY) =>
  registry
    .filter((p) => !!p.navigation)
    .map((p) => ({
      type: 'link' as const,
      path: p.path,
      label: p.navigation!.label,
    }));

const router = initRouter(PAGE_REGISTRY);

const mapToNavbarUser = (user: User | null | undefined): NavbarUser | undefined => {
  if (!user) return undefined;

  const { first_name, last_name, user_avatar } = user;

  return {
    initials: `${first_name?.[0] ?? ''}${last_name?.[0] ?? ''}`.toUpperCase(),
    src: (user as any).avatar_url,
    gradient: user_avatar?.gradient,
  };
};

const SessionGate = ({ children }: { children: React.ReactNode }) => {
  const [ready, setReady] = useState(false);
  const [refresh] = authApi.useRefreshMutation();

  useEffect(() => {
    refresh()
      .unwrap()
      .catch(() => {
      })
      .finally(() => {
        setReady(true);
      });
  }, []);

  if (!ready) return null;
  return <>{children}</>;
};

const App = () => {
  const { user, isAuthenticated } = useCurrentUser();
 
  useEffect(() => {console.log(user)}, [user])
  return (
    <>
      <Navbar
        pages={getNavLinks(PAGE_REGISTRY)}
        isAuthenticated={isAuthenticated}
        user={mapToNavbarUser(user)}
        onNavigate={router.navigate}
        onLoginClick={() => router.navigate('/auth/login')}
        logo={{
          imageSrc: CONFIG.LOGO_URL,
          title: CONFIG.APP_TITLE,
        }}
      />
      <AppRouter pages={PAGE_REGISTRY} router={router} />
    </>
  );
};

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