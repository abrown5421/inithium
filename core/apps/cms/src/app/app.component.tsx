import { Route, Routes } from 'react-router-dom';

export function App() {
  return (
    <Routes>
      <Route
        path="*"
        element={
          <main className="flex min-h-screen items-center justify-center">
            <h1 className="text-2xl font-semibold">Inithium CMS</h1>
          </main>
        }
      />
    </Routes>
  );
}
