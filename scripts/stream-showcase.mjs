#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { mkdtemp, readdir, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = path.resolve(import.meta.dirname, '..');

export async function resolveSpec(input) {
  if (!input) throw new Error('A spec path or slice name is required.');
  const e2e = path.join(root, 'e2e');
  const direct = path.resolve(root, input);
  const relative = path.relative(e2e, direct);
  if (existsSync(direct) && !relative.startsWith('..') && !path.isAbsolute(relative) && direct.endsWith('.spec.ts')) return direct;
  const wanted = path.basename(input).replace(/\.spec\.ts$|\.ts$/g, '').toLowerCase();
  const specs = (await readdir(e2e)).filter((name) => name.endsWith('.spec.ts'));
  const matches = specs.filter((name) => name.toLowerCase().replace(/\.spec\.ts$/, '').includes(wanted));
  if (matches.length !== 1) throw new Error(matches.length ? `Slice name is ambiguous: ${input}` : `No e2e spec found for: ${input}`);
  return path.join(e2e, matches[0]);
}

export async function runShowcase(input, { timeoutMs = Number(process.env.STREAM_SHOWCASE_TIMEOUT_MS) || 10 * 60_000 } = {}) {
  const spec = await resolveSpec(input);
  const temp = await mkdtemp(path.join(tmpdir(), 'gold-rush-showcase-'));
  const configPath = path.join(temp, 'playwright.stream.mjs');
  const baseConfig = pathToFileURL(path.join(root, 'playwright.config.ts')).href;
  const desktop = process.env.STREAM_DISPLAY_X;
  const top = process.env.STREAM_DISPLAY_Y;
  const args = ['--window-size=1600,900'];
  if (/^-?\d+$/.test(desktop || '') && /^-?\d+$/.test(top || '')) args.push(`--window-position=${desktop},${top}`);
  await writeFile(configPath, `
import base from ${JSON.stringify(baseConfig)};
const desktop = base.projects.find((project) => project.name === 'desktop-chrome') ?? base.projects[0];
export default {
  ...base,
  testDir: ${JSON.stringify(path.join(root, 'e2e'))},
  outputDir: ${JSON.stringify(path.join(root, 'artifacts/stream-director/playwright'))},
  webServer: base.webServer ? { ...base.webServer, cwd: ${JSON.stringify(root)} } : undefined,
  workers: 1,
  use: { ...base.use, headless: false, viewport: { width: 1600, height: 900 }, screenshot: 'on', trace: 'off', launchOptions: { ...base.use?.launchOptions, slowMo: 80, args: ${JSON.stringify(args)} } },
  projects: [{ ...desktop, name: 'stream-showcase', use: { ...desktop.use, viewport: { width: 1600, height: 900 } } }],
};
`);

  const cli = path.join(root, 'node_modules/@playwright/test/cli.js');
  const child = spawn(process.execPath, [cli, 'test', spec, '--config', configPath, '--project=stream-showcase', '--reporter=line'], {
    cwd: root,
    detached: process.platform !== 'win32',
    stdio: 'inherit',
  });
  let timedOut = false;
  const stop = (signal = 'SIGTERM') => {
    if (child.exitCode !== null) return;
    try { process.kill(process.platform === 'win32' ? child.pid : -child.pid, signal); } catch {}
  };
  const timeout = setTimeout(() => { timedOut = true; stop(); setTimeout(() => stop('SIGKILL'), 3_000).unref(); }, timeoutMs);
  const onSignal = () => stop();
  process.once('SIGINT', onSignal);
  process.once('SIGTERM', onSignal);
  try {
    const code = await new Promise((resolve, reject) => { child.once('error', reject); child.once('exit', (value) => resolve(value ?? 1)); });
    if (timedOut) throw new Error('Showcase timed out.');
    return code;
  } finally {
    clearTimeout(timeout);
    process.off('SIGINT', onSignal);
    process.off('SIGTERM', onSignal);
    await rm(temp, { recursive:true, force:true });
  }
}

if (pathToFileURL(process.argv[1]).href === import.meta.url) {
  try { process.exitCode = await runShowcase(process.argv[2]); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
