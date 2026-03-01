import type { Request, Response } from 'express';
import { ok } from '../utils/response.js';
import { createAnalysisTask, getTask } from '../services/analysis.service.js';
import { createCombinedFileFromIds } from '../services/file.service.js';

export function createTask(req: Request, res: Response) {
  const { fileId, fileIds } = req.body as { fileId?: string; fileIds?: string[] };
  if (!fileId && (!fileIds || !fileIds.length)) {
    throw new Error('缺少 fileId 或 fileIds');
  }

  let targetFileId = fileId;
  if (!targetFileId && fileIds?.length) {
    const merged = createCombinedFileFromIds(fileIds);
    targetFileId = merged.id;
  }

  const task = createAnalysisTask(targetFileId as string);
  res.json(
    ok({
      taskId: task.id,
      status: task.status,
      fileId: targetFileId,
      createdAt: task.createdAt,
      estimatedTime: 30,
    }),
  );
}

export function getTaskStatus(req: Request, res: Response) {
  const task = getTask(req.params.taskId);
  if (!task) {
    res.status(404).json({ code: 404, message: '任务不存在', data: null });
    return;
  }

  res.json(
    ok({
      taskId: task.id,
      status: task.status,
      progress: task.progress,
      currentStep: task.currentStep,
      steps: task.steps,
    }),
  );
}

export function getTaskResult(req: Request, res: Response) {
  const task = getTask(req.params.taskId);
  if (!task) {
    res.status(404).json({ code: 404, message: '任务不存在', data: null });
    return;
  }

  if (task.status !== 'completed' || !task.result) {
    res.status(202).json({ code: 202, message: '分析尚未完成', data: { taskId: task.id, status: task.status } });
    return;
  }

  res.json(ok({ taskId: task.id, status: task.status, result: task.result }));
}
