#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { copyFileSync, mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const tapes = join(root, 'bench/gauntlet/tapes');
mkdirSync(tapes, { recursive: true });

const players = [
  ['bench/gauntlet/heat1/pi/gauntlet-player.mjs', 'pi-the-claim.json', '10936bb4f^'],
  ['bench/gauntlet/heat2/omp/standalone-player.mjs', 'omp-the-claim.json'],
  ['bench/gauntlet/heat2/prime-sol/the-claim-player.mjs', 'prime-sol-the-claim.json'],
];

for (const [source, name, revision] of players) runPlayer(source, join(tapes, name), revision);

function runPlayer(source, tape, revision) {
  const directory = mkdtempSync(join(tmpdir(), 'gold-rush-agent-backfill-'));
  const player = join(directory, basename(source));
  const hook = join(directory, 'append-tape-arg.mjs');
  try {
    if (revision) {
      const archived = spawnSync('git', ['show', `${revision}:${source}`], { cwd: root, encoding: 'utf8' });
      if (archived.status !== 0) throw new Error(`cannot read ${source} at ${revision}:\n${archived.stderr}`);
      writeFileSync(player, archived.stdout);
    } else copyFileSync(join(root, source), player);
    if (basename(source) === 'standalone-player.mjs') copyFileSync(player, join(directory, 'player.mjs'));
    symlinkSync(join(root, 'scripts'), join(directory, 'scripts'));
    symlinkSync(join(root, 'package.json'), join(directory, 'package.json'));
    symlinkSync(join(root, 'package-lock.json'), join(directory, 'package-lock.json'));
    writeFileSync(hook, `
import childProcess from 'node:child_process';
import { syncBuiltinESMExports } from 'node:module';
const nativeTimeout = globalThis.setTimeout;
globalThis.setTimeout = (handler, delay, ...args) => {
  const timer = nativeTimeout(handler, delay, ...args);
  if (delay >= 180000) timer.unref();
  return timer;
};
const spawn = childProcess.spawn;
childProcess.spawn = function(command, args, options) {
  return spawn.call(this, command, Array.isArray(args) && args.some((arg) => String(arg).includes('gr-sim.mjs'))
    ? [...args, '--tape', process.env.GR_BACKFILL_TAPE]
    : args, options);
};
syncBuiltinESMExports();
`);
    const result = spawnSync(process.execPath, [player], {
      cwd: directory,
      encoding: 'utf8',
      timeout: 240_000,
      env: { ...process.env, NODE_OPTIONS: `--import=${hook}`, GR_BACKFILL_TAPE: tape },
    });
    if (result.status !== 0) throw new Error(`${source} failed:\n${result.stderr}`);
    process.stdout.write(`${nameFor(tape)}: ${tape}\n`);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

function nameFor(path) {
  return basename(path, '.json');
}
