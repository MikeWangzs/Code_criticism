import fs from 'node:fs/promises';
import path from 'node:path';
import { v4 as uuidv4 } from 'uuid';
import type { FileInfo } from '../models/types.js';
import { fileStore } from '../data/store.js';
import { MAX_FILE_SIZE } from '../config/constants.js';
import { detectLanguage } from './language.service.js';

const UPLOAD_DIR = process.env.UPLOAD_DIR ?? 'uploads';

type SaveFileArgs = {
  originalName: string;
  mimeType: string;
  size: number;
  content: string;
  language?: string;
};

async function persistFile(args: SaveFileArgs) {
  if (args.size > MAX_FILE_SIZE) {
    throw new Error(`文件大小超过限制: 最大 ${MAX_FILE_SIZE} 字节`);
  }

  const id = uuidv4();
  const fileName = `${id}${path.extname(args.originalName || '.txt')}`;
  const filePath = path.join(UPLOAD_DIR, fileName);

  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  await fs.writeFile(filePath, args.content, 'utf8');

  const language = args.language || detectLanguage({ fileName: args.originalName, code: args.content }).language;

  const fileInfo: FileInfo = {
    id,
    fileName,
    originalName: args.originalName,
    language,
    fileSize: args.size,
    mimeType: args.mimeType,
    content: args.content,
    path: filePath,
    uploadedAt: new Date().toISOString(),
  };

  fileStore.set(id, fileInfo);
  return fileInfo;
}

export async function saveUploadedFile(args: SaveFileArgs) {
  return persistFile(args);
}

export async function saveUploadedFiles(files: SaveFileArgs[]) {
  const saved: FileInfo[] = [];
  for (const file of files) {
    saved.push(await persistFile(file));
  }
  return saved;
}

export function createCombinedFileFromIds(fileIds: string[]) {
  const sourceFiles = fileIds.map((id) => fileStore.get(id)).filter((f): f is FileInfo => Boolean(f));
  if (sourceFiles.length === 0) {
    throw new Error('未找到可分析的文件');
  }

  const mergedContent = sourceFiles
    .map((file) => `// ===== FILE: ${file.originalName} =====\n${file.content}`)
    .join('\n\n');

  const size = Buffer.byteLength(mergedContent, 'utf8');
  if (size > MAX_FILE_SIZE) {
    throw new Error(`文件大小超过限制: 最大 ${MAX_FILE_SIZE} 字节`);
  }

  const id = uuidv4();
  const fileInfo: FileInfo = {
    id,
    fileName: `${id}.txt`,
    originalName: 'batch-merged.txt',
    mimeType: 'text/plain',
    content: mergedContent,
    fileSize: size,
    language: 'mixed',
    uploadedAt: new Date().toISOString(),
  };

  fileStore.set(id, fileInfo);
  return fileInfo;
}

export function getFile(fileId: string) {
  return fileStore.get(fileId);
}
