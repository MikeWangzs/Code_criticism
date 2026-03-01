import { Router } from 'express';
import multer from 'multer';
import { uploadBatch, uploadFile, uploadText } from '../controllers/upload.controller.js';
import { createTask, getTaskResult, getTaskStatus } from '../controllers/analysis.controller.js';
import { exportReport, shareReport } from '../controllers/report.controller.js';
import { detect, listLanguages } from '../controllers/language.controller.js';
import { config, health } from '../controllers/system.controller.js';
import { MAX_FILE_SIZE } from '../config/constants.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
});

export function buildApiRouter() {
  const router = Router();

  router.post('/upload', upload.single('file'), uploadFile);
  router.post('/upload/batch', upload.array('files', 200), uploadBatch);
  router.post('/upload/text', uploadText);

  router.post('/analysis', createTask);
  router.get('/analysis/:taskId/status', getTaskStatus);
  router.get('/analysis/:taskId/result', getTaskResult);

  router.post('/report/:taskId/export', exportReport);
  router.post('/report/:taskId/share', shareReport);

  router.get('/languages', listLanguages);
  router.post('/languages/detect', detect);

  router.get('/health', health);
  router.get('/config', config);

  return router;
}
