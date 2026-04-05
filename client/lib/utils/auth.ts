export function parseJwtPayload(token: string): Record<string, unknown> {
  const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
  const json = decodeURIComponent(
    atob(base64).split('').map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
  );
  return JSON.parse(json);
}

export function getCurrentUserRole(): string | null {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem('accessToken');
  if (!token) return null;
  try {
    const payload = parseJwtPayload(token);
    return (payload.role as string) ?? null;
  } catch {
    return null;
  }
}

export function isAdmin(): boolean {
  return getCurrentUserRole() === 'ROLE_ADMIN';
}

export function getCurrentUserId(): string | null {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem('accessToken');
  if (!token) return null;
  try {
    const payload = parseJwtPayload(token);
    return (payload.sub as string) ?? null;
  } catch {
    return null;
  }
}
