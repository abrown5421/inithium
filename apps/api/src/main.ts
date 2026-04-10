  import 'dotenv/config';
  import express from 'express';
  import { connectDB } from '@inithium/api-core';
  import { usersRouter } from '@inithium/api-collections';

  const host = process.env.HOST ?? 'localhost';
  const port = process.env.PORT ? Number(process.env.PORT) : 3000;
  const mongoUri = process.env.MONGO_URI!;

  const app = express();

  app.use(express.json());

  app.get('/', (_req, res) => {
    res.json({ message: 'Hello API' });
  });

  app.use('/users', usersRouter);

  async function bootstrap() {
    await connectDB(mongoUri);

    app.listen(port, host, () => {
      console.log(`[ ready ] http://${host}:${port}`);
    });
  }

  bootstrap();