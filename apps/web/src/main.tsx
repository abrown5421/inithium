import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { router, AppRouter } from '@inithium/router';
import { store } from '@inithium/store';
import { PAGE_REGISTRY } from '@inithium/pages';
import { Navbar } from '@inithium/ui';
import './styles.css';
import 'animate.css';

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

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <StrictMode>
    <Provider store={store}>
      <Navbar
        pages={getNavLinks(PAGE_REGISTRY)}
        isAuthenticated={false}
        onNavigate={router.navigate}
        onLoginClick={() => router.navigate('/auth/login')}
        logo={{
          imageSrc: CONFIG.LOGO_URL,
          title: CONFIG.APP_TITLE,
        }}
      />
      <AppRouter />
    </Provider>
  </StrictMode>
);