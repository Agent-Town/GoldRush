// Turns the rehearsal's raw run records into the tables the review quotes. No interpretation here —
// every number below is read out of a file the harness wrote while the game was running.
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CAMPAIGN = process.env.SO_CAMPAIGN ?? 'so-1';
const RUN_ROOT = path.join(ROOT, 'rehearsal', 'so-runs', CAMPAIGN);

const j = (p) => JSON.parse(readFileSync(p, 'utf8'));
const n = (v, d = 2) => (typeof v === 'number' && Number.isFinite(v) ? Number(v.toFixed(d)) : v);
const CHARS_PER_TOKEN = 4; // the standard rough estimator; the review says so out loud

function almanacTable(result) {
  // Each call's almanac speaks about the NEXT wave. The truth for that wave is the appendLog entry
  // the game itself writes when that wave closes. Match them by wave number.
  const log = result.finalView?.appendLog ?? [];
  const byWave = new Map(log.map((e) => [e.wave, e]));
  const rows = [];
  for (const a of result.almanacLog) {
    if (!a.almanac) continue;
    const w = a.almanac.nextWave.wave;
    const actual = byWave.get(w);
    const predictedCount = a.almanac.nextWave.composition.reduce((s, c) => s + c.count, 0);
    rows.push({
      call: a.seq,
      forWave: w,
      predictedEnemies: predictedCount,
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
      estTokens: Math.round(v.meter.viewBytes / CHARS_PER_TOKEN),
      latencyS: sub ? n(sub.latencyMs / 1000, 1) : null,
      ordersSubmitted: sub ? sub.orders.length : 0,
      accepted: sub ? sub.receipt.ok : null,
      reason: sub && !sub.receipt.ok ? `${sub.receipt.reason}: ${sub.receipt.message ?? ''}` : null,
      note: sub ? sub.note : null,
      orders: sub ? sub.orders : null,
    });
  }
  return rows;
}

function summarise(result, dir) {
  const bytes = result.meter.viewBytes.reduce((a, b) => a + b, 0);
  return {
    contract: result.contractId,
    outcome: result.outcome,
    finalWave: result.finalWave,
    secureWave: result.secureWave,
    seconds: result.seconds,
    kills: result.kills,
    goldAtEnd: result.gold,
    works: result.works && { turrets: result.works.turrets, beacons: result.works.beacons, sluices: result.works.sluices, palisades: result.works.palisades },
    permissionRung: result.permissionRung,
    difficulty: result.difficulty,
    riderCalls: result.meter.calls,
    riderMissed: result.meter.missed,
    totalViewBytes: bytes,
    estViewTokens: Math.round(bytes / CHARS_PER_TOKEN),
    meanViewBytes: result.meter.viewBytes.length ? Math.round(bytes / result.meter.viewBytes.length) : 0,
    maxViewBytes: result.meter.viewBytes.length ? Math.max(...result.meter.viewBytes) : 0,
    meanLatencyS: result.meter.latencies.length ? n(result.meter.latencies.reduce((a, b) => a + b, 0) / result.meter.latencies.length / 1000, 1) : null,
    callsPerWave: result.finalWave ? n(result.meter.calls / result.finalWave, 2) : null,
    honesty: result.honesty,
    upgrades: result.upgrades.map((u) => u.took),
    ordersPlaced: (result.riderAudit?.builds ?? []).filter((b) => b.result === 'placed').length,
    ordersRejected: (result.riderAudit?.builds ?? []).filter((b) => b.result !== 'placed').map((b) => b.result),
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
    summary: summarise(result, dir),
    calls: callTable(result, dir),
    almanac: almanacTable(result),
    waveLog: result.waveLog,
    stageLog: result.stageLog,
    riderBuilds: result.riderAudit?.builds ?? [],
    finalOrders: result.finalOrders,
    finalScore: result.finalView?.now?.score ?? null,
    appendLog: result.finalView?.appendLog ?? [],
  };
}
console.log(JSON.stringify(out, null, 1));
