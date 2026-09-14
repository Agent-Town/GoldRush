#!/usr/bin/env node
/**
 * anim-pass-gen.mjs — THE EIGHT WINDS (2026-07-28), generation arm.
 *
 * Wraps the owner-granted Codex image arm so a diagonal row is one command, is
 * reproducible from a file on disk, and never depends on a shell quoting shape
 * that the harness gates (the prompt travels as argv from a file, never through
 * $(cat ...)).
 *
 *   node scripts/anim-pass-gen.mjs --prompt <file.txt> --ref <sheet.png> \
 *        --out reviews/.../gen/<name>.png [--model gpt-5.6-sol] [--timeout 900]
 *
 * Images are claimed only from the successful CLI call's exact session directory
 * under ~/.codex/generated_images. Missing provenance fails without copying art.
 */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawn } from 'node:child_process';

const A = process.argv.slice(2);
const arg = (k, d = null) => { const i = A.indexOf(k); return i < 0 ? d : A[i + 1]; };
const promptFile = arg('--prompt');
const ref = arg('--ref');
const out = arg('--out');
const model = arg('--model', 'gpt-5.6-sol');
const timeoutSec = Number(arg('--timeout', '1200'));
if (!promptFile || !out) { console.error('need --prompt and --out'); process.exit(2); }

const GEN_DIR = path.join(os.homedir(), '.codex', 'generated_images');

const prompt = fs.readFileSync(promptFile, 'utf8');
// `-i/--image` is VARIADIC in codex-cli 0.145: a positional prompt after it is
// swallowed as another image path ("No prompt provided via stdin"). The prompt
// therefore travels on stdin, which the CLI documents as equivalent.
const args = ['exec', '-m', model, '--skip-git-repo-check', '-s', 'read-only'];
if (ref) for (const r of ref.split(',')) args.push('-i', r);

const t0 = Date.now();
console.log(`[gen] ${path.basename(out)} · model ${model} · ref ${ref ?? '(none)'} · prompt ${prompt.length} chars`);
const child = spawn('codex', args, { stdio: ['pipe', 'pipe', 'pipe'] });
child.stdin.end(prompt);
let log = '';
child.stdout.on('data', (d) => { log += d; });
child.stderr.on('data', (d) => { log += d; });
const killer = setTimeout(() => { console.error(`[gen] TIMEOUT after ${timeoutSec}s — killing`); child.kill('SIGKILL'); }, timeoutSec * 1000);

child.on('close', (code) => {
  clearTimeout(killer);
  const secs = ((Date.now() - t0) / 1000).toFixed(0);
  const logPath = out.replace(/\.png$/, '') + '.codex.log';
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(logPath, log);
  // Claim by SESSION ID, not by mtime. The arm writes to
  // ~/.codex/generated_images/<session>/call_*.png, and five of these run at
  // once — an mtime window claims the neighbours' art as well as its own, which
  // is exactly what it did on the first town batch (F-EW-2). The session id is
  // printed in the CLI banner and is unique per call.
  const sessions = [...log.matchAll(/^session id:\s*([0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12})\s*$/gim)];
  const session = sessions.length === 1 ? sessions[0][1] : null;
  const sessionDir = session ? path.join(GEN_DIR, session) : null;
  const claimed = code === 0 && sessionDir && fs.existsSync(sessionDir)
    ? fs.readdirSync(sessionDir, { withFileTypes: true })
      .filter((e) => e.isFile() && /\.(png|jpg|jpeg|webp)$/i.test(e.name))
      .map((e) => path.join(sessionDir, e.name)).sort()
    : [];
  if (!claimed.length) {
    console.error(`[gen] NO IMAGE produced (rc=${code}, ${secs}s, session ${session ?? 'unknown'}). Codex log → ${logPath}`);
    console.error(log.slice(-2500));
    process.exit(1);
  }
  claimed.forEach((p, i) => {
    const dst = i === 0 ? out : out.replace(/\.png$/, `-alt${i}.png`);
    fs.copyFileSync(p, dst);
    console.log(`[gen] OK rc=${code} ${secs}s → ${dst}  (source ${p})`);
  });
  fs.appendFileSync(logPath, `\n\n--- claimed (session ${session}) ---\n${claimed.join('\n')}\n`);
});
