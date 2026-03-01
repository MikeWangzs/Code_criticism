import { Router } from 'express';
import multer from 'multer';
import { uploadBatch, uploadFile, uploadText } from '../controllers/upload.controller.js';
import { createTask, getTaskResult, getTaskStatus } from '../controllers/analysis.controller.js';
import { aiCritic } from '../controllers/ai-critic.controller.js';
import { exportReport, shareReport } from '../controllers/report.controller.js';
import { detect, listLanguages } from '../controllers/language.controller.js';
import { config, health } from '../controllers/system.controller.js';
import { MAX_FILE_SIZE } from '../config/constants.js';
import { asyncHandler } from '../utils/async-handler.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
});

export function buildApiRouter() {
  const router = Router();

  router.post('/upload', upload.single('file'), asyncHandler(uploadFile));
  router.post('/upload/batch', upload.array('files', 200), asyncHandler(uploadBatch));
  router.post('/upload/text', asyncHandler(uploadText));

  router.post('/analysis', createTask);
  router.post('/analysis/ai-critic', asyncHandler(aiCritic));
  router.get('/analysis/:taskId/status', getTaskStatus);
  router.get('/analysis/:taskId/result', getTaskResult);

  router.post('/report/:taskId/export', asyncHandler(exportReport));
  router.post('/report/:taskId/share', asyncHandler(shareReport));

  router.get('/languages', listLanguages);
  router.post('/languages/detect', detect);

  router.get('/health', health);
  router.get('/config', config);

  return router;
}
