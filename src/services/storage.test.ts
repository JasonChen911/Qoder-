import { describe, expect, it } from 'vitest';
import { clearLocalState, loadLocalState, saveLocalState, STORAGE_KEY } from './storage';
import type { LocalState } from '../types';

const emptyState: LocalState = { recentPlan: null, favorites: [], history: [] };

function memoryStorage(initial?: string) {
  const values = new Map<string, string>(initial ? [[STORAGE_KEY, initial]] : []);
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  };
}

describe('local storage', () => {
  it('restores the latest plan and favorites', () => {
    const state: LocalState = {
      recentPlan: null,
      favorites: [{
        id: 'favorite', createdAt: '2026-10-30', setup: { type: 'music', people: 12, budget: 100, duration: 60, venue: 'hall', goal: '' },
        selectedIds: ['music-lyric-puzzle'], materials: [], contingencyNote: '备用',
      }],
      history: [],
    };
    const storage = memoryStorage();

    expect(saveLocalState(state, storage)).toBe(true);
    expect(loadLocalState(storage)).toEqual({ data: state, error: null });
  });

  it('returns a fresh state and a readable error for malformed data', () => {
    const result = loadLocalState(memoryStorage('{broken'));

    expect(result.data).toEqual(emptyState);
    expect(result.error).toContain('读取');
  });

  it('clears only this application data', () => {
    const storage = memoryStorage(JSON.stringify(emptyState));

    expect(clearLocalState(storage)).toBe(true);
    expect(storage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('migrates existing saved plans into the history list', () => {
    const plan: LocalState['recentPlan'] = {
      id: 'old-plan', createdAt: '2026-10-30', setup: { type: 'music', people: 12, budget: 100, duration: 60, venue: 'hall', goal: '' },
      selectedIds: [], materials: [], contingencyNote: '',
    };
    const result = loadLocalState(memoryStorage(JSON.stringify({ recentPlan: plan, favorites: [] })));
    expect(result.data.history.map(item => item.id)).toEqual(['old-plan']);
  });
});
