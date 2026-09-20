#!/usr/bin/env node
// F-RECUT-7 — THE REPO-WIDE LOSSLESS RE-ENCODE of assets/processed/**.
// Same tool and same verification as the re-cut's own stage
// (artifacts/town-cast-walk8-hard-alpha-recut/lossless-reencode.mjs): zopflipng, then every output
// read back with pngjs and compared to the input on ALL FOUR channels before it is kept, and kept
// only when it is smaller. Two differences: this runs the whole directory with N workers, and it
// EXCLUDES the 243 shipped cells that today reproduce byte-identically from their
// assets/processed-full master (artifacts/.../downscale-identical.json) — the F-1464-1 rule, "master-
// derived shipped cells retain their exact repository encoding so the downscale byte gate stays green".
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFile } from 'node:child_process';
import { PNG } from 'pngjs';

const ZOPFLI = '/opt/homebrew/anaconda3/bin/zopflipng';
const ROOT = 'assets/processed';
const OUT = 'artifacts/hygiene-battery-lossless-triangles';
const APPLY = process.env.APPLY === '1';
const WORKERS = Number(process.env.WORKERS ?? 6);
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'lossless-pass-'));

const excluded = new Set(JSON.parse(fs.readFileSync(`${OUT}/downscale-identical.json`, 'utf8')).files);
const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true })
  .flatMap((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]));
const all = walk(ROOT).filter((f) => f.endsWith('.png')).sort();
const files = all.filter((f) => !excluded.has(path.basename(f)));
console.log(`corpus ${all.length} png, excluded ${all.length - files.length} master-derived byte-identical, to encode ${files.length}`);

const rows = [];
let done = 0, shrunk = 0, held = 0, before = 0, after = 0;
const run = (src, dst) => new Promise((resolve, reject) =>
  execFile(ZOPFLI, ['-y', src, dst], (error) => (error ? reject(error) : resolve())));

async function worker(id) {
  for (let i = id; i < files.length; i += WORKERS) {
    const f = files[i];
    const dst = path.join(TMP, `w${id}.png`);
    const srcBuf = fs.readFileSync(f);
    await run(f, dst);
    const outBuf = fs.readFileSync(dst);
    const a = PNG.sync.read(srcBuf), b = PNG.sync.read(outBuf);
    if (a.width !== b.width || a.height !== b.height) throw new Error(`${f}: dimensions moved`);
    if (a.data.length !== b.data.length) throw new Error(`${f}: channel count moved`);
    for (let j = 0; j < a.data.length; j += 1) if (a.data[j] !== b.data[j]) throw new Error(`${f}: NOT pixel-identical at byte ${j}`);
    before += srcBuf.length;
    if (outBuf.length < srcBuf.length) {
      after += outBuf.length; shrunk += 1;
      if (APPLY) fs.writeFileSync(f, outBuf);
      rows.push([f, srcBuf.length, outBuf.length]);
    } else { after += srcBuf.length; held += 1; rows.push([f, srcBuf.length, srcBuf.length]); }
    done += 1;
    if (done % 100 === 0) console.log(`${done}/${files.length} · shrunk ${shrunk} · saved ${before - after} B`);
  }
}

await Promise.all(Array.from({ length: WORKERS }, (_, id) => worker(id)));
fs.rmSync(TMP, { recursive: true, force: true });
const summary = { applied: APPLY, files: files.length, excluded: all.length - files.length, shrunk, held, before, after, saved: before - after };
fs.writeFileSync(`${OUT}/lossless-pass-rows.json`, JSON.stringify({ ...summary, rows }, null, 1) + '\n');
console.log(JSON.stringify(summary, null, 1));
