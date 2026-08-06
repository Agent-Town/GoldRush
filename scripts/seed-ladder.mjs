#!/usr/bin/env node
// Seed the county ladder: one model plays one contract headless via gr-sim, and a SECURED
// run is submitted to county standings with a fully self-declared stack (owner directive
// 2026-08-06: "Maybe we could seed the ladder ourselves?"). Died/capped runs submit nothing
// (the standings API only accepts secured scores) but are logged for the Field Book batch report.
//
//   node scripts/seed-ladder.mjs --model deepseek/deepseek-v4-flash --contract the-claim --seed e1-the-claim-01
//
// Env: OPENROUTER_API_KEY (never printed). Optional: --maxCalls=40 --dry (no submit).

import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { appendFileSync, mkdirSync, readFileSync } from 'node:fs';
import { createInterface } from 'node:readline';
import { fileURLToPath } from 'node:url';

const argv = process.argv.slice(2);
const args = {};
for (let i = 0; i < argv.length; i += 1) {
  const m = /^--([^=]+)(?:=(.*))?$/.exec(argv[i]);
  if (!m) continue;
  args[m[1]] = m[2] ?? (argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true);
}
const { model, contract, seed } = args;
const maxCalls = Number(args.maxCalls ?? 40);
if (!model || !contract || !seed) { console.error('need --model --contract --seed'); process.exit(2); }
const key = process.env.OPENROUTER_API_KEY;
if (!key) { console.error('OPENROUTER_API_KEY missing'); process.exit(2); }

const EPOCHS = { 'the-claim': 'epoch-1-frontier', 'e1-': 'epoch-1-frontier', 'e2-': 'epoch-2-steamworks', 'e3-': 'epoch-3-voltage' };
const epochId = EPOCHS[contract] ?? EPOCHS[Object.keys(EPOCHS).find((p) => contract.startsWith(p))];
const API = 'https://gold-rush-3in.pages.dev';
const sha256 = (s) => createHash('sha256').update(s).digest('hex');
const profileName = model.split('/').pop().split(':')[0].split('-').map((w) => w[1] ? w[0].toUpperCase() + w.slice(1) : w.toUpperCase()).join(' ').slice(0, 24);

const sim = spawn('node', ['scripts/gr-sim.mjs', '--contract', contract, '--seed', seed], { cwd: fileURLToPath(new URL('..', import.meta.url)) });
const stdout = createInterface({ input: sim.stdout, crlfDelay: Infinity });
const queue = []; const waiters = [];
const push = (item) => { const w = waiters.shift(); w ? w(item) : queue.push(item); };
const next = () => queue.length ? Promise.resolve(queue.shift()) : new Promise((r) => waiters.push(r));
stdout.on('line', (l) => { try { push({ kind: 'out', value: JSON.parse(l) }); } catch { /* non-JSON stdout noise */ } });
createInterface({ input: sim.stderr, crlfDelay: Infinity }).on('line', (l) => {
  if (l.includes('rejected orders')) push({ kind: 'rejected', value: l.replace(/^gr-sim rejected orders:\s*/, '') });
});
sim.on('exit', (code) => push({ kind: 'exit', value: code }));

// The documented door (AP-11): the grammar below is the runtime truth from
// src/agent/StandingOrders.ts + src/game/buildables.ts — agents get the verbs by law.
const GRAMMAR = `STANDING ORDER GRAMMAR (reply is always ONE JSON array of these objects; the array REPLACES your previous orders):
  {"verb":"BUILD","what":<buildable>,"where":{"x":N,"z":N},"when":{"goldGte":N}|{"waveGte":N}}
  {"verb":"REPAIR_UNDER","pct":N}            // auto-repair works under N% hp
  {"verb":"MOVE_TO","pos":{"x":N,"z":N}}
  {"verb":"HOLD","pos":{"x":N,"z":N}}        // fight from this spot
  {"verb":"HARVEST","seam":"<seam id>"}      // pan a seam by id from the view
  {"verb":"HARVEST","sluice":N}              // tend sluice number N
  {"verb":"FALLBACK_IF","threat":{"enemiesGte":N},"pos":{"x":N,"z":N}}
Buildables: sentry_beacon, palisade, sluice, stockpile, turret, assay_office, lantern_post, decoy_shed. Sluices only work beside water. Gold pays for builds; seams and sluices earn gold. WARNING: each reply REPLACES the ENTIRE order set — always resend the full set you want active; [] wipes all orders (never send it unless you mean to stand down).`;
const messages = [
  { role: 'system', content: `You are a Gold Rush rider playing to WIN the contract. Each user message carries a JSON view of the claim at a decision point (the view's briefing, mechanics and almanac blocks explain this map). Reply with ONE JSON array of standing orders and NOTHING else — no prose, no code fences.\n${GRAMMAR}` },
  { role: 'user', content: `GOLD RUSH CONTRACT BRIEFING\nContract ${contract} at trail difficulty. Hold the claim through the posted secure wave; survive and the win is banked. Strategy that works: HOLD near your claim, BUILD a sluice beside water and turrets/palisades on the pressed edges early, HARVEST seams between waves, set REPAIR_UNDER and a FALLBACK_IF. Return one JSON array of standing orders, with no prose.` },
];
let tokensIn = 0, tokensOut = 0, calls = 0;
const ordersLog = [];

