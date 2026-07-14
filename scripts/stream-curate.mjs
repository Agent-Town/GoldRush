#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { readdirSync, statSync, writeFileSync } from 'node:fs';
import { basename, dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

// Rotation policy: 40 minutes (legal range 35–45), duration mix 50/25/15/10,
// newest five plus two seeded classics, and a 15-second hold for still cards.
export const TARGET_SECONDS = 40 * 60;
export const LOOP_RANGE_SECONDS = [35 * 60, 45 * 60];
export const CARD_DURATION_SECONDS = 15;
export const FRESH_PER_CLASS = 5;
export const CLASSICS_PER_CLASS = 2;
export const MIX = {
  'finished-game-footage': 0.50,
  'era-art-reel': 0.25,
  'era-art-card': 0.15,
  'ceremony-recording': 0.10,
};
export const INTERLEAVE = [
  'era-art-card',
  'finished-game-footage',
  'era-art-reel',
  'finished-game-footage',
  'ceremony-recording',
];
export const BANNED_FILES = new Set([
  'marketing/raw/gen/the-ten-eras-reel-v1-superseded.mp4',
]);

const APPROVAL = 'class-delegation-2026-07-12';
const IDEAL_SLOT_SECONDS = {
  'finished-game-footage': 22.5,
  'era-art-reel': 22.5,
  'era-art-card': 15,
  'ceremony-recording': 9,
};
const POOLS = [
  { dir: 'marketing/raw/stream', className: 'finished-game-footage', accepts: (name) => name.endsWith('.webm') },
  { dir: 'marketing/raw/gen', className: 'era-art-reel', accepts: (name) => name.endsWith('.mp4') },
  { dir: 'assets/raw', className: 'era-art-card', accepts: (name) => /^kit-era-(?:[1-9]|10)\.png$/.test(name) },
  { dir: 'artifacts/stream-capture', className: 'ceremony-recording', accepts: (name) => /^ceremony-[^.]+\.(?:mp4|webm)$/.test(name) },
];

function random(seed) {
  let state = [...seed].reduce((hash, char) => Math.imul(hash ^ char.charCodeAt(0), 16777619), 2166136261) >>> 0;
  return () => ((state = (Math.imul(state, 1664525) + 1013904223) >>> 0) / 2 ** 32);
}

function shuffled(values, seed) {
  const result = [...values];
  const next = random(seed);
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(next() * (index + 1));
    [result[index], result[swap]] = [result[swap], result[index]];
  }
  return result;
}

