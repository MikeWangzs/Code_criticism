export const SUPPORTED_LANGUAGES = [
  { id: 'cpp', name: 'C++', extensions: ['.cpp', '.hpp', '.h', '.cc'], icon: 'cpp-icon.svg' },
  { id: 'python', name: 'Python', extensions: ['.py', '.pyw'], icon: 'python-icon.svg' },
  { id: 'javascript', name: 'JavaScript', extensions: ['.js', '.mjs'], icon: 'js-icon.svg' },
  { id: 'typescript', name: 'TypeScript', extensions: ['.ts', '.tsx'], icon: 'ts-icon.svg' },
  { id: 'java', name: 'Java', extensions: ['.java'], icon: 'java-icon.svg' },
  { id: 'go', name: 'Go', extensions: ['.go'], icon: 'go-icon.svg' },
  { id: 'rust', name: 'Rust', extensions: ['.rs'], icon: 'rust-icon.svg' },
  { id: 'c', name: 'C', extensions: ['.c'], icon: 'c-icon.svg' }
] as const;

export const MAX_FILE_SIZE = Number(process.env.MAX_FILE_SIZE ?? 524288);
