import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useNavigationType } from 'react-router-dom';
import type { SiteBundle, User } from '@inithium/shared-contracts';
import { useAlerts, useGetCurrentUserQuery, useGetSiteQuery, useLogoutMutation } from '@inithium/shared-data-access';
import { Button, Container, Loader, Text } from '@inithium/shared-ui-components';
import { AlertStack, Navbar, type FooterProps } from '@inithium/shared-ui-composites';
import { BareLayout, DefaultLayout } from '@inithium/shared-ui-layouts';
import { buildMenus } from './menus.service';
import { PageSlot, type PageEntry, type PageLayout } from './page-slot.component';
import type { PageTemplate } from './page-template.types';
import { audienceRedirect, resolvePage } from './routes.service';
import { SiteContext, type SiteContextValue } from './site.context';

/**
 * The app's backdrop: pages sit on their own background over it, so each exit fades into it and each entrance
 * out of it. Surface 950 is dark in light mode and, mirrored, light in dark mode.
 */
const BACKDROP = { color: 'surface', intensity: 950 } as const;

/** The layouts pages can use, by key (decision 0079). More arrive as they're built. */
const LAYOUTS: Record<string, PageLayout> = { default: DefaultLayout, bare: BareLayout };

export type SiteShellProps = {
  /** Every page template: core's, then the registry's (a later one replaces an earlier one with the same key). */
  templates: PageTemplate[];
};

/**
 * The `web` app's page system (decisions 0078–0080): loads the site bundle and the session once, then routes every
 * address to its page record, drawn by its template in its layout under a persistent Navbar, with audiences,
 * exit-then-entrance transitions, the Footer, alerts and the document title. Render it inside a router and a
 * Redux store.
 */
export function SiteShell({ templates }: SiteShellProps) {
  const site = useGetSiteQuery();
  const auth = useGetCurrentUserQuery();

  // Keep the last bundle through cache resets (signing out clears every cached response), so the site never blanks.
  const [bundle, setBundle] = useState<SiteBundle | undefined>(site.data);
  if (site.data && site.data !== bundle) setBundle(site.data);
  // Wait for the first answer about the session; after that, a refetch never holds the site back.
  const [sessionKnown, setSessionKnown] = useState(false);
  if (!sessionKnown && (auth.data !== undefined || auth.error !== undefined)) setSessionKnown(true);

  if (!bundle || !sessionKnown) {
    return <StartupScreen failed={site.isError && !bundle} onRetry={() => void site.refetch()} />;
  }
  return <SiteRouter bundle={bundle} user={auth.data ?? null} templates={templates} />;
}

function StartupScreen({ failed, onRetry }: { failed: boolean; onRetry: () => void }) {
  return (
    <Container
      minHeight="screen"
      flex={{ direction: 'column', align: 'center', justify: 'center', gap: 16 }}
      padding={{ all: 24 }}
      bgColor={BACKDROP}
      textColor={{ color: 'surface', intensity: 50 }}
    >
      {failed ? (
        <>
          <Text as="p">We couldn't load the site.</Text>
          <Button variant="outlined" color={{ color: 'surface', intensity: 50 }} onClick={onRetry}>
            Try again
          </Button>
        </>
      ) : (
        <Loader size={40} label="Loading the site" />
      )}
    </Container>
  );
}

type SiteRouterProps = { bundle: SiteBundle; user: User | null; templates: PageTemplate[] };

