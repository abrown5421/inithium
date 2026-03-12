import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { DbConnectionGuard } from './components/DbConnectionGuard';
import App from './app';
import { AuthInitializer } from './components/AuthInitializer';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <DbConnectionGuard>
        <AuthInitializer>
          <App />
        </AuthInitializer>
      </DbConnectionGuard>
    </Provider>
  </React.StrictMode>
);