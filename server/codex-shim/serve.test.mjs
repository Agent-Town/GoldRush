import assert from 'node:assert/strict';
import test, { after } from 'node:test';
import { spawnSync } from 'node:child_process';
import { chmodSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createCodexShimServer, hasCodexAuth, resolveCodexBinary } from './serve.mjs';

const skip = hasCodexAuth() ? false : 'Codex subscription auth is absent';
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

test('streaming completion emits role, content, finish usage, and DONE', async () => {
  const usage = { input_tokens: 100, cached_input_tokens: 25, output_tokens: 10, reasoning_output_tokens: 5 };
  const localServer = createCodexShimServer({
    codexBinary: 'unused',
    completeFn: async () => ({ content: 'shim-stream-ok', usage }),
  });
  await new Promise((resolve) => localServer.listen(0, '127.0.0.1', resolve));
  try {
    const { chunks } = await streamingCompletion(`http://127.0.0.1:${localServer.address().port}`, 'ignored-by-stub');
    assert.equal(chunks.length, 3);
    assert.deepEqual(chunks[0].choices[0], { index: 0, delta: { role: 'assistant' }, finish_reason: null });
    assert.deepEqual(chunks[1].choices[0].delta, { content: 'shim-stream-ok' });
    assert.deepEqual(chunks[2].choices[0], { index: 0, delta: {}, finish_reason: 'stop' });
    assert.equal(chunks[2].usage.total_tokens, 110);
    assert.equal(chunks[2].usage.prompt_tokens_details.cached_tokens, 25);
    assert.equal(chunks[2].usage.completion_tokens_details.reasoning_tokens, 5);
  } finally {
    await new Promise((resolve) => localServer.close(resolve));
  }
});

test('subscription-backed streaming round trip reports content and usage', { skip, timeout: 120_000 }, async (context) => {
  await start();
  const { chunks, elapsedMs } = await streamingCompletion(baseUrl, 'shim-live-stream-ok');
  assert.equal(chunks.map((chunk) => chunk.choices[0].delta.content ?? '').join('').trim(), 'shim-live-stream-ok');
  assert.ok(chunks.at(-1).usage.prompt_tokens > 0);
  assert.ok(chunks.at(-1).usage.completion_tokens > 0);
  context.diagnostic(`chunks=${chunks.length} usage=${JSON.stringify(chunks.at(-1).usage)} latency_ms=${elapsedMs}`);
});

test('client abort terminates the codex child process', { timeout: 10_000 }, async () => {
  const directory = mkdtempSync(path.join(tmpdir(), 'codex-shim-abort-'));
  const marker = `fake-codex-${process.pid}-${Date.now()}`;
  const fakeCodex = path.join(directory, marker);
  writeFileSync(fakeCodex, '#!/usr/bin/env node\nsetInterval(() => {}, 1000);\n');
  chmodSync(fakeCodex, 0o755);
  const matchingProcesses = () => spawnSync('pgrep', ['-f', marker], { encoding: 'utf8' }).stdout.trim().split('\n').filter(Boolean);
  const waitFor = async (predicate) => {
    const deadline = Date.now() + 3_000;
    while (!predicate()) {
      if (Date.now() >= deadline) return false;
      await new Promise((resolve) => setTimeout(resolve, 20));
    }
    return true;
  };
  assert.deepEqual(matchingProcesses(), []);
  const localServer = createCodexShimServer({ codexBinary: fakeCodex });
  await new Promise((resolve) => localServer.listen(0, '127.0.0.1', resolve));
  try {
    const controller = new AbortController();
    const request = fetch(`http://127.0.0.1:${localServer.address().port}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ stream: true, messages: [{ role: 'user', content: 'wait' }] }),
      signal: controller.signal,
    });
    assert.equal(await waitFor(() => matchingProcesses().length === 1), true, 'fake codex process did not start');
    controller.abort();
    await assert.rejects(request, { name: 'AbortError' });
    assert.equal(await waitFor(() => matchingProcesses().length === 0), true, 'orphan codex process remained after abort');
  } finally {
    await new Promise((resolve) => localServer.close(resolve));
    rmSync(directory, { recursive: true });
  }
});

test('developer messages and function calls survive the compatibility boundary', async () => {
  const fakeUsage = { input_tokens: 100, cached_input_tokens: 25, output_tokens: 10, reasoning_output_tokens: 5 };
  const fakeComplete = async (_binary, _model, prompt, _timeout, schema) => {
    assert.match(prompt, /DEVELOPER: use the tool/);
    assert.match(prompt, /lookup_claim/);
    assert.ok(schema.endsWith('tool-response.schema.json'));
    return { content: JSON.stringify({ content: null, tool_calls: [{ name: 'lookup_claim', arguments: '{"id":7}' }] }), usage: fakeUsage };
  };
  const localServer = createCodexShimServer({ codexBinary: 'unused', completeFn: fakeComplete });
  await new Promise((resolve) => localServer.listen(0, '127.0.0.1', resolve));
  try {
    const localUrl = `http://127.0.0.1:${localServer.address().port}`;
    const response = await fetch(`${localUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-5.6-luna',
        messages: [{ role: 'developer', content: 'use the tool' }, { role: 'user', content: 'find seven' }],
        tools: [{ type: 'function', function: { name: 'lookup_claim', parameters: { type: 'object' } } }],
      }),
    });
    const body = await response.json();
    assert.equal(response.status, 200);
    assert.equal(body.choices[0].finish_reason, 'tool_calls');
    assert.equal(body.choices[0].message.tool_calls[0].function.name, 'lookup_claim');
    assert.equal(body.choices[0].message.tool_calls[0].function.arguments, '{"id":7}');
    assert.equal(body.usage.completion_tokens, 10);
    assert.equal(body.usage.total_tokens, 110);
  } finally {
    await new Promise((resolve) => localServer.close(resolve));
  }
});

test('browser-origin requests cannot spend subscription quota', async () => {
  let calls = 0;
  const localServer = createCodexShimServer({ codexBinary: 'unused', completeFn: async () => { calls += 1; } });
  await new Promise((resolve) => localServer.listen(0, '127.0.0.1', resolve));
  try {
    const response = await fetch(`http://127.0.0.1:${localServer.address().port}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'content-type': 'text/plain', origin: 'https://example.invalid' },
      body: '{}',
    });
    assert.equal(response.status, 403);
    assert.equal(calls, 0);
  } finally {
    await new Promise((resolve) => localServer.close(resolve));
  }
});
