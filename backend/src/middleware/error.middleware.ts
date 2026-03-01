import type { NextFunction, Request, Response } from 'express';
import { fail } from '../utils/response.js';

export function notFound(_req: Request, res: Response) {
  res.status(404).json(fail(404, '资源不存在'));
}

export function errorHandler(error: Error, _req: Request, res: Response, _next: NextFunction) {
  const status = error.message.includes('超过限制') ? 413 : error.message.includes('AI 调用失败') ? 502 : 400;
  res.status(status).json(fail(status, error.message));
}
