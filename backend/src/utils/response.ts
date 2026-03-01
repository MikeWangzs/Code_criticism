export function ok<T>(data: T, message = 'success') {
  return { code: 200, message, data };
}

export function fail(code: number, message: string, details?: unknown) {
  return {
    code,
    message,
    data: null,
    error: details ? { type: 'RequestError', details } : undefined,
  };
}
