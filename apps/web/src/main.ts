import { createApp } from 'vue';
import App from './app/App.vue';
import { router } from './router';
import { useAuth } from '@inithium/auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

async function bootstrap() {
  const app = createApp(App);
  app.use(router);

  const { initializeAuth } = useAuth(API_URL);
  await initializeAuth();

  app.mount('#app');
}

bootstrap();
