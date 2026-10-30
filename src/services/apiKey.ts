export const API_KEY_STORAGE_KEY = 'activity-lab-deepseek-key';
type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export function loadApiKey(storage: StorageLike = localStorage): string {
  try { return storage.getItem(API_KEY_STORAGE_KEY) ?? ''; } catch { return ''; }
}

export function saveApiKey(value: string, storage: StorageLike = localStorage): boolean {
  const key = value.trim();
  if (!key || key.length > 256 || /[\r\n\x00-\x1f\x7f]/.test(key)) return false;
  try { storage.setItem(API_KEY_STORAGE_KEY, key); return true; } catch { return false; }
}

export function clearApiKey(storage: StorageLike = localStorage): boolean {
  try { storage.removeItem(API_KEY_STORAGE_KEY); return true; } catch { return false; }
}
