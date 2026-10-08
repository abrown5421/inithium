import { StrictMode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import * as ReactDOM from 'react-dom/client';
import { UiProvider } from '@inithium/shared-ui-components';
import { App } from './app/app.component';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <StrictMode>
    <UiProvider>
      <BrowserRouter>
        <App/>
      </BrowserRouter>
    </UiProvider>
  </StrictMode>
);