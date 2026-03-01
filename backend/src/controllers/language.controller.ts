import type { Request, Response } from 'express';
import { ok } from '../utils/response.js';
import { detectLanguage, getLanguages } from '../services/language.service.js';

export function listLanguages(_req: Request, res: Response) {
  res.json(ok({ languages: getLanguages() }));
}

export function detect(req: Request, res: Response) {
  const { code, fileName } = req.body as { code?: string; fileName?: string };
  res.json(ok(detectLanguage({ code, fileName })));
}
