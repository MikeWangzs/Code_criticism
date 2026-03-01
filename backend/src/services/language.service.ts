import path from 'node:path';
import { SUPPORTED_LANGUAGES } from '../config/constants.js';

export function getLanguages() {
  return SUPPORTED_LANGUAGES;
}

export function detectLanguage(input: { fileName?: string; code?: string }) {
  const fileName = input.fileName ?? '';
  const code = input.code ?? '';
  const ext = path.extname(fileName).toLowerCase();

  if (ext) {
    const matched = SUPPORTED_LANGUAGES.find((lang) => lang.extensions.includes(ext as never));
    if (matched) {
      return {
        language: matched.id,
        confidence: 0.95,
        alternatives: [{ language: 'plaintext', confidence: 0.3 }],
      };
    }
  }

  if (/^\s*#include/m.test(code) || /\bstd::\w+/m.test(code)) {
    return { language: 'cpp', confidence: 0.82, alternatives: [{ language: 'c', confidence: 0.7 }] };
  }
  if (/^\s*def\s+\w+/m.test(code) || /import\s+\w+/m.test(code)) {
    return { language: 'python', confidence: 0.8, alternatives: [{ language: 'javascript', confidence: 0.3 }] };
  }
  if (/\bfunction\b|=>|console\.log/m.test(code)) {
    return { language: 'javascript', confidence: 0.75, alternatives: [{ language: 'typescript', confidence: 0.65 }] };
  }

  return { language: 'plaintext', confidence: 0.45, alternatives: [{ language: 'cpp', confidence: 0.3 }] };
}
