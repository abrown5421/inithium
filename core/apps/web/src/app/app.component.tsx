import { Route, Routes } from 'react-router-dom';
import { ThemePreview } from './theme-preview.component';

export function App() {
  return (
    <Routes>
      <Route path="*" element={<ThemePreview />} />
    </Routes>
  );
}
