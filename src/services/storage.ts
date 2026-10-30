import type { LocalState } from '../types';

export const STORAGE_KEY = 'activity-lab-v1';
const empty = (): LocalState => ({ recentPlan: null, favorites: [], history: [] });
type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export function loadLocalState(storage: StorageLike = localStorage): { data: LocalState; error: string | null } {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return { data: empty(), error: null };
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || !('favorites' in parsed) || !Array.isArray(parsed.favorites)) throw new Error('invalid');
    const state = parsed as LocalState;
    const history = Array.isArray(state.history) ? state.history : state.recentPlan ? [state.recentPlan] : [];
    return { data: { recentPlan: state.recentPlan ?? null, favorites: state.favorites, history }, error: null };
  } catch {
    return { data: empty(), error: '读取本地方案失败，已使用空白方案。' };
  }
}

export function saveLocalState(state: LocalState, storage: StorageLike = localStorage) {
  try { storage.setItem(STORAGE_KEY, JSON.stringify(state)); return true; } catch { return false; }
}

export function clearLocalState(storage: StorageLike = localStorage) {
  try { storage.removeItem(STORAGE_KEY); return true; } catch { return false; }
}
