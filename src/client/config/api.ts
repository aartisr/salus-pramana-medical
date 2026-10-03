export const API_BASE_PATH = '/api' as const;

export function apiPath(path: string) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_PATH}${normalizedPath}`;
}