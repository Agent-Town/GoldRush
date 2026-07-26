import { execFileSync } from 'node:child_process';

function probeListener(port) {
  let listeners;
  try {
    listeners = execFileSync('lsof', ['-nP', `-iTCP:${port}`, '-sTCP:LISTEN'], { encoding: 'utf8' });
  } catch (error) {
    if (error.status === 1) return null;
    throw error;
  }

  const pid = listeners.trim().split('\n')[1]?.trim().split(/\s+/)[1];
  if (!pid) throw new Error('lsof returned no readable LISTEN row');
  const cwd = execFileSync('lsof', ['-a', '-p', pid, '-d', 'cwd', '-Fn'], { encoding: 'utf8' })
    .split('\n')
    .find((line) => line.startsWith('n'))
    ?.slice(1);
  if (!cwd) throw new Error(`lsof returned no cwd for listener pid ${pid}`);
  return cwd;
}

export function resolveBase(envVarName, { root, probeListener: probe = probeListener }) {
  const base = process.env[envVarName];
  if (!base) {
    throw new Error(`${envVarName} is unset. Start a server from ${root} and pass ${envVarName}=http://127.0.0.1:<port>.`);
  }

  const url = new URL(base);
  const port = url.port || (url.protocol === 'https:' ? '443' : '80');
  let cwd;
  try {
    cwd = probe(port);
  } catch (error) {
    throw new Error(`${envVarName} port ${port} ownership is unknown: lsof probe failed (${error.message}). Start a server from ${root} and retry.`);
  }
  if (!cwd) {
    throw new Error(`${envVarName} port ${port} has no listener. Start a server from ${root} and retry.`);
  }
  if (cwd !== root) {
    throw new Error(`${envVarName} port ${port} belongs to ${cwd}, not ${root}. Start a server from ${root} and pass its URL.`);
  }
  return base;
}
