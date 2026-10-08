import { StrictMode } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import * as ReactDOM from 'react-dom/client';
import { UiProvider } from '@inithium/shared-ui-components';
import { DocsLayout } from './app/layout/docs-layout.component';

// The developer manual viewer (decision 0053). Local only; never part of a client repo.

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <StrictMode>
    <UiProvider>
      <BrowserRouter>
        <Routes>
          <Route path="*" element={<DocsLayout />} />
        </Routes>
      </BrowserRouter>
    </UiProvider>
  </StrictMode>,
);
