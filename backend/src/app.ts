import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { buildApiRouter } from './routes/index.js';
import { errorHandler, notFound } from './middleware/error.middleware.js';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: '1mb' }));

  app.use('/api/v1', buildApiRouter());
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
