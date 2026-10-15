import { Route, Routes } from 'react-router-dom';
import { CmsAccessGuard, LoginPage } from '@inithium/cms-auth';
import { ContentEditorScreen } from '@inithium/cms-content-editor';
import { PagesScreen } from '@inithium/cms-pages';
import { MediaScreen } from '@inithium/cms-media';
import { SettingsScreen } from '@inithium/cms-settings';
import { UsersScreen } from '@inithium/cms-users';
import { CmsAlerts, CmsShell, CmsTheme, DashboardPage, type CmsScreen } from '@inithium/cms-shell';

// The CMS's screens, in sidebar order (decision 0086).
const screens: CmsScreen[] = [
  { path: '/', label: 'Dashboard', icon: 'layout-dashboard', element: <DashboardPage /> },
  { path: '/pages', label: 'Pages', icon: 'file-text', element: <PagesScreen />, permission: 'pages.edit' },
  // Reached from Pages: the page builder, full screen under the top bar, with no sidebar entry of its own (0094, 0116).
  {
    path: '/pages/:id/content',
    label: 'Page builder',
    icon: 'layout-template',
    element: <ContentEditorScreen />,
    permission: 'pages.edit',
    inSidebar: false,
    fill: true,
  },
  { path: '/media', label: 'Media', icon: 'images', element: <MediaScreen />, permission: 'assets.upload' },
  { path: '/users', label: 'Users', icon: 'users', element: <UsersScreen />, permission: 'users.view' },
  { path: '/settings', label: 'Settings', icon: 'settings', element: <SettingsScreen />, permission: 'settings.edit' },
];

export function App() {
  return (
    <>
      <CmsTheme />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="*"
          element={
            <CmsAccessGuard>
              <CmsShell screens={screens} />
            </CmsAccessGuard>
          }
        />
      </Routes>
      <CmsAlerts />
    </>
  );
}
