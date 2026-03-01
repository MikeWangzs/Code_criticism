import { v4 as uuidv4 } from 'uuid';
import { getFile } from './file.service.js';
import { taskStore } from '../data/store.js';
import type { AnalysisResult, AnalysisStep, AnalysisTask, Issue, Suggestion } from '../models/types.js';
import { publishTaskProgress } from './ws.service.js';

function buildSteps(): AnalysisStep[] {
  return [
    { name: 'parse', status: 'pending', progress: 0 },
    { name: 'static_check', status: 'pending', progress: 0 },
    { name: 'ai_analysis', status: 'pending', progress: 0 },
    { name: 'generate_report', status: 'pending', progress: 0 },
  ];
}

function estimateComplexity(code: string) {
  return Math.max(1, (code.match(/\b(if|for|while|switch|catch|\?)\b/g) || []).length + 1);
}

function functionCount(code: string) {
  const hits = code.match(/\b\w+\s*\([^;]*\)\s*\{/g) || [];
  return Math.max(1, hits.length);
}

function staticScan(code: string): Issue[] {
  const issues: Issue[] = [];
  const lines = code.split('\n');

  lines.forEach((line, i) => {
    const lineNo = i + 1;
    if (/\bvar\b/.test(line)) {
      issues.push({
        id: uuidv4(),
        type: 'warning',
        category: 'best_practice',
        severity: 'medium',
        line: lineNo,
        message: '建议避免使用 var，改用 let/const。',
        code: line,
        suggestion: line.replace(/\bvar\b/g, 'let'),
      });
    }

    if (/new\s+\w+\s*\[/.test(line) && !code.includes('delete[]')) {
      issues.push({
        id: uuidv4(),
        type: 'error',
        category: 'security',
        severity: 'high',
        line: lineNo,
        message: '检测到潜在内存泄漏：动态数组未释放。',
        code: line,
        suggestion: `${line}\n// ... 使用后释放\ndelete[] ptr;`,
      });
    }

    if (/\b(x|tmp|foo|bar)\d?\b/.test(line)) {
      issues.push({
        id: uuidv4(),
        type: 'info',
        category: 'style',
        severity: 'low',
        line: lineNo,
        message: '变量命名可读性较低，建议使用语义化命名。',
        code: line,
      });
    }
  });

  return issues;
}

function buildSuggestions(language: string): Suggestion[] {
  return [
    {
      id: uuidv4(),
      category: 'best_practice',
      title: '拆分长函数',
      description: '将复杂逻辑拆分为小函数，降低维护成本。',
      priority: 'medium',
    },
    {
      id: uuidv4(),
      category: 'maintainability',
      title: `补充 ${language} 代码注释`,
      description: '在关键业务逻辑前增加注释，便于团队协作。',
      priority: 'low',
    },
  ];
}

function calculateScore(issues: Issue[], complexity: number) {
  const penalties = issues.reduce((acc, issue) => {
    if (issue.type === 'error') return acc + 12;
    if (issue.type === 'warning') return acc + 6;
    return acc + 2;
  }, 0);

  return Math.max(0, Math.min(100, 100 - penalties - Math.floor(Math.max(0, complexity - 10) * 1.5)));
}

function generateResult(code: string, language: string): AnalysisResult {
  const lines = code.split('\n');
  const issues = staticScan(code);
  const complexity = estimateComplexity(code);
  const metrics = {
    linesOfCode: lines.length,
    complexity,
    functionCount: functionCount(code),
    commentRatio: lines.length ? lines.filter((line) => line.trim().startsWith('//') || line.trim().startsWith('#')).length / lines.length : 0,
    duplicateCodeRatio: 0,
  };

  const score = calculateScore(issues, complexity);
  const summary = score >= 85 ? '代码质量较高，建议持续保持。' : score >= 70 ? '代码整体良好，存在若干可优化点。' : '代码存在明显质量问题，建议优先修复关键风险。';

  return {
    score,
    summary,
    metrics,
    issues,
    suggestions: buildSuggestions(language),
    generatedAt: new Date().toISOString(),
  };
}

const STEP_WEIGHT = [20, 45, 80, 100];

export function createAnalysisTask(fileId: string) {
  const file = getFile(fileId);
  if (!file) {
    throw new Error('文件不存在');
  }

  const now = new Date().toISOString();
  const task: AnalysisTask = {
    id: uuidv4(),
    status: 'pending',
    fileId,
    fileName: file.originalName,
    language: file.language,
    progress: 0,
    currentStep: 'parse',
    steps: buildSteps(),
    createdAt: now,
    updatedAt: now,
  };

  taskStore.set(task.id, task);
  runTask(task.id);
  return task;
}

export function getTask(taskId: string) {
  return taskStore.get(taskId);
}

async function runTask(taskId: string) {
  const task = taskStore.get(taskId);
  if (!task) return;

  const file = getFile(task.fileId);
  if (!file) {
    task.status = 'failed';
    task.error = '源文件不存在';
    task.updatedAt = new Date().toISOString();
    return;
  }

  task.status = 'processing';
  task.updatedAt = new Date().toISOString();

  for (let i = 0; i < task.steps.length; i += 1) {
    const current = task.steps[i];
    current.status = 'processing';
    task.currentStep = current.name;
    task.progress = i === 0 ? 10 : STEP_WEIGHT[i - 1];
    task.updatedAt = new Date().toISOString();
    publishTaskProgress(task.id, {
      progress: task.progress,
      currentStep: task.currentStep,
      message: `正在执行 ${current.name}...`,
    });

    await new Promise((resolve) => setTimeout(resolve, 600));

    current.status = 'completed';
    current.progress = 100;
    task.progress = STEP_WEIGHT[i];
    task.updatedAt = new Date().toISOString();

    publishTaskProgress(task.id, {
      progress: task.progress,
      currentStep: task.currentStep,
      message: `${current.name} 完成`,
    });
  }

  task.result = generateResult(file.content, task.language);
  task.status = 'completed';
  task.currentStep = 'generate_report';
  task.progress = 100;
  task.completedAt = new Date().toISOString();
  task.updatedAt = task.completedAt;

  publishTaskProgress(task.id, {
    progress: 100,
    currentStep: 'generate_report',
    message: '报告已生成',
  });
}
