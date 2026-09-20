// dome-basin-winnable measurement runner. Drives scripts/gr-sim.mjs with a controller module and
// records the death point, the wrecking/repair curve, and the reel measured the way the DOOR
// measures it (compact JSON.stringify, not the pretty-printed file gr-sim.mjs:326 writes).
// usage: node artifacts/dome-basin-winnable/run.mjs <tag> [controller.mjs]   (no controller => idle)
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const OUT = 'artifacts/dome-basin-winnable';
const CONTRACT = process.env.GR_CONTRACT ?? 'e9-dome-basin';
const SEED = process.env.GR_SEED ?? 'e9-dome-basin-01';

const tag = process.argv[2];
const ctrlPath = process.argv[3];
if (!tag) { console.error('need tag'); process.exit(2); }

const tape = path.join(OUT, `${tag}-tape.json`);
const args = ['scripts/gr-sim.mjs', '--contract', CONTRACT, '--seed', SEED, '--tape', tape];
let controller = null;
if (ctrlPath) {
  const mod = await import(path.resolve(ctrlPath) + `?v=${Date.now()}`);
  controller = mod.default ?? mod.controller;
} else {
  args.push('--policy=idle');
}

const child = spawn('node', args, { stdio: ['pipe', 'pipe', 'pipe'] });
let buf = '';
let stderr = '';
const trace = [];
let outcome = null;
const state = { tag };
let viewCount = 0;

child.stderr.on('data', (d) => { stderr += d.toString(); });
child.stdout.on('data', (d) => {
  buf += d.toString();
  let i;
  while ((i = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, i);
    buf = buf.slice(i + 1);
    if (!line.trim()) continue;
    let obj;
    try { obj = JSON.parse(line); } catch { continue; }
    if (obj.schema === 'goldrush.view.v1') {
      viewCount += 1;
      const n = obj.now;
      trace.push({
        t: +(n.timers?.runSeconds ?? 0), wave: n.wave, gold: n.gold,
        hp: n.hero?.hp, maxHp: n.hero?.maxHp, lvl: n.hero?.level,
        alive: n.threats?.alive, killed: n.threats?.defeatedTotal,
        works: n.works?.byKind, wrecked: n.works?.wrecked, worksHp: n.works?.hp, worksMaxHp: n.works?.maxHp, standing: n.works?.standing, wreckers: n.threats?.wreckers, thieves: n.threats?.thieves,
        panned: n.score?.goldPanned,
        fails: (n.orders || []).filter((o) => o.status === 'failed').map((o) => `${o.order?.verb}:${o.reason || ''}`).slice(0, 4),
      });
      if (controller) {
        let out;
        try { out = controller(obj, state, viewCount); } catch (e) { out = []; state.ctrlError = String(e?.stack ?? e); }
        if (out === null || out === undefined) out = [];
        if (out === 'BLANK') child.stdin.write('\n');
        else child.stdin.write(`${JSON.stringify(out)}\n`);
      }
    } else if (obj.secured !== undefined || obj.eventLogHash !== undefined) {
      outcome = obj;
    }
  }
});

child.on('close', async (code) => {
  let reel = null;
  try {
    const raw = fs.readFileSync(tape, 'utf8');
    const t = JSON.parse(raw);
    const compact = Buffer.byteLength(JSON.stringify(t));
    const { createServer } = await import('vite');
    const vite = await createServer({ root: process.cwd(), appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });
    let env, admitted;
    try {
      const { runTapeEnvelopeForContract } = await vite.ssrLoadModule('/src/playbook/PlaybookFormat.ts');
      const { validateTape } = await vite.ssrLoadModule('/functions/api/standings.ts');
      env = runTapeEnvelopeForContract(t.contract);
      admitted = validateTape(t, t.contract, t.seed, t.difficulty) !== null;
    } finally { await vite.close(); }
    reel = {
      prettyFileBytes: Buffer.byteLength(raw), compactBytes: compact,
      entries: t.inputLog.entries.length, durationTicks: t.inputLog.durationTicks,
      eventLogHash: t.eventLogHash, envelope: env,
      underBytes: compact <= env.maxTapeBytes, underEntries: t.inputLog.entries.length <= env.maxEntries,
      underTicks: t.inputLog.durationTicks <= env.maxTicks, doorAdmitted: admitted,
    };
  } catch (e) { reel = { error: String(e) }; }
  const summary = { tag, contract: CONTRACT, seed: SEED, exitCode: code, outcome, views: viewCount, reel, ctrlError: state.ctrlError ?? null, stderrTail: stderr.split('\n').slice(-6).join('\n') };
  fs.writeFileSync(path.join(OUT, `${tag}-summary.json`), JSON.stringify(summary, null, 1));
  fs.writeFileSync(path.join(OUT, `${tag}-trace.json`), JSON.stringify(trace));
  console.log(JSON.stringify(summary));
});
