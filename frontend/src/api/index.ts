import client from './client';
import type { AnalysisResult, AnalysisTaskStatus, BatchUploadResponse, UploadResponse } from '../types';

export async function uploadCodeText(payload: { code: string; language?: string; fileName?: string }) {
  const res = await client.post('/upload/text', payload);
  return res.data as UploadResponse;
}

export async function uploadCodeFile(file: File, language?: string) {
  const form = new FormData();
  form.append('file', file);
  if (language) form.append('language', language);
  const res = await client.post('/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } });
  return res.data as UploadResponse;
}

export async function uploadCodeFolder(files: File[], language?: string) {
  const form = new FormData();
  files.forEach((file) => form.append('files', file));
  if (language) form.append('language', language);
  const res = await client.post('/upload/batch', form, { headers: { 'Content-Type': 'multipart/form-data' } });
  return res.data as BatchUploadResponse;
}

export async function createAnalysisTask(fileId: string, fileIds?: string[]) {
  const payload: { fileId?: string; fileIds?: string[]; options: { includeStaticAnalysis: boolean; includeAIAnalysis: boolean; strictMode: boolean } } = {
    options: { includeStaticAnalysis: true, includeAIAnalysis: true, strictMode: false },
  };
  if (fileIds?.length) {
    payload.fileIds = fileIds;
  } else {
    payload.fileId = fileId;
  }
  const res = await client.post('/analysis', payload);
  return res.data as { taskId: string; status: string };
}

export async function getAnalysisStatus(taskId: string) {
  const res = await client.get(`/analysis/${taskId}/status`);
  return res.data as AnalysisTaskStatus;
}

export async function getAnalysisResult(taskId: string) {
  const res = await client.get(`/analysis/${taskId}/result`);
  return res.data as { taskId: string; status: string; result: AnalysisResult };
}

export async function exportMarkdown(taskId: string) {
  return client.post(`/report/${taskId}/export`, { format: 'markdown' }, { responseType: 'text' });
}

export async function shareReport(taskId: string) {
  const res = await client.post(`/report/${taskId}/share`, { expireDays: 7 });
  return res.data as { shareUrl: string; expireAt: string };
}

export async function getLanguages() {
  const res = await client.get('/languages');
  return res.data.languages as Array<{ id: string; name: string }>;
}
