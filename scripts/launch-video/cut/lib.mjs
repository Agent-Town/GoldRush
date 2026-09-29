// scripts/launch-video/cut/lib.mjs: shared paths and helpers for the launch film's cut (task launch-video-cut-3).
// Node only. The takes live outside the repository in ~/.goldrush/launch-video (GR_LV_OUT), every export and every
// intermediate in its cut/ folder; the plates come from the art store beside the repository (GR_ASSETS_RAW).
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, statSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const HERE = path.dirname(fileURLToPath(import.meta.url));
export const REPO = path.resolve(HERE, '..', '..', '..');
export const TAKES = process.env.GR_LV_OUT ?? path.join(os.homedir(), '.goldrush', 'launch-video');
export const CUT = path.join(TAKES, 'cut');
export const WORK = path.join(CUT, 'work');
export const STORE_RAW = process.env.GR_ASSETS_RAW ?? path.resolve(REPO, '..', 'GoldRush-assets', 'raw');
export const AUDIO = path.join(REPO, 'assets', 'audio', 'raw');
export const EMBLEM = path.join(REPO, 'assets', 'processed-full', 'ui-title-emblem.png');
export const FPS = 60;
export const NICE = ['nice', '-n', '15'];

export const takePath = (name) => path.join(TAKES, name);
export const platePath = (name) => path.join(STORE_RAW, name);
export const audioPath = (name) => path.join(AUDIO, name);

export function ensureDir(dir) {
  mkdirSync(dir, { recursive: true });
  return dir;
}

export function sha256(file) {
  return createHash('sha256').update(readFileSync(file)).digest('hex');
}

export function bytes(file) {
  return existsSync(file) ? statSync(file).size : 0;
}

// Run a command (niced when it is ffmpeg), fail loudly with the tail of its stderr.
export function run(command, args, { quiet = true, input, nice = command === 'ffmpeg' } = {}) {
  const [cmd, argv] = nice ? [NICE[0], [...NICE.slice(1), command, ...args]] : [command, args];
  const result = spawnSync(cmd, argv, { encoding: 'utf8', maxBuffer: 1 << 28, input, stdio: [input ? 'pipe' : 'ignore', 'pipe', 'pipe'] });
  if (result.status !== 0) {
    const tail = (result.stderr ?? '').split('\n').slice(-25).join('\n');
    throw new Error(`${command} exited ${result.status}\n${tail}`);
  }
  if (!quiet && result.stderr) process.stderr.write(result.stderr);
  return result;
}

export function ffprobe(file, entries = 'format=duration') {
  return run('ffprobe', ['-v', 'error', '-show_entries', entries, '-of', 'json', file], { nice: false }).stdout;
}

export function duration(file) {
  return Number(JSON.parse(ffprobe(file)).format.duration);
}

// A take's sidecar: its REAL or STAGED label comes from here, never from memory.
export function sidecar(take) {
  const file = path.join(TAKES, take.replace(/\.mp4$/, '.json'));
  return JSON.parse(readFileSync(file, 'utf8'));
}

export function label(take) {
  const car = sidecar(take);
  return car.staged ? `STAGED: ${car.stagedReason ?? 'see the sidecar'}` : 'real';
}

export const fmtTime = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = seconds - m * 60;
  return `${m}:${s.toFixed(2).padStart(5, '0')}`;
};