function titleFor(file) {
  return basename(file, extname(file))
    .replace(/^kit-era-(\d+)$/, 'Era $1 Card')
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function mediaDuration(file) {
  return Number(execFileSync('ffprobe', [
    '-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', file,
  ], { encoding: 'utf8' }).trim());
}

export function discoverPool(root, log = console.error) {
  const items = [];
  for (const pool of POOLS) {
    const directory = join(root, pool.dir);
    for (const name of readdirSync(directory).sort()) {
      const fullPath = join(directory, name);
      if (!statSync(fullPath).isFile()) continue;
      const file = relative(root, fullPath);
      if (!pool.accepts(name)) {
        log(`IGNORED ${file} (not an approved ${pool.className})`);
        continue;
      }
      if (BANNED_FILES.has(file) || (pool.dir === 'marketing/raw/stream' && /2026-07-10.*\.webm$/.test(name))) {
        log(`IGNORED ${file} (banned stream content)`);
        continue;
      }
      items.push({
        file,
        title: titleFor(file),
        class: pool.className,
        duration: pool.className === 'era-art-card' ? CARD_DURATION_SECONDS : mediaDuration(fullPath),
        freshness: statSync(fullPath).mtimeMs,
      });
    }
  }
  return items;
}

export function rotationPool(items, seed) {
  const byClass = Object.fromEntries(Object.keys(MIX).map((className) => [className, []]));
  for (const item of items) byClass[item.class]?.push(item);
  for (const [className, classItems] of Object.entries(byClass)) {
    classItems.sort((a, b) => b.freshness - a.freshness || a.file.localeCompare(b.file));
    const fresh = classItems.slice(0, FRESH_PER_CLASS);
    const older = shuffled(classItems.slice(FRESH_PER_CLASS), `${seed}:${className}`)
      .slice(0, CLASSICS_PER_CLASS);
    byClass[className] = shuffled([...fresh, ...older], `${seed}:${className}:rotation`);
  }
  return byClass;
}

export function buildProgram(items, seed, log = console.error) {
  const pools = rotationPool(items, seed);
  if (!Object.values(pools).some((pool) => pool.length)) throw new Error('No approved stream content found');

  const totals = Object.fromEntries(Object.keys(MIX).map((className) => [className, 0]));
  const counts = Object.fromEntries(Object.keys(MIX).map((className) => [className, 0]));
  const program = [];
  let patternIndex = 0;
  let total = 0;

  while (total < TARGET_SECONDS && Object.values(pools).some((pool) => pool.length)) {
    const activeClasses = new Set(INTERLEAVE.filter((className) => pools[className].length));
    let className;
    for (let attempts = 0; attempts < INTERLEAVE.length; attempts += 1) {
      className = INTERLEAVE[patternIndex++ % INTERLEAVE.length];
      if (!pools[className].length) continue;
      if (program.at(-1)?.class !== className || activeClasses.size === 1) break;
      className = undefined;
    }
    if (!className) continue;

    const target = IDEAL_SLOT_SECONDS[className] * (counts[className] + 1);
    const choices = pools[className];
    let item;
    if (className !== 'era-art-reel') {
      item = choices.shift();
    } else {
      const error = (candidate) => Math.abs(totals[className] + candidate.duration - target);
      const best = Math.min(...choices.map(error));
      const index = choices.findIndex((candidate) => error(candidate) <= best + 8);
      item = choices.splice(index, 1)[0];
    }

    program.push(item);
    counts[className] += 1;
    totals[className] += item.duration;
    total += item.duration;
  }
  if (total < TARGET_SECONDS) log(`SHORT program: ${(TARGET_SECONDS - total).toFixed(1)}s below target; approved unique pool exhausted`);
  return program;
}

export function summarize(program) {
  const total = program.reduce((sum, item) => sum + item.duration, 0);
  const durations = Object.fromEntries(Object.keys(MIX).map((className) => [
    className,
    program.filter((item) => item.class === className).reduce((sum, item) => sum + item.duration, 0),
  ]));
  return { total, durations, percentages: Object.fromEntries(Object.entries(durations).map(([key, value]) => [key, value / total])) };
}

function printProgram(program) {
  const { total, durations, percentages } = summarize(program);
  program.forEach((item, index) => console.log(`${String(index + 1).padStart(3, '0')}  ${item.class.padEnd(23)} ${item.duration.toFixed(1).padStart(6)}s  ${item.file}`));
  console.log(`\nTotal: ${(total / 60).toFixed(2)} min`);
  for (const className of Object.keys(MIX)) {
    console.log(`${className.padEnd(23)} ${(durations[className] / 60).toFixed(2).padStart(6)} min  ${(percentages[className] * 100).toFixed(1).padStart(5)}%`);
  }
}

function main() {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  const check = process.argv.includes('--check');
  const date = new Date().toISOString().slice(0, 10);
  const program = buildProgram(discoverPool(root), date);
  printProgram(program);
  if (check) return;

  const manifest = {
    version: 1,
    entries: program.map(({ file, title, class: className, duration }) => ({
      file,
      title,
      class: className,
      addedAt: date,
      approvedBy: APPROVAL,
      ...(className === 'era-art-card' ? { duration } : {}),
    })),
  };
  writeFileSync(join(root, 'assets/stream/loop-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) main();
