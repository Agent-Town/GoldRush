#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = new Set(process.argv.slice(2));
const once = args.delete('--once');
const dryRun = args.delete('--dry-run');
if (args.size) throw new Error(`unknown option: ${[...args][0]}`);

const base = process.env.ASSAY_API_BASE;
const secret = process.env.ASSAY_WORKER_SECRET;
if (!base || !secret) throw new Error('ASSAY_API_BASE and ASSAY_WORKER_SECRET are required');

const replayScript = path.resolve(process.env.ASSAY_REPLAY_SCRIPT ?? path.join(root, 'scripts/assay-replay.mjs'));
const pollMs = positiveInteger(process.env.ASSAY_POLL_MS, 15_000);
const initialBackoffMs = positiveInteger(process.env.ASSAY_BACKOFF_INITIAL_MS, pollMs);
const maxBackoffMs = positiveInteger(process.env.ASSAY_BACKOFF_MAX_MS, 300_000);
const queueUrl = new URL('/api/standings/assay-queue?limit=100', base);
const verdictUrl = new URL('/api/standings/assay-verdict', base);
const headers = { 'x-assay-key': secret };
const noReplayHash = 'fnv1a32:00000000';
let stopping = false;

process.on('SIGTERM', () => { stopping = true; });
process.on('SIGINT', () => { stopping = true; });

async function requestJson(url, init = {}) {
  const response = await fetch(url, { ...init, signal: AbortSignal.timeout(60_000), headers: { ...headers, ...init.headers } });
  const text = await response.text();
  let body;
  try { body = JSON.parse(text); } catch { throw new Error(`${init.method ?? 'GET'} ${url.pathname} returned non-JSON (${response.status})`); }
  if (!response.ok || body?.ok !== true) throw new Error(`${init.method ?? 'GET'} ${url.pathname} failed (${response.status}): ${body?.error ?? 'unknown'}`);
  return body;
}

async function replay(tape) {
  const directory = await mkdtemp(path.join(tmpdir(), 'gold-rush-assay-'));
  const reelPath = path.join(directory, 'reel.json');
  try {
    await writeFile(reelPath, JSON.stringify(tape));
    return await new Promise((resolve, reject) => {
      const child = spawn(process.execPath, [replayScript, reelPath], { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] });
      let stdout = '';
      let stderr = '';
      child.stdout.on('data', (chunk) => { stdout += chunk; });
      child.stderr.on('data', (chunk) => { stderr += chunk; });
      child.on('error', reject);
      child.on('close', (code) => {
        if (code !== 0) reject(new Error(stderr.trim() || `instrument exited ${code}`));
        else {
          try { resolve(JSON.parse(stdout.trim())); }
          catch { reject(new Error('instrument returned malformed JSON')); }
        }
      });
    });
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

function outcomeMismatch(claim, actual) {
  if (!claim || !actual || typeof claim !== 'object' || typeof actual !== 'object') return 'malformed outcome';
  const mismatches = ['secured', 'waves', 'timeAlive', 'gold'].filter((field) => actual[field] !== claim[field]);
  return mismatches.length ? `outcome mismatch: ${mismatches.join(', ')}` : null;
}

async function assay(row) {
  const startedAt = performance.now();
  const claimedHash = typeof row?.tape?.eventLogHash === 'string' ? row.tape.eventLogHash : null;
  let replayedHash = noReplayHash;
  let verdict = 'rejected';
  let reason;

  try {
    if (!row?.tape || typeof row.tape !== 'object') throw new Error('malformed tape');
    if (row.tape.version !== 2) throw new Error(row.tape.version === 1 ? 'legacy tape v1 is unverifiable' : 'malformed tape version');
    const result = await replay(row.tape);
    if (typeof result?.eventLogHash !== 'string' || !/^fnv1a32:[a-f0-9]{8}$/.test(result.eventLogHash)) {
      throw new Error('instrument returned no valid eventLogHash');
    }
    replayedHash = result.eventLogHash;
    const mismatch = outcomeMismatch(row.score, result.outcome);
    if (replayedHash !== claimedHash) reason = `eventLogHash mismatch: claimed ${claimedHash ?? 'missing'}, replayed ${replayedHash}`;
    else if (mismatch) reason = mismatch;
    else verdict = 'verified';
  } catch (error) {
    reason = error instanceof Error ? error.message : String(error);
  }

  reason = reason?.slice(0, 256);
  const payload = { locator: row?.locator, verdict, replayedHash, ...(reason ? { reason } : {}) };
  if (!dryRun) {
    await requestJson(verdictUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });
  }
  process.stdout.write(`${JSON.stringify({
    locator: row?.locator ?? null,
    verdict,
    hashes: { claimed: claimedHash, replayed: replayedHash },
    wallMs: Math.round(performance.now() - startedAt),
    ...(reason ? { reason } : {}),
    ...(dryRun ? { dryRun: true } : {}),
  })}\n`);
}

async function sleep(ms) {
  const end = Date.now() + ms;
  while (!stopping && Date.now() < end) await new Promise((resolve) => setTimeout(resolve, Math.min(250, end - Date.now())));
}

async function main() {
  let backoffMs = initialBackoffMs;
  while (!stopping) {
    try {
      const body = await requestJson(queueUrl);
      if (!Array.isArray(body.queue)) throw new Error('GET assay-queue returned no queue');
      for (const row of body.queue) {
        await assay(row);
        if (stopping) break;
      }
      backoffMs = initialBackoffMs;
      if (once || stopping) return;
      await sleep(pollMs);
    } catch (error) {
      if (once) throw error;
      process.stdout.write(`${JSON.stringify({ event: 'api_backoff', delayMs: backoffMs, error: error instanceof Error ? error.message : String(error) })}\n`);
      await sleep(backoffMs);
      backoffMs = Math.min(maxBackoffMs, backoffMs * 2);
    }
  }
}

function positiveInteger(value, fallback) {
  const parsed = Number(value ?? fallback);
  if (!Number.isSafeInteger(parsed) || parsed < 1) throw new Error('worker intervals must be positive integers');
  return parsed;
}

main().catch((error) => {
  process.stderr.write(`assay worker failed: ${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});
