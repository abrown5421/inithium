import { Route, Routes } from 'react-router-dom';
import { CmsAccessGuard, LoginPage } from '@inithium/cms-auth';
import { ContentEditorScreen } from '@inithium/cms-content-editor';
import { PagesScreen } from '@inithium/cms-pages';
import { SettingsScreen } from '@inithium/cms-settings';
import { CmsAlerts, CmsShell, CmsTheme, DashboardPage, type CmsScreen } from '@inithium/cms-shell';

// The CMS's screens, in sidebar order (decision 0086).
const screens: CmsScreen[] = [
  { path: '/', label: 'Dashboard', icon: 'layout-dashboard', element: <DashboardPage /> },
  { path: '/pages', label: 'Pages', icon: 'file-text', element: <PagesScreen />, permission: 'pages.edit' },
  { path: '/settings', label: 'Settings', icon: 'settings', element: <SettingsScreen />, permission: 'settings.edit' },
];

export function App() {
  return (
    <>
      <CmsTheme />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        {/* The content editor is full screen, outside the sidebar frame (decision 0093). */}
        <Route
          path="/pages/:id/content"
          element={
            <CmsAccessGuard>
              <ContentEditorScreen />
            </CmsAccessGuard>
          }
        />
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
