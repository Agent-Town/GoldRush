#!/usr/bin/env node

/**
 * THE AGENT-DOOR ASSAY INSTRUMENT — replays a headless-door tape through the engine that wrote it.
 *
 * WHY THIS EXISTS (F-ASSAY-E2E-3, measured 2026-08-22). A tape whose entries carry `agent_orders`
 * was recorded by `HeadlessContractSim` through `scripts/gr-sim.mjs`; it is NOT a browser
 * recording. Replaying one in the browser instrument cannot reproduce it, and the reason is not a
 * missing wire — the two engines do not agree on the world at tick 0. Census taken on
 * `the-claim` / `e1-the-claim-01`, before any order was applied:
 *
 *   gr-sim   gold-seam-1 @anchor4 (18,-7) LIVE · gold-seam-2 @anchor1 (-9,6.7) LIVE · gold-seam-3 @anchor3 (7.5,6.5) LIVE
 *   browser  gold-seam-1 @anchor4 (18,-7) LIVE · gold-seam-2 @anchor5 (25,6.9) LIVE · gold-seam-3 DARK
 *
 * Two live seams against three, and a shared id standing at a different anchor. Every downstream
 * divergence follows from that, so a browser replay of an agent tape is not a verification of it.
 * The honest verifier for a claim is the engine that can reproduce the claim.
 *
 * WHAT IT VERIFIES. The tape declares seed + `runStart` + an order stream at fixed ticks. This
 * instrument installs the declared start, replays the stream tick-for-tick, and reports what the
 * sim actually did — the same `eventLogHash` shape the recorder wrote and the same four outcome
 * fields the worker compares. Nothing is trusted: an order the run refuses stays refused, and a
 * refusal changes the hash, which is exactly how a fabricated stream fails.
 *
 * Usage: node scripts/assay-replay-agent.mjs <reel.json>   (or import `replayAgentTape`)
 */

import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';
import fs from 'node:fs';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const CANONICAL_ASSAY_NODE_VERSION = '26.4.0';
export const ENGINE_SOURCE_INPUTS = [
  'scripts/assay-replay-agent.mjs',
  'assets/contracts',
  'assets/crafting-queue/contract.v1.json',
  'assets/crafting-queue/approved',
  'assets/layer-contracts',
  'assets/pilots/map-rebuild-spike',
  'src',
];
const TRACE_EVERY = Number(process.env.ASSAY_TRACE_EVERY ?? 0);
if (!Number.isSafeInteger(TRACE_EVERY) || TRACE_EVERY < 0) throw new Error('ASSAY_TRACE_EVERY must be a non-negative integer');

export function assertCanonicalAssayNode(version = process.versions.node) {
  if (version !== CANONICAL_ASSAY_NODE_VERSION) {
    throw new Error(`assay worker requires Node ${CANONICAL_ASSAY_NODE_VERSION} exactly; found ${version}`);
  }
}

/** Conservative source identity for everything the headless replay can execute or load as data. */
export async function computeEngineHash(projectRoot = root) {
  const files = [];
  for (const input of ENGINE_SOURCE_INPUTS) {
    const absolute = path.join(projectRoot, input);
    if (path.extname(input)) files.push(absolute);
    else await collectEngineFiles(absolute, files);
  }
  files.sort();
  const hash = createHash('sha256');
  for (const file of files) {
    const relative = path.relative(projectRoot, file).split(path.sep).join('/');
    const bytes = await readFile(file);
    hash.update(`${relative}\0${bytes.length}\0`);
    hash.update(bytes);
  }
  return hash.digest('hex');
}

async function collectEngineFiles(directory, files) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) await collectEngineFiles(absolute, files);
    else if (entry.isFile() && /\.(?:json|mjs|ts)$/.test(entry.name)) files.push(absolute);
  }
}

/** A tape whose input log carries standing orders was written by the headless door, not a browser. */
export function isAgentTape(tape) {
  const streams = Array.isArray(tape?.inputLog?.streams) ? tape.inputLog.streams : [];
  const logs = [tape?.inputLog, ...streams];
  return logs.some((log) => Array.isArray(log?.entries)
    && log.entries.some((entry) => Array.isArray(entry?.a)
      && entry.a.some((action) => action !== null && typeof action === 'object' && action.kind === 'agent_orders')));
}

/**
 * Installs the module-level shims the game reads at import time, exactly as `scripts/gr-sim.mjs`
 * does, BEFORE any game module is loaded. `?debug` is what the door itself boots under.
 */
function installLocationShim(tape) {
  const location = new URL('http://gr-sim.local/');
  location.searchParams.set('debug', '');
  location.searchParams.set('contract', tape.contract);
  location.searchParams.set('seed', tape.seed);
  globalThis.location = location;
  globalThis.window = { location };
}

export async function replayAgentTape(rawTape) {
  installLocationShim(rawTape);
  const vite = await createServer({ root, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true, watch: null /* F-ASSAY-E2E-8: the replayer never edits files; default watching exhausts inotify on small boxes and crashed every live agent replay */ } });
  const quiet = { log: console.log, info: console.info, debug: console.debug };
  console.log = console.info = console.debug = () => undefined;
  try {
    // The shared core retains the module-owner invariant this script's guard pins:
    // agentOrdersEventLogHash(sim.standingOrdersSnapshot()).
    const { replayAgentTape: replay } = await vite.ssrLoadModule('/src/replay/AgentTapeReplay.ts');
    return replay(rawTape, {
      traceEvery: TRACE_EVERY,
      onTrace: (trace) => process.stderr.write(`${JSON.stringify({ event: 'tick_hash', ...trace })}\n`),
    });
  } finally {
    Object.assign(console, quiet);
    await vite.close();
  }
}

if (isMain(import.meta.url)) {
  const inputPath = process.argv[2];
  if (!inputPath) {
    process.stderr.write('Usage: node scripts/assay-replay-agent.mjs <reel.json>\n');
    process.exit(1);
  }
  try {
    const payload = JSON.parse(await readFile(path.resolve(inputPath), 'utf8'));
    const replay = await replayAgentTape(payload?.reel ?? payload);
    process.stdout.write(`${JSON.stringify(replay)}\n`);
  } catch (error) {
    process.stderr.write(`assay replay failed: ${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  }
}

/**
 * A VERBATIM COPY of isMain from ./is-main.mjs (F-SF1-2, is-main-2), not an import: this file is
 * relocated without its siblings twice. assay-worker.test.mjs copies it into a bare scratch
 * scripts/ beside assay-worker.mjs alone (a fixed list), and the deploy mirror (scripts/deploy.sh,
 * MIRROR_FILTERS) ships it to the droplet assayer by name, without is-main.mjs; both were measured
 * red with the import applied. It is also the first ENGINE_SOURCE_INPUTS entry, so the check stays
 * inside the hashed bytes. scripts/is-main.test.mjs asserts this copy still matches the original
 * byte for byte; change them together.
 */
function isMain(importMetaUrl) {
  const entry = process.argv[1];
  if (!entry || !importMetaUrl) return false;
  try {
    return fs.realpathSync(entry) === fs.realpathSync(fileURLToPath(importMetaUrl));
  } catch {
    return false;
  }
}
