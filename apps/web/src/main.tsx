import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from '@inithium/store';
import { AppRouter } from '@inithium/router'; 
import { Navbar } from '@inithium/ui';
import './styles.css'; 
import 'animate.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <StrictMode>
    <Provider store={store}>
      <Navbar />
      <AppRouter />
    </Provider>
  </StrictMode>
);