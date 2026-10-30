import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeRequest, parseModelChoice, recommendWithDeepSeek } from './ai.mjs';

const request = {
  setup: { type: 'icebreaker', people: 20, budget: 200, duration: 90, venue: 'classroom', goal: '认识新朋友' },
  candidates: [{ id: 'ice-common-ground', name: '共同点 bingo', duration: 25, cost: 35, description: '破冰' }],
};

test('accepts bounded recommendation input', () => {
  assert.equal(normalizeRequest(request).candidates[0].id, 'ice-common-ground');
});

test('rejects oversized or malformed recommendation input', () => {
  assert.throws(() => normalizeRequest({ ...request, candidates: Array(50).fill(request.candidates[0]) }));
  assert.throws(() => normalizeRequest({ ...request, setup: { ...request.setup, people: -1 } }));
});

test('accepts only candidate IDs from the model response', () => {
  assert.deepEqual(parseModelChoice('{"ids":["ice-common-ground"],"reason":"适合破冰"}', request.candidates), {
    ids: ['ice-common-ground'], reason: '适合破冰',
  });
  assert.throws(() => parseModelChoice('{"ids":["invented"],"reason":"好玩"}', request.candidates));
});

test('sends the key only from the server and requests JSON from DeepSeek', async () => {
  let captured;
  const result = await recommendWithDeepSeek(request, 'server-secret', async (url, options) => {
    captured = { url, options };
    return { ok: true, json: async () => ({ choices: [{ message: { content: '{"ids":["ice-common-ground"],"reason":"贴合目标"}' } }] }) };
  });
  assert.equal(captured.url, 'https://api.deepseek.com/chat/completions');
  assert.equal(captured.options.headers.Authorization, 'Bearer server-secret');
  assert.equal(JSON.parse(captured.options.body).response_format.type, 'json_object');
  assert.equal(result.ids[0], 'ice-common-ground');
});
