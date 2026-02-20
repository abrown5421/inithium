import { createApp } from 'vue';
import App from './app/App.vue';
import { router } from './router';

async function bootstrap() {
  const app = createApp(App);
  app.use(router);
  app.mount('#app');
}

bootstrap();
