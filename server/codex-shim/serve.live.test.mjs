/**
 * The codex shim's LIVE arms: the three that really ride the owner's Codex subscription.
 *
 * ⛔ THIS FILE SPENDS MONEY. Measured at the s2272 drain: about 16.7k prompt tokens per run
 * (model=gpt-5.6-luna, 16,741 prompt + 19 completion, 10.5 s for the single round trip; the
 * concurrency arm fires three more). Per CLAUDE.md §7.3 anything spending money is an OWNER
 * decision, so these arms are NOT in any battery and never will be without a word: they are
 * behind an explicit `GR_CODEX_LIVE=1` on top of the subscription-auth skip, and `npm run
 * test:codex-shim` is the one caller that sets it.
 *
 * F-2272-1, owner ruling 2026-09-19 (verbatim: "I agree with all your recommendations on the
 * decisions - good work"; the register: "split the file, root the two pure arms in the battery,
 * owner-gate the live arms"). The pure arms moved to `serve.test.mjs`, which IS rooted.
 *
 * Two independent conditions must both hold for an arm here to run, and each is a different
 * failure it protects against: `hasCodexAuth()` (no subscription in this shell -- a skip, never a
 * red, which is what keeps a fresh clone honest) and `GR_CODEX_LIVE=1` (nobody asked to spend --
 * which is what keeps a battery that accidentally collects this file from costing anything).
 */
import assert from 'node:assert/strict';
import test, { after } from 'node:test';
import { createCodexShimServer, hasCodexAuth, resolveCodexBinary } from './serve.mjs';

const live = process.env.GR_CODEX_LIVE === '1';
const skip = !live
  ? 'GR_CODEX_LIVE is not 1: these arms spend the owner Codex allowance and are opt-in (F-2272-1)'
  : hasCodexAuth() ? false : 'Codex subscription auth is absent';
let server;
let baseUrl;

async function start() {
  if (server) return;
  server = createCodexShimServer({ codexBinary: resolveCodexBinary() });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
}

after(() => server && new Promise((resolve) => server.close(resolve)));

async function completion(marker) {
  const startedAt = Date.now();
  const response = await fetch(`${baseUrl}/v1/chat/completions`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ model: 'gpt-5.6-luna', messages: [{ role: 'user', content: `Reply with exactly: ${marker}` }] }),
  });
  assert.equal(response.status, 200);
  return { body: await response.json(), elapsedMs: Date.now() - startedAt };
}

async function streamingCompletion(url, marker) {
  const startedAt = Date.now();
  const response = await fetch(`${url}/v1/chat/completions`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ model: 'gpt-5.6-luna', stream: true, messages: [{ role: 'user', content: `Reply with exactly: ${marker}` }] }),
  });
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type'), /^text\/event-stream/);
  const events = (await response.text()).trim().split('\n\n').map((event) => event.replace(/^data: /, ''));
  assert.equal(events.pop(), '[DONE]');
  return { chunks: events.map(JSON.parse), elapsedMs: Date.now() - startedAt };
}

test('subscription-backed chat completion returns OpenAI-compatible content and usage', { skip, timeout: 120_000 }, async (context) => {
  await start();
  const { body, elapsedMs } = await completion('shim-round-trip-ok');
  assert.equal(body.model, 'gpt-5.6-luna');
  assert.equal(body.choices[0].message.content.trim(), 'shim-round-trip-ok');
  assert.equal(body.usage.total_tokens, body.usage.prompt_tokens + body.usage.completion_tokens);
  assert.ok(body.usage.prompt_tokens > 0);
  assert.ok(body.usage.completion_tokens > 0);
  context.diagnostic(`model=${body.model} usage=${JSON.stringify(body.usage)} latency_ms=${elapsedMs}`);
});

test('three requests complete concurrently without sharing sessions', { skip, timeout: 180_000 }, async (context) => {
  await start();
  const markers = ['shim-parallel-a', 'shim-parallel-b', 'shim-parallel-c'];
  const results = await Promise.all(markers.map(completion));
  const bodies = results.map(({ body }) => body);
  assert.deepEqual(bodies.map((body) => body.choices[0].message.content.trim()), markers);
  assert.equal(new Set(bodies.map((body) => body.id)).size, 3);
  context.diagnostic(`latencies_ms=${results.map(({ elapsedMs }) => elapsedMs).join(',')}`);
});

test('subscription-backed streaming round trip reports content and usage', { skip, timeout: 120_000 }, async (context) => {
  await start();
  const { chunks, elapsedMs } = await streamingCompletion(baseUrl, 'shim-live-stream-ok');
  assert.equal(chunks.map((chunk) => chunk.choices[0].delta.content ?? '').join('').trim(), 'shim-live-stream-ok');
  assert.ok(chunks.at(-1).usage.prompt_tokens > 0);
  assert.ok(chunks.at(-1).usage.completion_tokens > 0);
  context.diagnostic(`chunks=${chunks.length} usage=${JSON.stringify(chunks.at(-1).usage)} latency_ms=${elapsedMs}`);
});
