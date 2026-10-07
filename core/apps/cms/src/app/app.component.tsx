import { Route, Routes } from 'react-router-dom';
import { CmsAccessGuard, CurrentUserMenu, LoginPage } from '@inithium/cms-auth';

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="*"
        element={
          <CmsAccessGuard>
            <div className="min-h-screen">
              <header className="flex items-center justify-end border-b px-6 py-3">
                <CurrentUserMenu />
              </header>
              <main className="flex items-center justify-center py-24">
                <h1 className="text-2xl font-semibold">Inithium CMS</h1>
              </main>
            </div>
          </CmsAccessGuard>
        }
      />
    </Routes>
  );
}
