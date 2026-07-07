import { spawn } from 'node:child_process';
import net from 'node:net';

const port = Number(process.env.GR_CAPTURE_PORT) || (await freePort(5320, 5399));
const baseURL = `http://127.0.0.1:${port}`;
const server = spawn('npx', ['vite', '--host', '127.0.0.1', '--port', String(port), '--strictPort'], {
  stdio: ['ignore', 'pipe', 'pipe'],
});

let shuttingDown = false;
const stopServer = () => {
  if (shuttingDown) return;
  shuttingDown = true;
  server.kill('SIGTERM');
};
process.on('SIGINT', () => {
  stopServer();
  process.exit(130);
});
process.on('SIGTERM', () => {
  stopServer();
  process.exit(143);
});

try {
  server.stdout.on('data', (chunk) => process.stdout.write(chunk));
  server.stderr.on('data', (chunk) => process.stderr.write(chunk));
  await waitForHttp(baseURL);
  const code = await runPlaywright(baseURL);
  stopServer();
  process.exitCode = code;
} catch (error) {
  stopServer();
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}

function runPlaywright(baseURL) {
  return new Promise((resolve) => {
    const child = spawn(
      'npx',
      ['playwright', 'test', 'e2e/mkt-capture.rig.ts', '--project=desktop-chrome', '--workers=1', '--reporter=line'],
      {
        stdio: 'inherit',
        env: {
          ...process.env,
          GR_CAPTURE_BASE_URL: baseURL,
          GR_CAPTURE_EXTERNAL_SERVER: '1',
          GR_CAPTURE_RUN: '1',
        },
      },
    );
    child.on('exit', (code) => resolve(code ?? 1));
  });
}

async function waitForHttp(url) {
  const deadline = Date.now() + 20_000;
  while (Date.now() < deadline) {
    if (server.exitCode !== null) throw new Error(`vite exited early with ${server.exitCode}`);
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`vite did not answer at ${url}`);
}

function freePort(start, end) {
  return new Promise((resolve, reject) => {
    const tryPort = (port) => {
      if (port > end) {
        reject(new Error(`no free port in ${start}-${end}`));
        return;
      }
      const tester = net.createServer();
      tester.once('error', () => tryPort(port + 1));
      tester.once('listening', () => {
        tester.close(() => resolve(port));
      });
      tester.listen(port, '127.0.0.1');
    };
    tryPort(start);
  });
}
