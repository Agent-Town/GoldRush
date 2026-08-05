/**
 * external-server-is-dev.test.mjs — arms for scripts/external-server-guard.mjs (F-1457-1, s1463).
 *
 * A passing guard never executes its violation path, so a green proves nothing about the red
 * (the s1299/s1300 standard). Every arm here MANUFACTURES the condition it claims to catch.
 *
 * BOTH DIRECTIONS ARE ASSERTED, for the reason scripts/fire-shell-serialisation.test.mjs asserts
 * both of its own: a guard that only proves it fires can be satisfied by a guard that ALWAYS fires,
 * which would abort every capture run and every concurrency measurement in the factory. So the
 * dev-server arm and the "flag unset" arm are load-bearing, not decoration.
 *
 * ⓘ WHAT THESE ARMS ARE AND ARE NOT. The servers below are node:http stubs replaying the response
 * shapes MEASURED against real vite by artifacts/f1457-1/measure-discriminator.mjs (dev
 * /@vite/client -> 200 text/javascript; preview -> 200 text/html SPA fallback). Stubs keep this
 * arm of test:node-guards at ~50ms instead of the ~20s two real vite servers cost, and the battery
 * is already dominated by gr-sim at 55.6s. The tradeoff is stated plainly: these arms test the
 * CLASSIFIER against vite's measured behaviour, not vite itself. If vite ever changes what it
 * serves at /@vite/client, these stay green while reality drifts — re-run the measurement script,
 * which is committed for exactly that purpose.
 */
import assert from 'node:assert/strict';
import test, { after } from 'node:test';
import http from 'node:http';
import {
  classifyExternalServer,
  classifyWithGrace,
  messageFor,
} from './external-server-guard.mjs';

const SERVERS = [];
after(async () => {
  await Promise.all(
    SERVERS.map((server) => new Promise((resolve) => server.close(() => resolve()))),
  );
});

/** Stand up a stub server; returns its baseURL. */
async function listen(handler) {
  const server = http.createServer(handler);
  SERVERS.push(server);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  return `http://127.0.0.1:${server.address().port}`;
}

// Replays the measured dev-server response: /@vite/client is real JavaScript.
const devServer = (req, res) => {
  if (req.url.startsWith('/@vite/client')) {
    res.writeHead(200, { 'content-type': 'text/javascript' });
    res.end('import "/node_modules/vite/dist/client/env.mjs";\n');
    return;
  }
  res.writeHead(200, { 'content-type': 'text/html' });
  res.end('<!doctype html><html></html>');
};

// Replays the measured preview response: EVERY path SPA-falls-back to index.html, 200 + text/html.
// This is the arm that would have exposed the intuitive "preview 404s the client" design as wrong.
const previewServer = (_req, res) => {
  res.writeHead(200, { 'content-type': 'text/html' });
  res.end('<!doctype html><html><head><meta charset="utf-8"></head></html>');
};

test('a dev server classifies as dev', async () => {
  const baseURL = await listen(devServer);
  const { verdict } = await classifyExternalServer(baseURL);
  assert.equal(verdict, 'dev');
});

test('a preview server classifies as not-dev — status 200 must NOT exonerate it', async () => {
  const baseURL = await listen(previewServer);
  const { verdict, detail } = await classifyExternalServer(baseURL);
  assert.equal(verdict, 'not-dev');
  // The whole point: it answered 200. If this guard ever keys on status it will stop working.
  assert.match(detail, /200/);
  assert.match(detail, /text\/html/);
});

test('a dead port classifies as unreachable', async () => {
  // Bind then immediately release, so the port is known-free rather than guessed.
  const baseURL = await listen(devServer);
  const server = SERVERS.pop();
  await new Promise((resolve) => server.close(() => resolve()));
  const { verdict } = await classifyWithGrace(baseURL, { graceMs: 0, timeoutMs: 500 });
  assert.equal(verdict, 'unreachable');
});

test('a trailing slash on baseURL does not break the probe', async () => {
  const baseURL = await listen(devServer);
  const { verdict } = await classifyExternalServer(`${baseURL}/`);
  assert.equal(verdict, 'dev');
});

test('the not-dev message names the actual fix, not just the fault', async () => {
  const message = messageFor('not-dev', 'probe detail', 'http://127.0.0.1:5188');
  assert.match(message, /npm run dev/);
  assert.match(message, /playwright\.preview\.config\.ts/);
  assert.match(message, /F-1457-1/);
});

test('globalSetup THROWS on a preview server — the violation path actually runs', async () => {
  const baseURL = await listen(previewServer);
  const { default: globalSetup } = await import('./external-server-guard.mjs');
  const prevFlag = process.env.GR_CAPTURE_EXTERNAL_SERVER;
  const prevBase = process.env.GR_CAPTURE_BASE_URL;
  process.env.GR_CAPTURE_EXTERNAL_SERVER = '1';
  process.env.GR_CAPTURE_BASE_URL = baseURL;
  try {
    await assert.rejects(() => globalSetup(), /NOT a vite dev server/);
  } finally {
    if (prevFlag === undefined) delete process.env.GR_CAPTURE_EXTERNAL_SERVER;
    else process.env.GR_CAPTURE_EXTERNAL_SERVER = prevFlag;
    if (prevBase === undefined) delete process.env.GR_CAPTURE_BASE_URL;
    else process.env.GR_CAPTURE_BASE_URL = prevBase;
  }
});

test('globalSetup RESOLVES on a dev server — the guard is not one that always fires', async () => {
  const baseURL = await listen(devServer);
  const { default: globalSetup } = await import('./external-server-guard.mjs');
  const prevFlag = process.env.GR_CAPTURE_EXTERNAL_SERVER;
  const prevBase = process.env.GR_CAPTURE_BASE_URL;
  process.env.GR_CAPTURE_EXTERNAL_SERVER = '1';
  process.env.GR_CAPTURE_BASE_URL = baseURL;
  try {
    await globalSetup();
  } finally {
    if (prevFlag === undefined) delete process.env.GR_CAPTURE_EXTERNAL_SERVER;
    else process.env.GR_CAPTURE_EXTERNAL_SERVER = prevFlag;
    if (prevBase === undefined) delete process.env.GR_CAPTURE_BASE_URL;
    else process.env.GR_CAPTURE_BASE_URL = prevBase;
  }
});

test('globalSetup is INERT when the flag is unset — lanes and ordinary runs pay nothing', async () => {
  const { default: globalSetup } = await import('./external-server-guard.mjs');
  const prevFlag = process.env.GR_CAPTURE_EXTERNAL_SERVER;
  const prevBase = process.env.GR_CAPTURE_BASE_URL;
  delete process.env.GR_CAPTURE_EXTERNAL_SERVER;
  // Point at a port nothing serves. If globalSetup probed anyway it would throw unreachable —
  // so this arm proves it does not probe, rather than merely that it did not complain.
  process.env.GR_CAPTURE_BASE_URL = 'http://127.0.0.1:1';
  try {
    await globalSetup();
  } finally {
    if (prevFlag === undefined) delete process.env.GR_CAPTURE_EXTERNAL_SERVER;
    else process.env.GR_CAPTURE_EXTERNAL_SERVER = prevFlag;
    if (prevBase === undefined) delete process.env.GR_CAPTURE_BASE_URL;
    else process.env.GR_CAPTURE_BASE_URL = prevBase;
  }
});
