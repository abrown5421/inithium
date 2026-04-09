import 'dotenv/config';
import express from 'express';
import { connectDB } from '@inithium/api-core';
import { usersRouter } from '@inithium/api-collections';

const host     = process.env.HOST      ?? 'localhost';
const port     = process.env.PORT      ? Number(process.env.PORT) : 3000;
const mongoUri = process.env.MONGO_URI!;

const app = express();

app.use(express.json());

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/', (_req, res) => {
  res.json({ message: 'Hello API' });
});

// ── Collection routes ─────────────────────────────────────────────────────────
// Each router exposes the 8 base CRUD endpoints plus any collection-specific ones.
// To add a new collection: create its model/service/router in api-collections,
// then mount it here with app.use('/collection-name', collectionRouter).
app.use('/users', usersRouter);

// ── Bootstrap ─────────────────────────────────────────────────────────────────
async function bootstrap() {
  await connectDB(mongoUri);

  app.listen(port, host, () => {
    console.log(`[ ready ] http://${host}:${port}`);
  });
}

bootstrap();