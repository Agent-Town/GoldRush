// s1224: start a scratch vite dev server for an ARBITRARY tree (argv[2]=cwd, argv[3]=port).
//
// Same shape as s1223-serve.mjs, with one change: the tree being served is a parameter, so a
// control arm can serve a detached worktree while the treatment arm serves the working tree.
// Port 5188 is deliberately avoided — it is shared with the live lane worktrees.
//
// stdio MUST be a file, never a pipe (s1223's lesson): a detached child whose parent has exited
// dies the moment the 64 KB pipe buffer fills, silently, mid-measurement — and an arm that dies
// reports ERR_CONNECTION_REFUSED, which looks exactly like a red.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import net from 'node:net';

const cwd = process.argv[2];
const port = Number(process.argv[3] || 5236);
if (!cwd || !fs.existsSync(cwd)) throw new Error('usage: s1224-serve-cwd.mjs <cwd> <port>');

const logPath = `logs/session-scratch/s1224-vite-${port}.log`;
const logFd = fs.openSync(logPath, 'a');

const child = spawn(
  process.execPath,
  ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', String(port), '--strictPort'],
  { cwd, detached: true, stdio: ['ignore', logFd, logFd] },
);

const deadline = Date.now() + 60_000;
const poll = () => {
  const s = net.createConnection({ host: '127.0.0.1', port });
  s.on('connect', () => {
    s.destroy();
    console.log(`READY port=${port} pid=${child.pid} cwd=${cwd}`);
    child.unref();
    process.exit(0);
  });
  s.on('error', () => {
    if (Date.now() > deadline) {
      console.log('TIMEOUT — see ' + logPath);
      process.exit(1);
    }
    setTimeout(poll, 500);
  });
};
poll();
