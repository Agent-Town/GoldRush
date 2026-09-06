#!/usr/bin/env node

import { createServer as createHttpServer } from 'node:http';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createServer as createViteServer } from 'vite';
import { SqliteStorage } from './storage.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
let runtimePromise;

async function loadLedgerRuntime() {
  runtimePromise ??= (async () => {
    const vite = await createViteServer({ root: ROOT, configFile: false, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });
    try {
      const standings = await vite.ssrLoadModule('/functions/api/standings.ts');
      const refusals = await vite.ssrLoadModule('/functions/api/refusals.ts');
      const accounts = await vite.ssrLoadModule('/functions/api/_accounts.ts');
      return {
        maxRequestBytes: standings.MAX_JSON_BYTES,
        handlers: {
          '/api/standings': standings.onRequest,
          '/api/standings/assay-queue': standings.onRequestAssayQueue,
          '/api/standings/assay-verdict': standings.onRequestAssayVerdict,
          // F-LINEAGE-4 (attended 2026-09-06): the droplet ledger IS the live door behind nginx's /api/standings, so the
          // ADR-004 re-assay verb must be routed here too; without it agenttown.app answered 404 while the Pages origin answered 401.
          '/api/standings/reassay': standings.onRequestStandingsReassay,
          '/api/standings/refusals': refusals.onRequest,
          '/api/refusals': refusals.onRequest,
          '/api/request-code': accounts.requestCode,
          '/api/verify': accounts.verifyCode,
          '/api/session': accounts.sessionStatus,
          '/api/save/push': accounts.pushSave,
          '/api/save/pull': accounts.pullSave,
          '/api/save/versions': accounts.saveVersions,
          '/api/save/profiles': accounts.saveProfiles,
          '/api/delete-account': accounts.deleteAccount,
        },
      };
    } finally {
      await vite.close();
    }
  })();
  return runtimePromise;
}

export async function loadLedgerHandlers() {
  return (await loadLedgerRuntime()).handlers;
}

export async function loadLedgerMaxRequestBytes() {
  return (await loadLedgerRuntime()).maxRequestBytes;
}

export async function createLedgerServer({ storage, env = {}, handlers } = {}) {
  if (!storage) throw new Error('ledger storage is required');
  const runtime = await loadLedgerRuntime();
  const routes = handlers ?? runtime.handlers;
  const handlerEnv = { ACCOUNTS: storage, TELEMETRY: storage, ...env };

  return createHttpServer(async (incoming, outgoing) => {
    try {
      const url = new URL(incoming.url ?? '/', `http://${incoming.headers.host ?? '127.0.0.1'}`);
      const handler = routes[url.pathname];
      if (!handler) return send(outgoing, json({ ok: false, error: 'not_found' }, 404));
      const headers = new Headers(incoming.headers);
      const init = { method: incoming.method, headers };
      if (incoming.method !== 'GET' && incoming.method !== 'HEAD') {
        const { body, bytes, tooLarge } = await requestBody(incoming, runtime.maxRequestBytes);
        if (tooLarge) headers.set('content-length', String(bytes));
        init.body = body;
      }
      const response = await handler({ request: new Request(url, init), env: handlerEnv });
      await send(outgoing, response);
    } catch (error) {
      console.error('ledger request failed', error);
      await send(outgoing, json({ ok: false, error: 'server_error', message: 'The county book is unavailable.' }, 500));
    }
  });
}

async function requestBody(incoming, maxRequestBytes) {
  const chunks = [];
  let bytes = 0;
  for await (const chunk of incoming) {
    bytes += chunk.length;
    if (bytes <= maxRequestBytes) chunks.push(chunk);
  }
  return { body: Buffer.concat(chunks), bytes, tooLarge: bytes > maxRequestBytes };
}

function json(value, status) {
  return new Response(JSON.stringify(value), { status, headers: { 'content-type': 'application/json; charset=utf-8' } });
}

async function send(outgoing, response) {
  outgoing.writeHead(response.status, Object.fromEntries(response.headers));
  outgoing.end(Buffer.from(await response.arrayBuffer()));
}

function allowedOrigins(value) {
  return new Set((value ?? '').split(',').map((origin) => origin.trim()).filter(Boolean));
}

function port(value) {
  const parsed = Number(value ?? 8787);
  if (!Number.isSafeInteger(parsed) || parsed < 1 || parsed > 65_535) throw new Error('PORT must be an integer from 1 to 65535');
  return parsed;
}

async function main() {
  const storage = new SqliteStorage(process.env.LEDGER_DB_PATH);
  const server = await createLedgerServer({
    storage,
    env: {
      ASSAY_WORKER_SECRET: process.env.ASSAY_WORKER_SECRET,
      ASSAY_INDEX_MAX_AGE_MS: process.env.ASSAY_INDEX_MAX_AGE_MS,
      DEV_AUTH: process.env.DEV_AUTH,
      RESEND_API_KEY: process.env.RESEND_API_KEY,
      AUTH_CODE_PEPPER: process.env.AUTH_CODE_PEPPER,
      ALLOWED_CORS_ORIGINS: allowedOrigins(process.env.ALLOWED_CORS_ORIGINS),
    },
  });
  server.listen(port(process.env.PORT), '127.0.0.1', () => console.log(`gold-rush ledger listening on 127.0.0.1:${server.address().port}`));
  const close = () => server.close(() => storage.close());
  process.once('SIGINT', close);
  process.once('SIGTERM', close);
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
