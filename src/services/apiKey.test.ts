import { describe, expect, it } from 'vitest';
import { clearApiKey, loadApiKey, saveApiKey } from './apiKey';

function memoryStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value); },
    removeItem: (key: string) => { values.delete(key); },
  };
}

describe('DeepSeek key settings', () => {
  it('saves and restores a trimmed key independently of plan data', () => {
    const storage = memoryStorage();
    expect(saveApiKey('  sk-example  ', storage)).toBe(true);
    expect(loadApiKey(storage)).toBe('sk-example');
    expect(clearApiKey(storage)).toBe(true);
    expect(loadApiKey(storage)).toBe('');
  });

  it('rejects empty and malformed keys', () => {
    const storage = memoryStorage();
    expect(saveApiKey(' ', storage)).toBe(false);
    expect(saveApiKey('bad\nkey', storage)).toBe(false);
    expect(loadApiKey(storage)).toBe('');
  });
});
