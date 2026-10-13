import { useMemo } from 'react';
import { matchPath, Route, Routes, useHref, useLocation, useNavigate } from 'react-router-dom';
import { logoImage, userDisplayName } from '@inithium/shared-contracts';
import { useGetCurrentUserQuery, useGetSiteQuery, useLogoutMutation } from '@inithium/shared-data-access';
import { hasPermission } from '@inithium/shared-permissions';
import { Container, Text } from '@inithium/shared-ui-components';
import { SidebarLayout, type SidebarItem } from '@inithium/shared-ui-layouts';
import { defaultLogo } from '@inithium/shared-ui-theme';
import type { CmsScreen } from './cms-screen.types';

export type CmsShellProps = {
  /** The CMS's screens, in sidebar order. Each becomes a route and a sidebar entry. */
  screens: CmsScreen[];
};

/**
 * The signed-in CMS (decision 0086): the SidebarLayout frame with the site's title, the user's account menu and an
 * entry per screen they may see, routing to each screen. Render it inside CmsAccessGuard.
 */
export function CmsShell({ screens }: CmsShellProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: user } = useGetCurrentUserQuery();
  const { data: site } = useGetSiteQuery();
  const [logout] = useLogoutMutation();

  // Sidebar links are real addresses (with the CMS's base, e.g. /cms/pages); the router works without it.
  const base = useHref('/').replace(/\/$/, '');
  const toHref = (path: string) => base + (path.startsWith('/') ? path : `/${path}`);
  const toPath = (href: string) => href.slice(base.length) || '/';

  const allowed = useMemo(
    () => screens.filter((screen) => !screen.permission || (user && hasPermission(user.role, screen.permission))),
    [screens, user],
  );
  const items: SidebarItem[] = allowed
    .filter((screen) => screen.inSidebar !== false)
    .map((screen) => ({
      label: screen.label,
      icon: screen.icon,
      href: toHref(screen.path),
      exact: screen.path === '/',
    }));

  // Full-screen screens (e.g. the content editor) fill the space under the top bar.
  const fill = allowed.some((screen) => screen.fill && matchPath(screen.path, location.pathname));

  return (
    <SidebarLayout
      fill={fill}
      title={site?.settings.siteTitle ?? 'CMS'}
      logo={site ? (site.settings.logo ? logoImage(site.settings.logo) : defaultLogo) : undefined}
      homeHref={toHref('/')}
      items={items}
      currentPath={toHref(location.pathname)}
      onNavigate={(href) => navigate(toPath(href))}
      user={user ? { name: userDisplayName(user), avatar: user.profile.avatar } : undefined}
      onLogout={() => void logout()}
    >
      <Routes>
        {allowed.map((screen) => (
          <Route key={screen.path} path={screen.path} element={screen.element} />
        ))}
        <Route
          path="*"
          element={
            <Container flex={{ direction: 'column', gap: 8 }}>
              <Text as="h1" fontFamily="display" fontSize={28}>
                Not found
              </Text>
              <Text as="p">There’s no CMS screen at this address.</Text>
            </Container>
          }
        />
      </Routes>
    </SidebarLayout>
  );
}
