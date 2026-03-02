import type { AnalysisTask } from '../models/types.js';

export function toMarkdown(task: AnalysisTask) {
  if (!task.result) return '# 报告未生成';

  const { result } = task;
  const issueRows = result.issues
    .map((issue) => `- [${issue.type.toUpperCase()}] 第 ${issue.line} 行: ${issue.message}`)
    .join('\n');

  const suggestRows = result.suggestions
    .map((item) => `- ${item.title}: ${item.description}`)
    .join('\n');

  const aiSummaryRows = result.aiAnalysis
    ? [
        `- 模型: ${result.aiAnalysis.model}`,
        `- 严格评分: ${result.aiAnalysis.strictScore}/100`,
        `- 总结: ${result.aiAnalysis.summary}`,
      ].join('\n')
    : '- 本次未生成 AI 评价';

  const aiIssueRows = result.aiAnalysis
    ? result.aiAnalysis.issues
        .map(
          (issue, index) =>
            `${index + 1}. [${issue.level.toUpperCase()}] ${issue.title}${issue.lineHint ? ` (${issue.lineHint})` : ''}\n   - 吐槽: ${issue.roast}\n   - 修复: ${issue.fix}`,
        )
        .join('\n')
    : '- 无';

  const aiVerdictRows = result.aiAnalysis ? result.aiAnalysis.finalVerdict : '- 无';

  return [
    `# 代码分析报告 - ${task.fileName}`,
    '',
    `- 任务 ID: ${task.id}`,
    `- 评分: ${result.score}/100`,
    `- 生成时间: ${result.generatedAt}`,
    '',
    '## 总结',
    result.summary,
    '',
    '## 指标',
    `- 代码行数: ${result.metrics.linesOfCode}`,
    `- 圈复杂度: ${result.metrics.complexity}`,
    `- 函数数量: ${result.metrics.functionCount}`,
    `- 注释率: ${(result.metrics.commentRatio * 100).toFixed(1)}%`,
    '',
    '## 问题列表',
    issueRows || '- 无',
    '',
    '## 改进建议',
    suggestRows || '- 无',
    '',
    '## AI 评价',
    aiSummaryRows,
    '',
    result.aiAnalysis ? `> ${result.aiAnalysis.openingRoast}` : '> 无',
    '',
    '## AI 发现的问题',
    aiIssueRows,
    '',
    '## AI 最终裁决',
    aiVerdictRows,
    '',
  ].join('\n');
}
