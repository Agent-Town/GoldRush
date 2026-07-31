// Turns round 2's raw run records into the tables the review quotes. No interpretation here —
// every number below is read out of a file the harness wrote while the game was running.
// Round 2 adds three tables round 1 could not produce, because round 1's verbs never executed:
//   * the ORDER LIFECYCLE, straight off the shipped executor's own status log;
//   * the SEAM IDENTITY series (F-SO-12), sampled every wave instead of twice a run;
//   * the RANGE LEDGER — how far the hero was from each cell at the tick before it fired.
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CAMPAIGN = process.env.SO2_CAMPAIGN ?? 'r2a';
const RUN_ROOT = path.join(ROOT, 'rehearsal', 'so-runs', CAMPAIGN);

const j = (p) => JSON.parse(readFileSync(p, 'utf8'));
const n = (v, d = 2) => (typeof v === 'number' && Number.isFinite(v) ? Number(v.toFixed(d)) : v);
const CHARS_PER_TOKEN = 4; // the standard rough estimator; the review says so out loud

function almanacTable(result) {
  const log = result.finalView?.appendLog ?? [];
  const byWave = new Map(log.map((e) => [e.wave, e]));
  const rows = [];
  for (const a of result.almanacLog) {
    if (!a.almanac) continue;
    const w = a.almanac.nextWave.wave;
    const actual = byWave.get(w);
    rows.push({
      call: a.seq,
      forWave: w,
      predictedEnemies: a.almanac.nextWave.composition.reduce((s, c) => s + c.count, 0),
      actualKills: actual ? actual.kills : null,
      predictedLeaks: a.almanac.projection.expectedLeaks,
      predictedWorksDamage: n(a.almanac.projection.expectedWorksDamage),
      actualWorksDelta: actual && actual.worksHp ? n(actual.worksHp.delta) : null,
      predictedGold: n(a.almanac.projection.expectedGold),
      actualGoldDelta: actual ? n(actual.goldDelta) : null,
      outcome: actual ? actual.outcome : null,
      worksStanding: a.almanac.projection.currentWorks,
    });
  }
  return rows;
}

function callTable(result, dir) {
  const rows = [];
  const views = existsSync(dir) ? readdirSync(dir).filter((f) => /^view-\d+\.json$/.test(f)).sort() : [];
  for (const f of views) {
    const v = j(path.join(dir, f));
    const sub = result.meter.submissions.find((s) => s.seq === v.seq);
    rows.push({
      seq: v.seq,
      trigger: v.trigger,
      wave: v.wave,
      runSeconds: n(v.runSeconds, 1),
      rung: v.permissionRung,
      viewBytes: v.meter.viewBytes,
      viewBuildMs: v.meter.viewBuildMs ?? null,
      estTokens: Math.round(v.meter.viewBytes / CHARS_PER_TOKEN),
      latencyS: sub ? n(sub.latencyMs / 1000, 1) : null,
      ordersSubmitted: sub ? sub.orders.length : 0,
      held: sub ? sub.receipt.held === true : null,
      accepted: sub ? sub.receipt.ok : null,
      reason: sub && !sub.receipt.ok ? `${sub.receipt.reason}: ${sub.receipt.message ?? ''}` : null,
      note: sub ? sub.note : null,
    });
  }
  return rows;
}

/** The lifecycle, as the SHIPPED executor published it: one row per status transition, with the
 *  last reflex-rate sample taken while the order was still pending attached to it. */
function lifecycle(result) {
  return (result.orderEvents ?? []).map((e) => ({
    at: n(e.at, 1), wave: e.wave, id: e.id, verb: e.verb ?? null, what: e.what ?? null,
    where: e.where ?? null, when: e.when ?? null,
    status: e.status ?? null, surprise: e.surprise ?? null, reason: e.reason ?? null,
    goldAtEvent: e.gold ?? null,
    preFireGold: e.preFire?.gold ?? null,
    preFireCost: e.preFire?.cost ?? null,
    preFireHeroToCell: e.preFire?.heroToCell ?? null,
    preFireRunState: e.preFire?.runState ?? null,
    diagnosis: diagnose(e),
  }));
}

/** Which of gold / range / ground / cap actually killed it. The executor cannot say — every
 *  rejection carries the same six words — so this is reconstructed from the last pre-fire sample. */
function diagnose(e) {
  if (e.status !== 'failed' || !e.preFire) return null;
  if (e.verb !== 'BUILD') return e.reason ?? 'non-build failure';
  const p = e.preFire;
  if (p.gold < p.cost) return `too poor: purse ${p.gold} < cost ${p.cost}`;
  if (p.heroToCell > 6) return `out of range: hero ${p.heroToCell}wu from the cell (placeRadius 6)`;
  if (p.runState !== 'playing') return `run state ${p.runState}`;
  return 'legal-looking at the last sample — terrain, overlap or cap';
}

