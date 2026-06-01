const KEY = "renovpilot:activeProjectId";
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(id: string): boolean {
  return UUID_RE.test(id);
}

export function getStoredProjectId(): string | null {
  try {
    const id = localStorage.getItem(KEY);
    return id && isUuid(id) ? id : null;
  } catch {
    return null;
  }
}

export function storeProjectId(id: string): void {
  try {
    localStorage.setItem(KEY, id);
  } catch {}
}
