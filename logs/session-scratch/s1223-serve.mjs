// s1223: start a scratch vite dev server on a free port, detached, and report readiness.
// Port 5188 is shared with the live lane worktrees (a baseline run there can kill a live run),
// so every measurement this fire makes is pinned to its own port.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import net from 'node:net';

const port = Number(process.argv[2] || 5233);

// stdio MUST be a file, never a pipe. A detached child whose parent has exited dies the moment the
// 64 KB pipe buffer fills — which is silent, and lands mid-measurement: it killed s1223's first
// control arm and dressed it up as 8/8 red (ERR_CONNECTION_REFUSED, not the bug under test).
const logPath = `logs/session-scratch/s1223-vite-${port}.log`;
const logFd = fs.openSync(logPath, 'a');

const child = spawn(
  process.execPath,
  ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', String(port), '--strictPort'],
  { cwd: process.cwd(), detached: true, stdio: ['ignore', logFd, logFd] },
);

const out = `see ${logPath}`;

const deadline = Date.now() + 45_000;
const poll = () => {
  const s = net.createConnection({ host: '127.0.0.1', port });
  s.on('connect', () => {
    s.destroy();
    console.log(`READY port=${port} pid=${child.pid}`);
    child.unref();
    process.exit(0);
  });
  s.on('error', () => {
    if (Date.now() > deadline) {
      console.log('TIMEOUT\n' + out);
      process.exit(1);
    }
    setTimeout(poll, 500);
  });
};
poll();