/** F-SO-12 re-measured: does `gold-seam-N` denote the same place all run? */
function seamIdentity(result) {
  const anchors = new Map((result.finalView?.stablePrefix?.map?.seams ?? []).map((s) => [s.id, s]));
  const rows = [];
  for (const w of result.waveLog ?? []) {
    for (const s of w.seams ?? []) {
      const a = anchors.get(s.id);
      if (!a) continue;
      const drift = Math.hypot(s.x - a.x, s.z - a.z);
      rows.push({ wave: w.wave, id: s.id, live: { x: s.x, z: s.z }, anchor: { x: a.x, z: a.z }, drift: n(drift), active: s.active });
    }
  }
  const maxDrift = rows.length ? Math.max(...rows.map((r) => r.drift)) : null;
  return { maxDrift, moved: rows.filter((r) => r.drift > 0.01).length, samples: rows.length, rows: rows.filter((r) => r.drift > 0.01).slice(0, 40) };
}

function summarise(result) {
  const bytes = result.meter.viewBytes.reduce((a, b) => a + b, 0);
  const ev = result.orderEvents ?? [];
  const done = ev.filter((e) => e.status === 'done');
  const failed = ev.filter((e) => e.status === 'failed');
  return {
    campaign: result.campaign,
    contract: result.contractId,
    outcome: result.outcome,
    finalWave: result.finalWave,
    secureWave: result.secureWave,
    seconds: result.seconds,
    kills: result.kills,
    goldAtEnd: result.gold,
    damageTaken: result.damageTaken,
    works: result.works && { turrets: result.works.turrets, beacons: result.works.beacons, sluices: result.works.sluices, palisades: result.works.palisades },
    permissionRung: result.permissionRung,
    difficulty: result.difficulty,
    riderCalls: result.meter.calls,
    riderMissed: result.meter.missed,
    holds: result.meter.submissions.filter((s) => s.receipt.held === true).length,
    submissions: result.meter.submissions.filter((s) => s.receipt.held !== true).length,
    totalViewBytes: bytes,
    estViewTokens: Math.round(bytes / CHARS_PER_TOKEN),
    meanViewBytes: result.meter.viewBytes.length ? Math.round(bytes / result.meter.viewBytes.length) : 0,
    maxViewBytes: result.meter.viewBytes.length ? Math.max(...result.meter.viewBytes) : 0,
    meanLatencyS: result.meter.latencies.length ? n(result.meter.latencies.reduce((a, b) => a + b, 0) / result.meter.latencies.length / 1000, 1) : null,
    maxLatencyS: result.meter.latencies.length ? n(Math.max(...result.meter.latencies) / 1000, 1) : null,
    callsPerWave: result.finalWave ? n(result.meter.calls / result.finalWave, 2) : null,
    ordersDone: done.length,
    ordersFailed: failed.length,
    failureReasons: failed.map((e) => `${e.verb}:${diagnose(e)}`),
    surprises: ev.filter((e) => e.surprise).reduce((acc, e) => { acc[e.surprise] = (acc[e.surprise] ?? 0) + 1; return acc; }, {}),
    rangeGuardHits: (result.rangeGuard ?? []).length,
    viewPollCount: result.meter.pollCount,
    viewPollMsMean: result.meter.pollCount ? n(result.meter.pollMsTotal / result.meter.pollCount) : null,
    viewPollMsMax: result.meter.pollMsMax,
    honesty: result.honesty,
    upgrades: result.upgrades.map((u) => u.took),
    watchdogKeyResets: result.watchdogKeyResets,
    // The two blind spots THE VIEW itself carries in a production boot, measured at the end:
    viewSeesItsOwnOrders: (result.finalView?.now?.orders ?? []).length > 0,
    viewNeedsRider: result.finalView?.now?.needsRider ?? null,
    executorNeedsRider: result.finalOrders?.needsRider ?? null,
    executorOrderCount: (result.finalOrders?.orders ?? []).length,
    viewScore: result.finalView?.now?.score ?? null,
  };
}

const out = { campaign: CAMPAIGN, contracts: {} };
if (existsSync(path.join(RUN_ROOT, 'bank-summary.json'))) out.bank = j(path.join(RUN_ROOT, 'bank-summary.json'));
for (const entry of readdirSync(RUN_ROOT, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const dir = path.join(RUN_ROOT, entry.name);
  const rp = path.join(dir, 'result.json');
  if (!existsSync(rp)) continue;
  const result = j(rp);
  out.contracts[entry.name] = {
    summary: summarise(result),
    calls: callTable(result, dir),
    lifecycle: lifecycle(result),
    almanac: almanacTable(result),
    seamIdentity: seamIdentity(result),
    rangeGuard: result.rangeGuard ?? [],
    waveLog: (result.waveLog ?? []).map((w) => ({ ...w, seams: undefined })),
    appendLog: result.finalView?.appendLog ?? [],
    finalOrders: result.finalOrders,
  };
}
console.log(JSON.stringify(out, null, 1));
