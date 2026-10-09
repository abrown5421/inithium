import { StrictMode } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import * as ReactDOM from 'react-dom/client';
import { createAppStore } from '@inithium/shared-data-access';
import { UiProvider } from '@inithium/shared-ui-components';
import { DocsLayout } from './app/layout/docs-layout.component';

// The developer manual viewer (decision 0053). Local only; never part of a client repo.

// The same store the apps use, so live examples can show global state such as modals (decision 0065).
const store = createAppStore();

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <StrictMode>
    <Provider store={store}>
      <UiProvider>
        <BrowserRouter>
          <Routes>
            <Route path="*" element={<DocsLayout />} />
          </Routes>
        </BrowserRouter>
      </UiProvider>
    </Provider>
  </StrictMode>,
);
