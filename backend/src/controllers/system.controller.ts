import type { Request, Response } from 'express';
import { ok } from '../utils/response.js';
import { MAX_FILE_SIZE } from '../config/constants.js';

export function health(_req: Request, res: Response) {
  res.json(
    ok({
      status: 'healthy',
      version: process.env.APP_VERSION ?? '1.0.0',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        redis: 'connected',
        ai_service: 'available',
      },
    }),
  );
}

export function config(_req: Request, res: Response) {
  res.json(
    ok({
      maxFileSize: MAX_FILE_SIZE,
      supportedFormats: ['.cpp', '.py', '.js', '.java', '.go', '.rs', '.ts'],
      maxAnalysisTime: 120,
      features: {
        staticAnalysis: true,
        aiAnalysis: true,
        batchUpload: true,
      },
    }),
  );
}
