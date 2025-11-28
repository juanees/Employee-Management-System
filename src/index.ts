import 'dotenv/config';
import { buildApp } from './app';

async function start() {
  const app = buildApp();
  const port = Number(process.env.PORT ?? 3333);
  const host = process.env.HOST ?? '0.0.0.0';

  try {
    await app.listen({ port, host });
    console.log(`API listening on http://${host}:${port}`);
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

start();