function SiteRouter({ bundle, user, templates }: SiteRouterProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const navigationType = useNavigationType();
  const { show: showAlert, stackProps } = useAlerts();
  const [logout] = useLogoutMutation();
  const signedIn = user !== null;

  const templatesByKey = useMemo(() => new Map(templates.map((template) => [template.key, template])), [templates]);
  const menus = useMemo(() => buildMenus(bundle.pages, user), [bundle.pages, user]);
  const site = useMemo<SiteContextValue>(() => ({ settings: bundle.settings, pages: bundle.pages, user }), [bundle, user]);

  // The page this address leads to, unless its audience sends the visitor elsewhere first.
  const resolved = useMemo(() => resolvePage(bundle.pages, location.pathname), [bundle.pages, location.pathname]);
  const redirect = resolved ? audienceRedirect(resolved.page, signedIn) : null;
  const from = (location.state as { from?: string } | null)?.from;

  const handledRedirect = useRef<string | null>(null);
  useEffect(() => {
    if (!redirect || handledRedirect.current === location.key) return;
    handledRedirect.current = location.key;
    if (redirect === 'login') {
      showAlert({ message: 'Sign in to view that page.', icon: 'lock' });
      navigate('/login', { replace: true, state: { from: location.pathname + location.search } });
    } else {
      navigate(from ?? '/', { replace: true });
    }
  }, [redirect, location, from, navigate, showAlert]);

  // Transitions (decision 0079): the page on screen plays its exit; when it ends, the latest destination enters.
  const destination: PageEntry | null =
    resolved && !redirect ? { key: location.pathname, locationKey: location.key, resolved, scrollTo: 0 } : null;
  const latest = useRef(destination);
  useEffect(() => {
    latest.current = destination;
  });

  const [current, setCurrent] = useState<PageEntry | null>(() => (destination ? { ...destination, scrollTo: null } : null));
  const [leaving, setLeaving] = useState(false);
  if (!current && destination) setCurrent({ ...destination, scrollTo: null });
  if (current && destination && destination.key !== current.key && !leaving) setLeaving(true);

  // Remember each visit's scroll position as it's left, so back and forward can return to it.
  const scrollPositions = useRef(new Map<string, number>());
  const navigation = useRef(navigationType);
  useEffect(() => {
    navigation.current = navigationType;
  }, [navigationType]);
  const currentLocationKey = current?.locationKey;
  useEffect(() => {
    if (leaving && currentLocationKey) scrollPositions.current.set(currentLocationKey, window.scrollY);
  }, [leaving, currentLocationKey]);
  useEffect(() => {
    window.history.scrollRestoration = 'manual';
  }, []);

  // Stable, reading the latest destination from a ref, so a page that is leaving always swaps to the newest one.
  const finishExit = useCallback(() => {
    const next = latest.current;
    setLeaving(false);
    if (!next) return;
    const back = navigation.current === 'POP' ? scrollPositions.current.get(next.locationKey) : undefined;
    setCurrent({ ...next, scrollTo: back ?? 0 });
  }, []);

  // The document title and description follow the page on screen.
  const shown = current?.resolved.page;
  useEffect(() => {
    if (!shown) return;
    document.title = `${shown.seo.title ?? shown.title} | ${bundle.settings.siteTitle}`;
    let description = document.head.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (shown.seo.description) {
      if (!description) {
        description = document.createElement('meta');
        description.name = 'description';
        document.head.append(description);
      }
      description.content = shown.seo.description;
    } else {
      description?.remove();
    }
  }, [shown, bundle.settings.siteTitle]);

  const handleLogout = async () => {
    // Signed-in-only pages close for good: go Home quietly first.
    if (shown?.audience === 'signed-in') navigate('/');
    await logout();
  };

  const footer: FooterProps = {
    links: menus.primaryFooter,
    secondaryLinks: menus.secondaryFooter,
    copyright: bundle.settings.copyright,
    currentPath: location.pathname,
    onNavigate: (href) => navigate(href),
  };

  const slots = current ? [current] : [];
  if (current && leaving && destination && destination.key !== current.key) slots.push(destination);

  return (
    <SiteContext.Provider value={site}>
      <Container minHeight="screen" flex={{ direction: 'column' }} bgColor={BACKDROP}>
        <Navbar
          title={bundle.settings.siteTitle}
          logo={bundle.settings.logo}
          links={menus.primary}
          userLinks={menus.profile}
          user={user ? { name: user.email } : undefined}
          currentPath={location.pathname}
          onNavigate={(href) => navigate(href)}
          onLogout={() => void handleLogout()}
        />
        <Container position={{ type: 'relative' }} flex={{ direction: 'column' }} flexItem={{ grow: 1 }}>
          {slots.map((entry) => {
            const isCurrent = entry.key === current?.key;
            return (
              <PageSlot
                key={entry.key}
                entry={entry}
                template={templatesByKey.get(entry.resolved.page.template)}
                layout={LAYOUTS[entry.resolved.page.layout] ?? DefaultLayout}
                footer={footer}
                active={isCurrent && !leaving}
                leaving={isCurrent && leaving}
                onExitEnd={isCurrent ? finishExit : undefined}
              />
            );
          })}
        </Container>
      </Container>
      <AlertStack {...stackProps} onNavigate={(href) => navigate(href)} />
    </SiteContext.Provider>
  );
}
