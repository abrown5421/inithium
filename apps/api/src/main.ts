import 'dotenv/config';
import app from './app';
import { connectDB } from './lib/db';

const PORT = Number(process.env.PORT) || 5000;

async function bootstrap() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`[API] Server running on http://localhost:${PORT}`);
  });
}

bootstrap().catch(console.error);
