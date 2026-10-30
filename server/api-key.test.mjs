import test from 'node:test';
import assert from 'node:assert/strict';
import { selectApiKey } from './api-key.mjs';

test('uses a valid user key and falls back to the server key', () => {
  assert.equal(selectApiKey('sk-user', 'sk-server'), 'sk-user');
  assert.equal(selectApiKey(undefined, 'sk-server'), 'sk-server');
});

test('rejects malformed user keys instead of using the server key', () => {
  assert.throws(() => selectApiKey('bad\nkey', 'sk-server'), /API Key/);
  assert.throws(() => selectApiKey(' '.repeat(300), ''), /API Key/);
});
