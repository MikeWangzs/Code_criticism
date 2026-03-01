import { v4 as uuidv4 } from 'uuid';

interface AICriticIssue {
  id: string;
  level: 'fatal' | 'major' | 'minor';
  title: string;
  lineHint?: string;
  roast: string;
  fix: string;
}

export interface AICriticResult {
  model: string;
  strictScore: number;
  summary: string;
  openingRoast: string;
  issues: AICriticIssue[];
  finalVerdict: string;
}

function extractJson(content: string) {
  const trimmed = content.trim();
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) return trimmed;

  const fenced = trimmed.match(/```json\\s*([\\s\\S]*?)```/i);
  if (fenced?.[1]) return fenced[1].trim();

  const first = trimmed.indexOf('{');
  const last = trimmed.lastIndexOf('}');
  if (first >= 0 && last > first) return trimmed.slice(first, last + 1);

  return trimmed;
}

function normalizeResult(raw: any, model: string): AICriticResult {
  const issues = Array.isArray(raw?.issues) ? raw.issues : [];
  return {
    model,
    strictScore: Number(raw?.strictScore ?? 0),
    summary: String(raw?.summary ?? '未返回总结'),
    openingRoast: String(raw?.openingRoast ?? '这段代码让我想给编译器发心理援助。'),
    issues: issues.slice(0, 20).map((item: any) => ({
      id: uuidv4(),
      level: ['fatal', 'major', 'minor'].includes(item?.level) ? item.level : 'major',
      title: String(item?.title ?? '问题描述缺失'),
      lineHint: item?.lineHint ? String(item.lineHint) : undefined,
      roast: String(item?.roast ?? '这行代码的自信程度远超它的正确性。'),
      fix: String(item?.fix ?? '请重构此处并补充测试。'),
    })),
    finalVerdict: String(raw?.finalVerdict ?? '结论：先修再跑，别让它上生产。'),
  };
}

export async function runAICritic(args: { code: string; language?: string }) {
  const apiKey = process.env.AI_API_KEY;
  if (!apiKey) {
    throw new Error('缺少 AI_API_KEY，请先配置环境变量');
  }

  const model = process.env.AI_MODEL ?? 'sfm_codingplan_public_cn-m1e4oev5j4n';
  const baseUrl = process.env.AI_BASE_URL ?? 'https://api.siliconflow.cn/v1';
  const language = args.language || 'unknown';

  const systemPrompt = [
    '你是顶级代码审查专家，风格是“幽默但严格”。',
    '目标：像严格 code reviewer 一样找问题，同时保留机智吐槽。',
    '约束：',
    '1) 批评必须专业、具体、可执行，不做人身攻击。',
    '2) 优先指出正确性、安全性、并发、性能、可维护性问题。',
    '3) 给出可落地修复建议。',
    '4) 输出必须是 JSON，不要 markdown，不要额外解释。',
    'JSON 结构：',
    '{',
    '  "strictScore": 0-100,',
    '  "summary": "总体评价",',
    '  "openingRoast": "开场吐槽",',
    '  "issues": [',
    '    {"level":"fatal|major|minor","title":"问题标题","lineHint":"行号或范围(可选)","roast":"幽默尖锐点评","fix":"修复建议"}',
    '  ],',
    '  "finalVerdict": "最终裁决"',
    '}',
  ].join('\n');

  const userPrompt = `语言: ${language}\n\n请批判以下代码:\n\n${args.code}`;

  const response = await fetch(`${baseUrl.replace(/\/$/, '')}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.7,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    }),
  });

  const payload = await response.json();
  if (!response.ok) {
    const detail = payload?.error?.message || payload?.message || JSON.stringify(payload) || 'AI 请求失败';
    throw new Error(`AI 调用失败(${response.status}): ${detail}`);
  }

  const content = payload?.choices?.[0]?.message?.content;
  if (!content || typeof content !== 'string') {
    throw new Error('AI 返回内容为空');
  }

  let parsed: any;
  try {
    parsed = JSON.parse(extractJson(content));
  } catch {
    parsed = {
      strictScore: 0,
      summary: '模型输出非 JSON，已降级返回原文。',
      openingRoast: content.slice(0, 240),
      issues: [],
      finalVerdict: '请重试或降低输入长度。',
    };
  }

  return normalizeResult(parsed, model);
}
