import 'dotenv/config';
import { createApp } from './app';
import { connectDB } from './db/connection';

const PORT = process.env.PORT ?? 3001;

async function bootstrap() {
  try {
    await connectDB();
    const app = createApp();
    app.listen(PORT, () =>
      console.log(`[Server] Listening on http://localhost:${PORT}`),
    );
  } catch (err) {
    console.error('[Server] Failed to start:', err);
    process.exit(1);
  }
}

bootstrap();
