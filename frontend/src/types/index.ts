export type TaskStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface UploadResponse {
  fileId: string;
  fileName: string;
  language: string;
  fileSize: number;
  uploadedAt: string;
}

export interface BatchUploadResponse {
  total: number;
  fileIds: string[];
  files: UploadResponse[];
}

export interface AnalysisTaskStatus {
  taskId: string;
  status: TaskStatus;
  progress: number;
  currentStep: string;
  steps: Array<{ name: string; status: string; progress: number }>;
}

export interface Issue {
  id: string;
  type: 'error' | 'warning' | 'info';
  category: string;
  severity: string;
  line: number;
  message: string;
  code?: string;
  suggestion?: string;
}

export interface AnalysisResult {
  score: number;
  summary: string;
  metrics: {
    linesOfCode: number;
    complexity: number;
    functionCount: number;
    commentRatio: number;
  };
  issues: Issue[];
  suggestions: Array<{ id: string; title: string; description: string; priority: string }>;
  generatedAt: string;
}
