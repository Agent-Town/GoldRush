#!/usr/bin/env node
// THE FACTORY USAGE CENSUS — every token, every arm of the factory (owner-requested 2026-07-19).
// Sums: (a) Claude transcripts for this project (attended sessions + headless fires),
//       (b) codex app sessions whose cwd belongs to Gold Rush (Sol 3D lanes, runner tasks, shifts).
// Per-file totals cached by size+mtime → incremental after the first pass.
import { createReadStream, readFileSync, writeFileSync, existsSync, statSync, readdirSync } from 'node:fs';
import { createInterface } from 'node:readline';
import { join } from 'node:path';
import { homedir } from 'node:os';

const CACHE = 'logs/.usage-census-cache.json';
const OUT = 'logs/factory-usage.json';
const cache = existsSync(CACHE) ? JSON.parse(readFileSync(CACHE, 'utf8')) : {};

const walk = (dir, out = []) => {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith('.jsonl')) out.push(p);
  }
  return out;
};

async function sumFile(path, kind) {
  const st = statSync(path);
  const key = `${path}:${st.size}:${Math.floor(st.mtimeMs)}`;
  if (cache[key]) return cache[key];
  const totals = { in: 0, out: 0, cached: 0, gr: kind !== 'codex', fire: false, sawCwd: false };
  const rl = createInterface({ input: createReadStream(path), crlfDelay: Infinity });
  let firstLines = 0;
  for await (const line of rl) {
    if (firstLines < 25) {
      firstLines++;
      if (kind === 'codex' && !totals.sawCwd && line.includes('"cwd"')) {
        totals.sawCwd = true;
        totals.gr = line.includes('Gold Rush') || line.includes('Gold%20Rush') || line.includes('GoldRush');
      }
      if (kind === 'claude' && (line.includes('fire.md') || line.includes('the fire protocol'))) totals.fire = true;
    }
    if (!totals.gr && kind === 'codex' && firstLines >= 25) break;
    if (kind === 'claude') {
      if (!line.includes('"usage"')) continue;
      try {
        const j = JSON.parse(line);
        const u = j.message?.usage;
        if (u) { totals.in += (u.input_tokens || 0) + (u.cache_creation_input_tokens || 0); totals.out += u.output_tokens || 0; }
      } catch {}
    } else {
      if (!line.includes('"total_token_usage"')) continue;
      const m = line.match(/"total_token_usage":\{"input_tokens":(\d+),"cached_input_tokens":(\d+),"output_tokens":(\d+)/);
      if (m) { totals.in = +m[1] - +m[2]; totals.cached = +m[2]; totals.out = +m[3]; }
    }
  }
  cache[key] = totals;
  return totals;
}

const claudeDir = join(homedir(), '.claude/projects/-Users-robin-Claude-Projects-Gold-Rush');
const codexDir = join(homedir(), '.codex/sessions');
const agg = { attended: { in: 0, out: 0, files: 0 }, fires: { in: 0, out: 0, files: 0 }, codexGR: { in: 0, out: 0, files: 0 }, stamped: new Date().toISOString().slice(0, 16) };

for (const f of existsSync(claudeDir) ? walk(claudeDir) : []) {
  const t = await sumFile(f, 'claude');
  const b = t.fire ? agg.fires : agg.attended;
  b.in += t.in; b.out += t.out; b.files++;
}
for (const f of existsSync(codexDir) ? walk(codexDir) : []) {
  const t = await sumFile(f, 'codex');
  if (t.gr) { agg.codexGR.in += t.in; agg.codexGR.out += t.out; agg.codexGR.cached = (agg.codexGR.cached||0) + (t.cached||0); agg.codexGR.files++; }
}
writeFileSync(CACHE, JSON.stringify(cache));
writeFileSync(OUT, JSON.stringify(agg, null, 1));
const M = (n) => (n / 1e6).toFixed(1) + 'M';
console.log(`CENSUS ${agg.stamped}`);
console.log(`attended (Fable/Claude): ${agg.attended.files} sessions · in ${M(agg.attended.in)} · out ${M(agg.attended.out)}`);
console.log(`fires (headless Claude): ${agg.fires.files} sessions · in ${M(agg.fires.in)} · out ${M(agg.fires.out)}`);
console.log(`codex Gold Rush (Sol lanes + runner + shifts): ${agg.codexGR.files} sessions · fresh-in ${M(agg.codexGR.in)} · cached-in ${M(agg.codexGR.cached||0)} · out ${M(agg.codexGR.out)}`);
console.log(`FACTORY TOTAL: in ${M(agg.attended.in + agg.fires.in + agg.codexGR.in)} · out ${M(agg.attended.out + agg.fires.out + agg.codexGR.out)}`);
