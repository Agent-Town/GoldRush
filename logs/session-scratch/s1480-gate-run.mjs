#!/usr/bin/env node
// s1480 gate runner — runs a playwright spec in the gate worktree against an EXTERNAL
// dev server on a scratch port. Needed because port 5188 is held by another session's
// milk shift (gr-milk-deepwater-surgery), and playwright.config.ts hardcodes 5188 with
// strictPort; only GR_CAPTURE_BASE_URL redirects it (F: "PORT sets NOTHING").
// Usage: node s1480-gate-run.mjs <spec-path> [more playwright args...]
import { spawnSync } from 'node:child_process';

const GATE = '/Users/robin/Claude/Projects/Gold Rush/gate-s1480';
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('usage: s1480-gate-run.mjs <spec> [args...]');
  process.exit(2);
}

const r = spawnSync(
  'npx',
  ['playwright', 'test', ...args, '--workers=1', '--reporter=line'],
  {
    cwd: GATE,
    stdio: 'inherit',
    env: {
      ...process.env,
      GR_CAPTURE_BASE_URL: 'http://127.0.0.1:5234',
      GR_CAPTURE_EXTERNAL_SERVER: '1',
    },
  },
);
process.exit(r.status ?? 1);
