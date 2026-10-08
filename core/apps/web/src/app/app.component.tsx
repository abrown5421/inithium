import { Route, Routes } from 'react-router-dom';
import { Container, Text } from '@inithium/shared-ui-components';
import { UiGallery } from './ui-gallery/ui-gallery.component';

function Home() {
  return (
    <Container as="main" minHeight="screen" flex={{ direction: 'column', align: 'center', justify: 'center', gap: 8 }}>
      <Text as="h1" fontFamily="display" fontSize={32} textColor="primary">
        Inithium Web
      </Text>
      {import.meta.env.DEV && (
        <Text textColor={{ color: 'surface', intensity: 700 }}>
          Development: the UI gallery is at <a href="/ui">/ui</a>.
        </Text>
      )}
    </Container>
  );
}

export function App() {
  return (
    <Routes>
      {/* The UI gallery is development-only; production builds leave it out. */}
      {import.meta.env.DEV && <Route path="/ui/*" element={<UiGallery />} />}
      <Route path="*" element={<Home />} />
    </Routes>
  );
}