async function ask() {
  calls += 1;
  // Transport hygiene (declared in stack.config): keep system+briefing plus the last 8
  // exchanges — full history grows quadratically in cost and adds no rights the door doesn't.
  if (messages.length > 20) messages.splice(2, messages.length - 18);
  let res, body;
  for (let attempt = 1; ; attempt += 1) {
    try {
      res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
        body: JSON.stringify({ model, messages, temperature: 0, max_tokens: 3200 }),
        signal: AbortSignal.timeout(180_000),
      });
      body = await res.json();
      if (res.ok && body.choices?.[0]) break;
      if (attempt >= 3) throw new Error(`openrouter ${res.status}: ${JSON.stringify(body).slice(0, 200)}`);
    } catch (error) {
      if (attempt >= 3) throw error;
    }
    await new Promise((r) => setTimeout(r, attempt * 15_000));
  }
  tokensIn += body.usage?.prompt_tokens ?? 0;
  tokensOut += body.usage?.completion_tokens ?? 0;
  const text = body.choices[0].message.content ?? '';
  messages.push({ role: 'assistant', content: text });
  const m = /\[[\s\S]*\]/.exec(text);
  return m ? m[0] : text.trim();
}

let outcome = null; let endReason = 'unknown'; let consecutiveRejects = 0;
try {
  for (;;) {
    const item = await next();
    if (item.kind === 'exit') { endReason = outcome ? endReason : `sim-exit-${item.value}`; break; }
    if (item.kind === 'rejected') {
      consecutiveRejects += 1;
      if (consecutiveRejects > 6) { endReason = 'reject-loop'; sim.kill(); break; }
      messages.push({ role: 'user', content: JSON.stringify({ error: item.value, note: 'Orders rejected. Reply with one corrected JSON array only.' }) });
      if (calls >= maxCalls) { endReason = 'call-cap'; sim.kill(); break; }
      sim.stdin.write((await ask()).replace(/\n/g, ' ') + '\n');
      continue;
    }
    const view = item.value;
    consecutiveRejects = 0;
    if (typeof view.secured === 'boolean' && !view.now) { outcome = view; endReason = 'terminal'; continue; }
    if ((view.now?.hero?.hp ?? 1) <= 0) continue; // death view — the outcome line follows, don't ask
    messages.push({ role: 'user', content: JSON.stringify({ view }) });
    if (calls >= maxCalls) { endReason = 'call-cap'; sim.kill(); break; }
    const orders = (await ask()).replace(/\n/g, ' ');
    ordersLog.push(orders);
    try { sim.stdin.write(orders + '\n'); } catch { /* sim ended between view and reply */ }
  }
} catch (error) {
  endReason = `error: ${String(error).slice(0, 160)}`;
  sim.kill();
}

const row = { model, contract, seed, endReason, secured: outcome?.secured ?? false, waves: outcome?.waves ?? null, gold: outcome?.gold ?? null, timeMs: outcome?.timeMs ?? null, simCalls: outcome?.calls ?? null, apiCalls: calls, tokensIn, tokensOut, submitted: false };

if (outcome?.secured && !args.dry) {
  const body = {
    contractId: contract, epochId,
    score: { secured: true, waves: outcome.waves, timeAlive: Math.min(86_000, Math.round(outcome.timeMs / 1000)), gold: Math.round(outcome.gold), baseValue: 0 },
    profileName, anonId: sha256(`seed-ladder:${model}`).slice(0, 32),
    difficulty: 'trail', seed, seedMode: 'bench', seedHash: sha256(seed), inputLogHash: sha256(JSON.stringify(ordersLog)),
    stack: { model, harness: 'gr-seed-ladder', harnessVersion: '1.0', config: 'openrouter chat · skill.md briefing · temp0 · window8 · trail bench', tokensIn, tokensOut, calls },
  };
  const res = await fetch(`${API}/api/standings`, {
    method: 'POST', headers: { 'content-type': 'application/json', origin: API },
    body: JSON.stringify(body), signal: AbortSignal.timeout(30_000),
  });
  const reply = await res.json().catch(() => ({}));
  row.submitted = res.ok && reply.stored === true;
  row.rank = reply.rank ?? null;
}

mkdirSync('logs/seed-ladder', { recursive: true });
appendFileSync(`logs/seed-ladder/${new Date().toISOString().slice(0, 10)}.jsonl`, JSON.stringify(row) + '\n');
if (args.transcript) {
  const stamp = `${contract}-${seed}-${model.split('/').pop()}-${process.pid}`;
  appendFileSync(`logs/seed-ladder/transcript-${stamp}.json`, JSON.stringify({ row, messages }, null, 1));
  console.error(`transcript: logs/seed-ladder/transcript-${stamp}.json`);
}
console.log(JSON.stringify(row));
process.exit(0);
