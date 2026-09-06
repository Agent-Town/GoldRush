#!/usr/bin/env node

/**
 * THE LINEAGE SWEEP — finds contracts whose composition moved under verified standings, and asks the
 * county to re-assay them (ADR-004 rule 2, owner ruling 2026-09-06: "we are now in the early release
 * phase, we can act freely").
 *
 * HOW IT DECIDES. An engine pin in `assets/engine-era.json` carries a `cause` written by the drain
 * that minted it. A pin whose cause NAMES a contract id is that contract's composition changing.
 * Any verified standing on that contract whose reel was recorded under an EARLIER pin was earned on
 * a board that no longer exists, so the contract goes back through the assay.
 *
 * THE TRIGGER IS DELIBERATELY OVER-INCLUSIVE, and that is the whole safety argument: a cause naming
 * a contract for an innocent reason (a data re-derivation, a receipts regeneration) costs one extra
 * replay per row and nothing else, because the RETIREMENT is decided by the replay, never by this
 * script. A row that still replays is verified again with its original first-secure date. There is
 * no path here that retires anything on a pattern match.
 *
 * IT IS DRY BY DEFAULT. Without `--commit` it reads, prints the plan and writes nothing anywhere.
 * `--commit` requires ASSAY_WORKER_SECRET and is the only mode that calls the verb.
 *
 * Usage:
 *   node scripts/assay-lineage-sweep.mjs [--base <url>] [--contract <id>] [--commit]
 *
 * Environment: ASSAY_API_BASE (default base), ASSAY_WORKER_SECRET (required by --commit).
 */

