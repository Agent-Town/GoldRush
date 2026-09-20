import { spawn } from 'node:child_process';
import { createWriteStream } from 'node:fs';

const dir = process.argv[2];
const port = process.argv[3];
const log = createWriteStream(`/Users/robin/Claude/Projects/Gold Rush/logs/session-scratch/s1510-vite-${port}.log`);
const child = spawn('npm', ['run', 'dev', '--', '--port', port, '--strictPort', '--host', '127.0.0.1'], {
  cwd: `/Users/robin/Claude/Projects/Gold Rush/${dir}`,
  stdio: ['ignore', 'pipe', 'pipe'],
});
child.stdout.pipe(log);
child.stderr.pipe(log);
console.log('vite pid', child.pid, 'dir', dir, 'port', port);
child.unref();
// keep alive briefly so spawn survives, then detach
setTimeout(() => process.exit(0), 8000);
