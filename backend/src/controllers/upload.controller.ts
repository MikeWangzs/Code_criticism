import type { Request, Response } from 'express';
import { ok } from '../utils/response.js';
import { saveUploadedFile, saveUploadedFiles } from '../services/file.service.js';

export async function uploadFile(req: Request, res: Response) {
  const file = req.file;
  if (!file) {
    throw new Error('缺少文件');
  }

  const content = file.buffer.toString('utf8');
  const language = typeof req.body.language === 'string' ? req.body.language : undefined;
  const saved = await saveUploadedFile({
    originalName: file.originalname,
    mimeType: file.mimetype,
    size: file.size,
    content,
    language,
  });

  res.json(
    ok({
      fileId: saved.id,
      fileName: saved.originalName,
      language: saved.language,
      fileSize: saved.fileSize,
      uploadedAt: saved.uploadedAt,
    }),
  );
}

export async function uploadText(req: Request, res: Response) {
  const { code, language, fileName } = req.body as { code?: string; language?: string; fileName?: string };
  if (!code || typeof code !== 'string') {
    throw new Error('缺少 code 文本');
  }

  const saved = await saveUploadedFile({
    originalName: fileName || 'snippet.txt',
    mimeType: 'text/plain',
    size: Buffer.byteLength(code, 'utf8'),
    content: code,
    language,
  });

  res.json(
    ok({
      fileId: saved.id,
      fileName: saved.originalName,
      language: saved.language,
      fileSize: saved.fileSize,
      uploadedAt: saved.uploadedAt,
    }),
  );
}

export async function uploadBatch(req: Request, res: Response) {
  const files = (req.files as Express.Multer.File[]) || [];
  if (!files.length) {
    throw new Error('缺少文件');
  }

  const language = typeof req.body.language === 'string' ? req.body.language : undefined;
  const saved = await saveUploadedFiles(
    files.map((file) => ({
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      content: file.buffer.toString('utf8'),
      language,
    })),
  );

  res.json(
    ok({
      total: saved.length,
      fileIds: saved.map((file) => file.id),
      files: saved.map((file) => ({
        fileId: file.id,
        fileName: file.originalName,
        language: file.language,
        fileSize: file.fileSize,
        uploadedAt: file.uploadedAt,
      })),
    }),
  );
}