import { readFile, readdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const commit = takeFlag('--commit');
const base = takeValue('--base') ?? process.env.ASSAY_API_BASE || 'https://agenttown.app';
const only = takeValue('--contract');
if (args.length) throw new Error(`unknown option: ${args[0]}`);

const secret = process.env.ASSAY_WORKER_SECRET;
if (commit && !secret) throw new Error('--commit requires ASSAY_WORKER_SECRET');

const era = JSON.parse(await readFile(resolve(ROOT, 'assets/engine-era.json'), 'utf8'));
const pinOrdinal = pinOrdinals(era);
const contracts = await doorContracts();
const targets = contracts
  .filter((contract) => only === undefined || contract.id === only)
  .map((contract) => ({ ...contract, pin: compositionPin(contract.id) }))
  .filter((contract) => contract.pin !== null);

let swept = 0;
let called = 0;
for (const contract of targets) {
  const board = await getJson(`${base}/api/standings`, { epoch: contract.epochId, contract: contract.id });
  const verified = (board.board ?? []).filter((row) => row.assay === 'verified' && row.reel?.id);
  const stale = [];
  for (const row of verified) {
    const reel = await getJson(`${base}/api/standings`, { epoch: contract.epochId, contract: contract.id, reel: row.reel.id });
    const recorded = reel?.reel?.meta?.engineHash;
    const ordinal = typeof recorded === 'string' ? pinOrdinal.get(recorded) : undefined;
    // An unknown pin is NOT swept here: the era law already unranks a reel outside the era, and
    // guessing about a hash the registry never saw is exactly the kind of inference this file
    // refuses to make.
    if (ordinal !== undefined && ordinal < contract.pin.ordinal) stale.push({ reel: row.reel.id, recorded });
  }
  swept += 1;
  const plan = {
    event: 'lineage_sweep',
    epochId: contract.epochId,
    contractId: contract.id,
    compositionPin: contract.pin.engineHash,
    pinnedAt: contract.pin.pinnedAt,
    verified: verified.length,
    stale: stale.length,
    reels: stale.map((entry) => entry.reel),
    action: stale.length === 0 ? 'none' : commit ? 'reassay' : 'dry-run',
  };
  if (stale.length > 0 && commit) {
    const reason = `${contract.id} composition changed at engine pin ${contract.pin.engineHash.slice(0, 16)} (${contract.pin.pinnedAt})`;
    const response = await postJson(`${base}/api/standings/reassay`, {
      epochId: contract.epochId,
      contractId: contract.id,
      reason: reason.slice(0, 256),
    });
    plan.requeued = response.requeued;
    called += 1;
  }
  process.stdout.write(`${JSON.stringify(plan)}\n`);
}
process.stdout.write(`${JSON.stringify({ event: 'lineage_sweep_done', contracts: swept, reassayed: called, commit })}\n`);

function takeFlag(flag) {
  const index = args.indexOf(flag);
  if (index < 0) return false;
  args.splice(index, 1);
  return true;
}

function takeValue(flag) {
  const index = args.indexOf(flag);
  if (index < 0) return undefined;
  const value = args[index + 1];
  if (!value || value.startsWith('--')) throw new Error(`${flag} requires a value`);
  args.splice(index, 2);
  return value;
}

/** engineHash (and every alias) to the EARLIEST pin that names it; an ambiguous alias reads old. */
function pinOrdinals(registry) {
  const ordinals = new Map();
  (registry.pins ?? []).forEach((pin, ordinal) => {
    for (const hash of [pin.engineHash, ...(pin.aliases ?? [])]) {
      if (typeof hash === 'string' && !ordinals.has(hash)) ordinals.set(hash, ordinal);
    }
  });
  return ordinals;
}

/** The LATEST pin whose cause text names this contract, or null when no pin ever named it. */
function compositionPin(contractId) {
  const pins = era.pins ?? [];
  for (let ordinal = pins.length - 1; ordinal >= 0; ordinal -= 1) {
    if (typeof pins[ordinal].cause === 'string' && pins[ordinal].cause.includes(contractId)) {
      return { ordinal, engineHash: pins[ordinal].engineHash, pinnedAt: pins[ordinal].pinnedAt };
    }
  }
  return null;
}

async function doorContracts() {
  const skill = await readFile(resolve(ROOT, 'public/skill.md'), 'utf8');
  const match = skill.match(/<!-- skillmd-guard:door-contracts:start -->\s*```json\s*([\s\S]*?)\s*```\s*<!-- skillmd-guard:door-contracts:end -->/);
  if (!match) throw new Error('public/skill.md door-contracts block not found');
  const ids = new Set(JSON.parse(match[1]));
  const contractsRoot = resolve(ROOT, 'assets/contracts');
  const rows = [];
  for (const entry of await readdir(contractsRoot, { withFileTypes: true })) {
    if (!entry.isDirectory() || !entry.name.startsWith('epoch-')) continue;
    const bundle = JSON.parse(await readFile(resolve(contractsRoot, entry.name, 'contracts.json'), 'utf8'));
    for (const contract of bundle.contracts ?? []) {
      if (ids.has(contract.id) && contract.practice?.standings !== false) rows.push({ id: contract.id, epochId: entry.name });
    }
  }
  return rows.sort((a, b) => a.id.localeCompare(b.id));
}

async function getJson(endpoint, params) {
  const url = new URL(endpoint);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  const response = await fetch(url, { signal: AbortSignal.timeout(60_000) });
  const body = await response.json().catch(() => null);
  if (!response.ok || body?.ok !== true) throw new Error(`GET ${url.pathname}?${url.searchParams} failed (${response.status}): ${body?.error ?? 'unknown'}`);
  return body;
}

async function postJson(endpoint, payload) {
  const response = await fetch(endpoint, {
    method: 'POST',
    signal: AbortSignal.timeout(60_000),
    headers: { 'content-type': 'application/json', 'x-assay-key': secret },
    body: JSON.stringify(payload),
  });
  const body = await response.json().catch(() => null);
  if (!response.ok || body?.ok !== true) throw new Error(`POST ${endpoint} failed (${response.status}): ${body?.error ?? 'unknown'}`);
  return body;
}
