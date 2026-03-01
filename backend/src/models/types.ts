export type TaskStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type StepStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface AnalysisStep {
  name: 'parse' | 'static_check' | 'ai_analysis' | 'generate_report';
  status: StepStatus;
  progress: number;
  message?: string;
}

export interface Issue {
  id: string;
  type: 'error' | 'warning' | 'info';
  category: 'style' | 'performance' | 'security' | 'maintainability' | 'best_practice';
  severity: 'low' | 'medium' | 'high' | 'critical';
  line: number;
  column?: number;
  message: string;
  code?: string;
  suggestion?: string;
  explanation?: string;
}

export interface Suggestion {
  id: string;
  category: string;
  title: string;
  description: string;
  example?: string;
  priority: 'low' | 'medium' | 'high';
}

export interface CodeMetrics {
  linesOfCode: number;
  complexity: number;
  functionCount: number;
  commentRatio: number;
  duplicateCodeRatio?: number;
}

export interface AIIssue {
  id: string;
  level: 'fatal' | 'major' | 'minor';
  title: string;
  lineHint?: string;
  roast: string;
  fix: string;
}

export interface AIAnalysisResult {
  model: string;
  strictScore: number;
  summary: string;
  openingRoast: string;
  issues: AIIssue[];
  finalVerdict: string;
}

export interface AnalysisResult {
  score: number;
  summary: string;
  metrics: CodeMetrics;
  issues: Issue[];
  suggestions: Suggestion[];
  aiAnalysis?: AIAnalysisResult;
  generatedAt: string;
}

export interface FileInfo {
  id: string;
  fileName: string;
  originalName: string;
  language: string;
  fileSize: number;
  mimeType: string;
  content: string;
  path?: string;
  uploadedAt: string;
}

export interface AnalysisTask {
  id: string;
  status: TaskStatus;
  fileId: string;
  fileName: string;
  language: string;
  progress: number;
  currentStep: AnalysisStep['name'];
  steps: AnalysisStep[];
  result?: AnalysisResult;
  error?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}
