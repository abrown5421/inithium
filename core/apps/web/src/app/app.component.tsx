import { Route, Routes } from 'react-router-dom';
import { Container, Text } from '@inithium/shared-ui-components';

function Home() {
  return (
    <Container as="main" minHeight="screen" flex={{ direction: 'column', align: 'center', justify: 'center', gap: 8 }}>
      <Text as="h1" fontFamily="display" fontSize={32} textColor="primary">
        Inithium Web
      </Text>
      {import.meta.env.DEV && (
        <Text textColor={{ color: 'surface', intensity: 700 }}>
          Development: the developer manual runs at <a href="http://localhost:5175">localhost:5175</a> (npx nx serve docs).
        </Text>
      )}
    </Container>
  );
}

export function App() {
  return (
    <Routes>
      <Route path="*" element={<Home />} />
    </Routes>
  );
}
