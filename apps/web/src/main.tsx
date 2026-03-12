import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { DbConnectionGuard } from './components/DbConnectionGuard';
import App from './app';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <DbConnectionGuard>
        <App />
      </DbConnectionGuard>
    </Provider>
  </React.StrictMode>
);
