import { v4 as uuidv4 } from 'uuid';
import type { Request, Response } from 'express';
import { ok } from '../utils/response.js';
import { getTask } from '../services/analysis.service.js';
import { toMarkdown } from '../services/report.service.js';
import { shareStore } from '../data/store.js';

export function exportReport(req: Request, res: Response) {
  const task = getTask(req.params.taskId);
  if (!task || !task.result) {
    res.status(404).json({ code: 404, message: '报告不存在', data: null });
    return;
  }

  const format = (req.body?.format as string | undefined)?.toLowerCase() || 'markdown';

  if (format === 'markdown') {
    res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
    res.send(toMarkdown(task));
    return;
  }

  if (format === 'json') {
    res.json(ok({ taskId: task.id, report: task.result }));
    return;
  }

  if (format === 'pdf') {
    const fallback = toMarkdown(task);
    res.setHeader('Content-Type', 'application/pdf');
    res.send(Buffer.from(`Pseudo PDF\n\n${fallback}`, 'utf8'));
    return;
  }

  res.status(400).json({ code: 400, message: '不支持的导出格式', data: null });
}

export function shareReport(req: Request, res: Response) {
  const task = getTask(req.params.taskId);
  if (!task || !task.result) {
    res.status(404).json({ code: 404, message: '报告不存在', data: null });
    return;
  }

  const shareId = uuidv4();
  const days = Number(req.body?.expireDays ?? 7);
  const expireAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
  const url = `${req.protocol}://${req.get('host')}/share/${shareId}`;
  shareStore.set(shareId, { taskId: task.id, expireAt, url });

  res.json(ok({ shareId, shareUrl: url, expireAt }));
}
