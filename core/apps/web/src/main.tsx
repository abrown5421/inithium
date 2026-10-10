import { StrictMode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import * as ReactDOM from 'react-dom/client';
import { createAppStore } from '@inithium/shared-data-access';
import { UiProvider } from '@inithium/shared-ui-components';
import { App } from './app/app.component';

const store = createAppStore();

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <StrictMode>
    <Provider store={store}>
      <UiProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </UiProvider>
    </Provider>
  </StrictMode>,
);
