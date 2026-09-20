// needs-cells-art-batch runner. One paid request per row per attempt; the exact charge is read from
// the account balance either side of the call, so the ledger carries money, not an estimate.
// A "request failed (no response received)" HAS already charged — never blind-retry (higgsfield SKILL.md).
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync, readFileSync, statSync } from 'node:fs';
import sharp from 'sharp';
import { ROWS, buildPrompt } from './rows.mjs';

const HF = '/Users/robin/.nvm/versions/node/v23.11.1/bin/higgsfield';
const DIR = 'artifacts/needs-cells-art-batch';
const CAP = 600;            // credits, owner's cap for this task
const LEDGER = `${DIR}/ledger.jsonl`;
mkdirSync(`${DIR}/attempts`, { recursive: true });
mkdirSync(`${DIR}/refs`, { recursive: true });

const log = (o) => writeFileSync(LEDGER, JSON.stringify({ at: new Date().toISOString(), ...o }) + '\n', { flag: 'a' });
const spent = () => {
  if (!existsSync(LEDGER)) return 0;
  return readFileSync(LEDGER, 'utf8').trim().split('\n').filter(Boolean)
    .map((l) => JSON.parse(l)).reduce((a, r) => a + (Number(r.credits) || 0), 0);
};
function balance() {
  const out = execFileSync(HF, ['account', 'status'], { encoding: 'utf8', timeout: 60000 });
  const m = out.match(/([0-9]+(?:\.[0-9]+)?)\s*credits/i);
  return m ? Number(m[1]) : null;
}
async function makeRef(row) {
  const out = `${DIR}/refs/${row.id}.png`;
  const N = row.refs.length, S = 1024;
  const cols = Math.ceil(Math.sqrt(N)), rows = Math.ceil(N / cols);
  const comps = [];
  for (let i = 0; i < N; i += 1) {
    const buf = await sharp(row.refs[i]).resize(S, S, { fit: 'contain', background: { r: 255, g: 0, b: 255, alpha: 1 } }).flatten({ background: { r: 255, g: 0, b: 255 } }).png().toBuffer();
    comps.push({ input: buf, left: (i % cols) * S, top: Math.floor(i / cols) * S });
  }
  await sharp({ create: { width: cols * S, height: rows * S, channels: 3, background: { r: 255, g: 0, b: 255 } } }).composite(comps).png().toFile(out);
  return out;
}
// The CLI's auto-upload of a local path signs badly (SignatureDoesNotMatch); mint an upload id first.
const UPL = `${DIR}/uploads.json`;
const uploads = existsSync(UPL) ? JSON.parse(readFileSync(UPL, 'utf8')) : {};
function uploadId(file) {
  const key = `${file}:${statSync(file).size}`;
  if (uploads[key]) return uploads[key];
  const out = execFileSync(HF, ['upload', 'create', file], { encoding: 'utf8', timeout: 180000 });
  const id = (out.match(/[0-9a-f-]{36}/) || [])[0];
  if (!id) throw new Error('no upload id: ' + out.slice(0, 200));
  uploads[key] = id; writeFileSync(UPL, JSON.stringify(uploads, null, 1));
  return id;
}

const only = process.argv.slice(2).filter((a) => !a.startsWith('-'));
const force = process.argv.includes('--force');

for (const row of ROWS) {
  if (only.length && !only.includes(row.id)) continue;
  const attemptsSoFar = existsSync(LEDGER)
    ? readFileSync(LEDGER, 'utf8').trim().split('\n').filter(Boolean).map((l) => JSON.parse(l)).filter((r) => r.row === row.id && r.kind === 'generation' && ((Number(r.credits) || 0) > 0 || r.file)).length
    : 0;
  if (attemptsSoFar >= 3 && !force) { console.log(`${row.id}: 3 attempts already, skipping`); continue; }
  const used = spent();
  if (used + 12 > CAP) { console.log(`CREDIT CAP: ${used} spent, stopping before ${row.id}`); log({ kind: 'stop', reason: 'credit cap', used }); break; }

  const refFile = await makeRef(row);
  const prompt = buildPrompt(row);
  const n = attemptsSoFar + 1;
  const before = balance();
  // gpt_image_2 (the master's model) is REFUSED on this account: job_minimum_basic_plan_required,
  // three times, zero credits charged (F-NCB-1). Nano Banana Pro is the skill's own default for
  // reference-driven character work, runs on the free plan, and costs 2 credits at 2k / 4 at 4k.
  const MODEL = process.env.NCB_MODEL || 'nano_banana_pro';
  const RES = process.env.NCB_RES || '2k';
  const args = ['generate', 'create', MODEL, '--prompt', prompt, '--image-references', uploadId(refFile),
    '--aspect_ratio', '1:1', '--resolution', RES, '--wait', '--wait-timeout', '15m'];
  let out = '', err = null;
  const t0 = Date.now();
  try {
    out = execFileSync(HF, args, { encoding: 'utf8', timeout: 1020000, stdio: ['ignore', 'pipe', 'pipe'] });
  } catch (e) {
    err = String(e.stderr || e.message).slice(0, 400);
    out = String(e.stdout || '');
  }
  const after = balance();
  const credits = before != null && after != null ? +(before - after).toFixed(2) : null;
  const url = (out.match(/https:\/\/[^\s"']+\.(png|jpg|jpeg|webp)[^\s"']*/i) || [])[0];
  const id = (out.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/) || [])[0];
  let file = null;
  if (url) {
    file = `${DIR}/attempts/${row.id}-${n}.png`;
    try { execFileSync('curl', ['-sSL', '-o', file, url], { timeout: 180000 }); } catch { file = null; }
  }
  log({ kind: 'generation', row: row.id, attempt: n, model: MODEL, resolution: RES, requestId: id || null, credits, balanceBefore: before, balanceAfter: after,
        seconds: Math.round((Date.now() - t0) / 1000), url: url || null, file, error: err, promptChars: prompt.length, refs: row.refs });
  console.log(`${row.id} #${n}: credits=${credits} id=${id || '-'} file=${file || 'NONE'}${err ? ' ERR ' + err.slice(0, 120) : ''}`);
  if (!url && !err) console.log('  raw output head:', out.slice(0, 300).replace(/\n/g, ' | '));
}
console.log('TOTAL SPENT', spent());
