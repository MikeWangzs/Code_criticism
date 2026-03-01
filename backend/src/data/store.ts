import type { AnalysisTask, FileInfo } from '../models/types.js';

export const fileStore = new Map<string, FileInfo>();
export const taskStore = new Map<string, AnalysisTask>();
export const shareStore = new Map<string, { taskId: string; expireAt: string; url: string }>();
