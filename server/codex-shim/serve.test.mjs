/**
 * The codex shim's PURE arms: the compatibility boundary, the stream shape, the lifecycle and the
 * origin refusal. Nothing here talks to a subscription, a network or a real model -- every arm
 * either stubs `completeFn` or points the shim at a throwaway script -- so this file is free to run
 * on every drain, and it is rooted in `test:ledger-guards` for exactly that reason.
 *
 * F-2272-1, owner ruling 2026-09-19 (verbatim: "I agree with all your recommendations on the
 * decisions - good work"; the register: "split the file, root the two pure arms in the battery,
 * owner-gate the live arms"). This file and `serve.live.test.mjs` used to be one file whose live
 * arms spent about 16.7k prompt tokens of the owner's Codex allowance per run, which is why the
 * whole thing sat unrooted and the pure arms -- including the security arm below, which protects
 * that very allowance -- were gated by nobody. The split ends that: the cheap arms are in the
 * battery, the spending arms are behind `GR_CODEX_LIVE=1` and stay at the owner's discretion.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { spawnSync } from 'node:child_process';
import { chmodSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { connect } from 'node:net';
import { createCodexShimServer } from './serve.mjs';

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

test('client disconnect mid-stream leaves the shim available', { timeout: 10_000 }, async (context) => {
  let calls = 0;
  const usage = { input_tokens: 1, output_tokens: 1 };
  const localServer = createCodexShimServer({
    codexBinary: 'unused',
    completeFn: async () => ({ content: calls++ === 0 ? 'x'.repeat(8 * 1024 * 1024) : 'still-alive', usage }),
  });
  let serverSocket;
  localServer.once('connection', (socket) => {
    serverSocket = socket;
  });
  await new Promise((resolve) => localServer.listen(0, '127.0.0.1', resolve));
  try {
    const body = JSON.stringify({ stream: true, messages: [{ role: 'user', content: 'disconnect' }] });
    const receivedBytes = await new Promise((resolve, reject) => {
      const client = connect(localServer.address().port, '127.0.0.1', () => client.write([
        'POST /v1/chat/completions HTTP/1.1',
        'Host: 127.0.0.1',
        'Content-Type: application/json',
        `Content-Length: ${Buffer.byteLength(body)}`,
        'Connection: close',
        '', body,
      ].join('\r\n')));
      client.once('data', (chunk) => {
        client.resetAndDestroy();
        resolve(chunk.length);
      });
      client.once('error', reject);
    });
    await new Promise((resolve) => setTimeout(resolve, 100));
    // Node 23 adds this after close; production Node 26 did not, so prove the shim owns the late EPIPE itself.
    for (const listener of serverSocket.listeners('error')) {
      if (listener.name === 'noop') serverSocket.off('error', listener);
    }
    serverSocket.emit('error', Object.assign(new Error('write EPIPE'), { code: 'EPIPE', syscall: 'write' }));

    assert.equal(localServer.listening, true);
    const response = await fetch(`http://127.0.0.1:${localServer.address().port}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ messages: [{ role: 'user', content: 'survival check' }] }),
    });
    assert.equal(response.status, 200);
    assert.equal((await response.json()).choices[0].message.content, 'still-alive');
    context.diagnostic(`abort_bytes=${receivedBytes} followup_status=${response.status}`);
  } finally {
    await new Promise((resolve) => localServer.close(resolve));
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
