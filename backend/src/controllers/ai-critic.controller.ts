import type { Request, Response } from 'express';
import { ok } from '../utils/response.js';
import { getFile } from '../services/file.service.js';
import { runAICritic } from '../services/ai-critic.service.js';

export async function aiCritic(req: Request, res: Response) {
  const { code, language, fileId } = req.body as { code?: string; language?: string; fileId?: string };

  let targetCode = code;
  let targetLanguage = language;

  if (!targetCode && fileId) {
    const file = getFile(fileId);
    if (!file) {
      throw new Error('fileId 对应文件不存在');
    }
    targetCode = file.content;
    targetLanguage = targetLanguage || file.language;
  }

  if (!targetCode) {
    throw new Error('缺少 code 或 fileId');
  }

  const result = await runAICritic({
    code: targetCode,
    language: targetLanguage,
  });

  res.json(ok(result));
}
