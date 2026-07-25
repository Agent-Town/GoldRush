#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

const QUIET_LINE = 'the wire is quiet.';
const ENDPOINT_SOURCE = new URL('../src/encyclopedia/liveStats.ts', import.meta.url);
const BANNED_WORDS = [
  'token', 'price', 'trade', 'trading', 'value', 'valuation', 'expectation', 'expectations',
  'amazing', 'epic', 'exciting', 'groundbreaking', 'huge', 'incredible', 'massive',
  'revolutionary', 'stunning',
];
const DURATION_LABELS = {
  lt1m: 'under 1 min',
  '1-3m': '1–3 min',
  '3-5m': '3–5 min',
  '5-10m': '5–10 min',
  '10-20m': '10–20 min',
  '20mplus': '20 min+',
};
const FRAME_LABELS = {
  lt16: 'under 16 ms',
  '16-25': '16–25 ms',
  '25-33': '25–33 ms',
  '33-50': '33–50 ms',
  '50plus': '50 ms+',
};
const WAVE_LABELS = {
  '0-4': '0–4',
  '5-9': '5–9',
  '10-19': '10–19',
  '20-29': '20–29',
  '30-39': '30–39',
  '40plus': '40+',
};

export async function draftTickerStats({ url, json = false, fetchImpl = fetch } = {}) {
  try {
    const response = await fetchImpl(url ?? await statsEndpoint(), { headers: { accept: 'application/json' } });
    if (!response.ok) return QUIET_LINE;
    const payload = await response.json();
    if (json) {
      const raw = JSON.stringify(payload, null, 2);
      guard(raw.split('\n'));
      return raw;
    }
    return render(payload);
  } catch (error) {
    if (error instanceof UnsafeTickerCopyError) throw error;
    return QUIET_LINE;
  }
}

export async function statsEndpoint() {
  const source = await readFile(ENDPOINT_SOURCE, 'utf8');
  const match = source.match(/\bconst STATS_ENDPOINT = ['"]([^'"]+)['"]/);
  if (!match) throw new Error('STATS_ENDPOINT not found');
  return match[1];
}

export function render(payload) {
  if (!validPayload(payload) || payload.empty) return QUIET_LINE;
  const stats = payload.stats;
  const duration = stats.medianDurationBucket === null ? 'still tallying' : DURATION_LABELS[stats.medianDurationBucket];
  const lines = [
    `Assay Office: ${stats.runs.today} runs today · ${stats.runs.sevenDays} in seven days · ${stats.runs.allTime} all told.`,
    `Deepest holdout: wave ${stats.deepestWave} · Typical run: ${duration}.`,
    stats.busiestContract && `Busiest trail: ${titleCase(stats.busiestContract.id)} · ${stats.busiestContract.runs} assays.`,
    mapLine('Trail rigs', stats.tierSplit, titleCase),
    mapLine('Devices', stats.deviceSplit, titleCase),
    mapLine('Run lengths', stats.durationHistogram, (key) => DURATION_LABELS[key]),
    mapLine('Frame p95', stats.frameP95Global, (key) => FRAME_LABELS[key]),
    ...Object.entries(stats.frameP95ByDevice).map(([device, buckets]) =>
      mapLine(`${titleCase(device)} frame p95`, buckets, (key) => FRAME_LABELS[key])),
    mapLine('Waves reached', stats.wavesHistogram, (key) => WAVE_LABELS[key]),
    stats.updatedAt && `Ledger tally: ${stats.updatedAt}.`,
  ].filter(Boolean);
  guard(lines);
  return lines.join('\n');
}

function validPayload(payload) {
  const stats = payload?.stats;
  return payload?.ok === true
    && typeof payload.empty === 'boolean'
    && stats
    && counterMap(stats.runs, ['today', 'sevenDays', 'allTime'])
    && count(stats.deepestWave)
    && (stats.medianDurationBucket === null || Object.hasOwn(DURATION_LABELS, stats.medianDurationBucket))
    && (stats.busiestContract === null
      || (typeof stats.busiestContract?.id === 'string' && count(stats.busiestContract.runs)))
    && counterMap(stats.tierSplit, ['FULL', 'BALANCED', 'LITE'])
    && counterMap(stats.deviceSplit, ['desktop', 'mobile', 'tablet'])
    && counterMap(stats.durationHistogram, Object.keys(DURATION_LABELS))
    && counterMap(stats.frameP95Global, Object.keys(FRAME_LABELS))
    && nestedCounterMaps(stats.frameP95ByDevice, ['desktop', 'mobile', 'tablet'], Object.keys(FRAME_LABELS))
    && counterMap(stats.wavesHistogram, Object.keys(WAVE_LABELS))
    && (stats.updatedAt === null || typeof stats.updatedAt === 'string');
}

function count(value) {
  return Number.isFinite(value) && value >= 0;
}

function counterMap(value, keys) {
  return value && keys.every((key) => count(value[key]));
}

function nestedCounterMaps(value, keys, bucketKeys) {
  return value && keys.every((key) => counterMap(value[key], bucketKeys));
}

function mapLine(label, values, labelFor) {
  return `${label}: ${Object.entries(values).map(([key, value]) => `${labelFor(key)} ${value}`).join(' · ')}.`;
}

function titleCase(value) {
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1).toLowerCase()}`)
    .join(' ');
}

function guard(lines) {
  const text = lines.join('\n');
  const banned = BANNED_WORDS.find((word) => new RegExp(`\\b${word}\\b`, 'i').test(text));
  if (banned) throw new UnsafeTickerCopyError(`ticker copy contains banned word: ${banned}`);
  const long = lines.find((line) => line.length > 140);
  if (long) throw new UnsafeTickerCopyError(`ticker line exceeds 140 characters: ${long.length}`);
}

export class UnsafeTickerCopyError extends Error {}

function help() {
  return `Usage: node scripts/ticker-stats.mjs [--url <endpoint>] [--json]

Fetches the shared Assay Office endpoint and prints ready-to-paste Ticker/Gazette lines.
--json  Print the endpoint payload unchanged.
--url   Override the endpoint (tests and local workers).

STATS LINE: quote scripts/ticker-stats.mjs output only, and cite the fetch timestamp in the digest.`;
}

function options(args) {
  if (args.includes('--help') || args.includes('-h')) return { help: true };
  const urlIndex = args.indexOf('--url');
  if (urlIndex >= 0 && !args[urlIndex + 1]) throw new Error('--url requires an endpoint');
  return { json: args.includes('--json'), url: urlIndex >= 0 ? args[urlIndex + 1] : undefined };
}

async function main() {
  const parsed = options(process.argv.slice(2));
  console.log(parsed.help ? help() : await draftTickerStats(parsed));
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) await main();
