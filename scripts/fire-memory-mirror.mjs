#!/usr/bin/env node
// FM-01 (owner ruling 2026-09-24, item 16: "mirror it into the private archive repository"): the fires' distilled
// memory (~/.claude-fires/projects/<repo>/memory, no secrets by the s2660 scan) lives on one disk. This mirrors it
// into the PRIVATE archive remote (`archive`, Agent-Town/GoldRush-archive) on the orphan branch `fire-memory`,
// one commit per run, never into the public working repo. Idempotent: an unchanged tree makes no commit.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync, cpSync, readdirSync } from 'node:fs';
import { tmpdir, homedir } from 'node:os';
import { join } from 'node:path';
const ROOT = process.cwd();
const SRC = join(homedir(), '.claude-fires', 'projects', '-Users-robin-Claude-Projects-Gold-Rush', 'memory');
const REMOTE = process.env.GR_ARCHIVE_REMOTE ?? execFileSync('git', ['remote', 'get-url', 'archive'], { cwd: ROOT, encoding: 'utf8' }).trim();
const BRANCH = 'fire-memory';
if (!existsSync(SRC)) { console.log(`fire-memory-mirror: nothing at ${SRC}`); process.exit(0); }
const secretish = /(sk-[A-Za-z0-9]{8,}|AKIA[0-9A-Z]{12,}|-----BEGIN [A-Z ]*PRIVATE KEY|api[_-]?key\s*[:=]\s*['"][^'"]{12,}|token\s*[:=]\s*['"][^'"]{16,})/i;
const walk = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)]);
import { readFileSync } from 'node:fs';
const hits = walk(SRC).filter((f) => secretish.test(readFileSync(f, 'utf8')));
if (hits.length) { console.error(`fire-memory-mirror: REFUSED, ${hits.length} file(s) look secret-bearing: ${hits.map((h) => h.slice(SRC.length + 1)).join(', ')}`); process.exit(2); }
const work = mkdtempSync(join(tmpdir(), 'fire-memory-'));
const git = (args, opts = {}) => execFileSync('git', args, { cwd: work, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], ...opts }).trim();
try {
  execFileSync('git', ['init', '-q', work]);
  git(['remote', 'add', 'origin', REMOTE]);
  let has = true;
  try { git(['fetch', '-q', '--depth', '1', 'origin', BRANCH]); git(['checkout', '-q', '-B', BRANCH, 'FETCH_HEAD']); } catch { has = false; git(['checkout', '-q', '--orphan', BRANCH]); }
  for (const e of readdirSync(work)) if (e !== '.git') rmSync(join(work, e), { recursive: true, force: true });
  cpSync(SRC, join(work, 'memory'), { recursive: true });
  git(['add', '-A', '--', 'memory']);
  const staged = git(['status', '--porcelain']);
  if (!staged) { console.log(`fire-memory-mirror: unchanged (${has ? 'branch up to date' : 'empty'})`); process.exit(0); }
  const stamp = new Date().toISOString().slice(0, 16) + 'Z';
  git(['-c', 'user.name=Gold Rush factory', '-c', 'user.email=factory@agenttown.app', 'commit', '-q', '-m', `fire memory mirror ${stamp} (${staged.split('\n').length} path(s) changed)`]);
  git(['push', '-q', 'origin', `${BRANCH}:${BRANCH}`]);
  console.log(`fire-memory-mirror: pushed ${BRANCH} at ${stamp}, ${staged.split('\n').length} path(s) changed`);
} finally { rmSync(work, { recursive: true, force: true }); }
