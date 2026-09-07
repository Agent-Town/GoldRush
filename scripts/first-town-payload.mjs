#!/usr/bin/env node
// THE FIRST TOWN'S PAYLOAD, COMPUTED FROM THE BUILD — the quantity scripts/deploy.sh gates on.
//
// WHY THIS EXISTS (F-BUDGET-4; owner desk answer A7, 2026-09-07). The release gate used to read a
// BROWSER number: the bytes that happened to arrive before `data-asset-loading-state=ready`, a
// signal that tracks the scene's GLTF LoadingManager only. Three runs of ONE fixed build read
// 21,589,212 / 10,540,927 / 21,638,025 bytes (a 2.05x swing) and the same build read 6,411,798 at
// an emulated 8 Mbps. A number that moves 2x with the HOST cannot be a budget: one day it blocks a
// good deploy on a slow machine, another it waves a bad one through on a fast one.
//
// This script asks the build instead. The first town DECLARES what it needs — the hero's default
// clip group, the ten town-actor sheets, the plates, the town's GLB plan, its chunks and its page —
// and every one of those declarations is data: assets/first-town-payload.json, which the GAME reads
// too (src/assets/AdvanceStream.ts takes its Save Data trim from the same file), so the gate and the
// game cannot disagree. Each declared FAMILY is mapped to the files dist/ actually emitted for it
// and summed. No browser, no network, no clock: the same dist gives the same table every run.
//
// TWO NUMBERS, AND WHICH ONE THE BUDGET GOVERNS. The declaration marks a group `demandPaged` when
// its files are fetched while the player is already standing in the town rather than before it is
// playable. Today exactly one group is: the ten town-actor sheets, whose cells TownScene fetches as
// an actor turns (measured, one cell of each sheet inside the cue window, 9 of 32 on the busiest
// sheet after a 12.7 s settle). So the script reports THREE totals — the GATED entry payload, the
// demand-paged remainder, and their sum, the upper bound on everything the first town can ask for —
// and scripts/deploy.sh judges the gated one. The split is DATA, not code: flipping `demandPaged`
// in assets/first-town-payload.json moves the budget onto the upper bound, which is an OWNER FORK
// (the upper bound reads 31,686,860 B against a 25,000,000 B budget on 2026-09-07's build).
//
// This is not a stopwatch. The gated total corroborates one: it lands within 3.3 % of what the
// browser probe measures for the same build (15,575,283 computed vs 16,101,435 observed), and the
// difference is mostly the cast's ten entry cells, which the gated total deliberately omits. The
// probe stays in the deploy as a TRIPWIRE under a generous ceiling.
//
// USAGE
//   node scripts/first-town-payload.mjs                # human table + the machine line
//   node scripts/first-town-payload.mjs --json         # one JSON object, same numbers
//   node scripts/first-town-payload.mjs --dist <dir>   # measure another build tree
//   node scripts/first-town-payload.mjs --corpus <dir> # cross-check another cue-window corpus
//   node scripts/first-town-payload.mjs --no-corpus    # skip the corpus cross-check entirely
//
// EXIT CODES: 0 the payload was computed; 1 it could not be (a declared family the build does not
// emit, a declaration that has drifted from the town's own sources, an unreadable declaration). A
// family observed in the cue-window corpus that the declaration does not name is REPORTED, never
// silently counted, and does not by itself fail: scripts/first-town-request-families.test.mjs is the
// guard that reds on a new family, and it reads the same corpus.

import { readFileSync, readdirSync, realpathSync, statSync } from 'node:fs';
import { basename, dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// ─── THE FAMILY DERIVATION ─────────────────────────────────────────────────────────────────────
// COPIED VERBATIM from scripts/first-town-request-families.test.mjs. It cannot be imported: that
// file is a node:test module, and importing it would RUN its four tests inside whatever process
// asked for a byte count — including scripts/deploy.sh's. The copy is not left to trust:
// scripts/deploy-budget.test.mjs extracts this block from both files and asserts they are
// byte-identical, so a change to either derivation reds the guard battery.

// A vite hash is eight chars of base64url. An eight-char slice of an ORDINARY name reads exactly
// the same to a bare `{8}` pattern — `brand-new-hall.glb` would be filed as `brand.glb`, and a
// renamed asset would then hide inside an already-pinned family. A real hash is never all
// lower-case-with-hyphens, so require at least one upper-case letter or digit before stripping.
const VITE_HASH = /^(?=.*[A-Z0-9])[A-Za-z0-9_-]{8}$/;
const DIET_SUFFIX = /^(.*)-([A-Za-z0-9_-]{8})-diet-[0-9a-f]{8}(\.[A-Za-z0-9]+)$/;
const HASH_SUFFIX = /^(.*)-([A-Za-z0-9_-]{8})(\.[A-Za-z0-9]+)$/;
const SHEET_CELL = /-r\d+c\d+(\.[A-Za-z0-9]+)$/;

/**
 * The build hash (`-BQ2fS3xk`), the asset-diet content hash (`-diet-1408f6b4`) and a sprite
 * sheet's cell coordinates (`-r0c3`) are all rebuild-volatile. The family is what is left.
 */
export function requestFamily(url) {
  const pathname = url.split('?')[0];
  if (pathname === '/' || pathname.endsWith('/')) return 'index.html';
  const base = pathname.split('/').pop() ?? pathname;
  const diet = DIET_SUFFIX.exec(base);
  const plain = diet ? null : HASH_SUFFIX.exec(base);
  const stripped = diet
    ? `${diet[1]}${diet[3]}`
    : plain && VITE_HASH.test(plain[2])
      ? `${plain[1]}${plain[3]}`
      : base;
  return stripped.replace(SHEET_CELL, '$1');
}
// ─── END OF THE COPIED DERIVATION ──────────────────────────────────────────────────────────────

const DECLARATION = 'assets/first-town-payload.json';
const TOWN_ACTOR_SHEETS = 'src/town/town-actor-sheets.json';
const CHARACTER_CONTRACT = 'assets/layer-contracts/characters.v2.json';
const RUNTIME_FRAMES = 'src/assets/character-runtime-frames.json';
const DEFAULT_CLIP_GROUP = 'default';

class PayloadError extends Error {}

function parseArgs(argv) {
  const options = { dist: 'dist', corpus: 'artifacts/asset-diet', json: false };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--json') options.json = true;
    else if (arg === '--no-corpus') options.corpus = null;
    else if (arg === '--dist' || arg === '--corpus') {
      const value = argv[index + 1];
      if (value === undefined) throw new PayloadError(`${arg} needs a directory`);
      options[arg.slice(2)] = value;
      index += 1;
    } else throw new PayloadError(`unknown argument ${arg}`);
  }
  return options;
}

function readJson(relativePath) {
  const file = resolve(ROOT, relativePath);
  try {
    return JSON.parse(readFileSync(file, 'utf8'));
  } catch (error) {
    throw new PayloadError(`could not read ${relativePath}: ${error.message}`);
  }
}

/** Every file under a build tree, as [path relative to that tree, bytes], sorted. */
function buildFiles(distDir) {
  const root = resolve(ROOT, distDir);
  const files = [];
  const walk = (directory) => {
    let entries;
    try {
      entries = readdirSync(directory, { withFileTypes: true });
    } catch (error) {
      throw new PayloadError(`could not read the build tree ${distDir}: ${error.message}`);
    }
    for (const entry of [...entries].sort((left, right) => (left.name < right.name ? -1 : 1))) {
      const child = join(directory, entry.name);
      if (entry.isDirectory()) walk(child);
      else files.push([relative(root, child), statSync(child).size]);
    }
  };
  walk(root);
  return files;
}

/** dist files grouped by family: bytes, file count, and the names, all sorted. */
export function familiesInBuild(distDir) {
  const byFamily = new Map();
  for (const [path, bytes] of buildFiles(distDir)) {
    const family = requestFamily(`/${path.split(/[\\/]/).join('/')}`);
    const entry = byFamily.get(family) ?? { bytes: 0, files: [] };
    entry.bytes += bytes;
    entry.files.push(basename(path));
    byFamily.set(family, entry);
  }
  return byFamily;
}

/** The declaration, checked for the mistakes that would make it decoration. */
export function readDeclaration() {
  const declaration = readJson(DECLARATION);
  const groups = declaration.groups;
  if (!Array.isArray(groups) || groups.length === 0) {
    throw new PayloadError(`${DECLARATION} declares no groups`);
  }
  const seen = new Map();
  for (const group of groups) {
    if (typeof group.kind !== 'string' || !group.kind) throw new PayloadError(`${DECLARATION}: a group has no kind`);
    if (typeof group.why !== 'string' || !group.why) throw new PayloadError(`${DECLARATION}: group ${group.kind} has no why`);
    if (!Array.isArray(group.families) || group.families.length === 0) {
      throw new PayloadError(`${DECLARATION}: group ${group.kind} declares no families`);
    }
    const sorted = [...group.families].sort();
    if (group.families.join(' ') !== sorted.join(' ')) {
      throw new PayloadError(`${DECLARATION}: group ${group.kind} is not sorted`);
    }
    for (const family of group.families) {
      if (seen.has(family)) throw new PayloadError(`${DECLARATION}: ${family} is declared twice (${seen.get(family)}, ${group.kind})`);
      seen.set(family, group.kind);
    }
  }
  const excluded = declaration.excluded ?? [];
  if (!Array.isArray(excluded)) throw new PayloadError(`${DECLARATION}: excluded must be a list`);
  for (const row of excluded) {
    if (typeof row.family !== 'string' || typeof row.why !== 'string' || !row.why) {
      throw new PayloadError(`${DECLARATION}: every excluded row needs a family and a why`);
    }
    if (seen.has(row.family)) throw new PayloadError(`${DECLARATION}: ${row.family} is both declared and excluded`);
  }
  const trim = declaration.saveDataTrim;
  if (!Array.isArray(trim) || trim.some((name) => typeof name !== 'string' || !name)) {
    throw new PayloadError(`${DECLARATION}: saveDataTrim must be a list of names`);
  }
  return { declaration, declaredKindByFamily: seen, excluded, trim };
}

/**
 * THE DECLARATION AGAINST THE TOWN'S OWN SOURCES. A private list drifts; a checked one cannot.
 * Both directions are asserted: the cast the town names must be declared, and the hero clips the
 * contract defers must NOT be — the second is what stops a future edit from quietly re-eagerising
 * the claim animations by adding them back to this file.
 */
export function crossCheckDeclaration(declaredKindByFamily, excluded) {
  const problems = [];
  const excludedFamilies = new Set(excluded.map(({ family }) => family));

  const actorSheets = readJson(TOWN_ACTOR_SHEETS);
  for (const [actor, sheet] of Object.entries(actorSheets).sort()) {
    const family = `${sheet}.png`;
    if (!declaredKindByFamily.has(family)) {
      problems.push(`${TOWN_ACTOR_SHEETS} names ${actor} -> ${family}, which ${DECLARATION} does not declare`);
    }
  }

  const contract = readJson(CHARACTER_CONTRACT);
  const frames = readJson(RUNTIME_FRAMES);
  const hero = (contract.slots ?? []).find(({ slot }) => slot === 'char.hero');
  if (!hero) problems.push(`${CHARACTER_CONTRACT} no longer carries char.hero`);
  else {
    const fallback = hero.clipGroups?.default ?? DEFAULT_CLIP_GROUP;
    const byClip = hero.clipGroups?.clips ?? {};
    for (const [clip, sheetsByDirection] of Object.entries(frames.heroPoseFrameFiles ?? {}).sort()) {
      const deferred = (byClip[clip] ?? fallback) !== fallback;
      const families = new Set();
      const collect = (value) => {
        if (typeof value === 'string' && value.startsWith('char-') && value.endsWith('.png')) families.add(requestFamily(`/${value}`));
        else if (Array.isArray(value)) value.forEach(collect);
        else if (value && typeof value === 'object') Object.values(value).forEach(collect);
      };
      collect(sheetsByDirection);
      for (const family of [...families].sort()) {
        if (deferred && declaredKindByFamily.has(family)) {
          problems.push(`char.hero.${clip} is in a deferred clip group, but ${DECLARATION} declares ${family} as first-town payload`);
        }
        if (deferred && !excludedFamilies.has(family)) {
          problems.push(`char.hero.${clip} is deferred but ${family} is not in ${DECLARATION} excluded, so a reader cannot tell it was a decision`);
        }
        if (!deferred && !declaredKindByFamily.has(family)) {
          problems.push(`char.hero.${clip} is in the town's clip group but ${DECLARATION} does not declare ${family}`);
        }
      }
    }
  }
  return problems;
}

/** Cue-window families the declaration accounts for neither way. Reported, never counted. */
export function corpusCrossCheck(corpusDir, declaredKindByFamily, excluded) {
  const directory = resolve(ROOT, corpusDir);
  let entries;
  try {
    entries = readdirSync(directory).filter((name) => /^town-transfer-.*\.json$/.test(name)).sort();
  } catch {
    return { read: [], observed: 0, undeclared: [] };
  }
  const excludedFamilies = new Set(excluded.map(({ family }) => family));
  const observed = new Set();
  const read = [];
  for (const name of entries) {
    let parsed;
    try {
      parsed = JSON.parse(readFileSync(join(directory, name), 'utf8'));
    } catch {
      continue;
    }
    if (!Array.isArray(parsed.cueWindowResponses)) continue;
    read.push(name);
    for (const { url } of parsed.cueWindowResponses) if (typeof url === 'string') observed.add(requestFamily(url));
  }
  const undeclared = [...observed]
    .filter((family) => !declaredKindByFamily.has(family) && !excludedFamilies.has(family))
    .sort();
  return { read, observed: observed.size, undeclared };
}

export function computePayload(options = {}) {
  const { dist = 'dist', corpus = 'artifacts/asset-diet' } = options;
  const { declaration, declaredKindByFamily, excluded, trim } = readDeclaration();
  const inBuild = familiesInBuild(dist);

  const problems = crossCheckDeclaration(declaredKindByFamily, excluded);
  const absent = [...declaredKindByFamily.keys()].filter((family) => !inBuild.has(family)).sort();
  for (const family of absent) {
    problems.push(`${DECLARATION} declares ${family}, which the build in ${dist}/ does not emit`);
  }
  if (problems.length) throw new PayloadError(problems.join('\n'));

  const groups = declaration.groups.map((group) => {
    const families = group.families.map((family) => ({
      family,
      bytes: inBuild.get(family).bytes,
      files: inBuild.get(family).files.length,
    }));
    return {
      kind: group.kind,
      demandPaged: group.demandPaged === true,
      families,
      bytes: families.reduce((sum, row) => sum + row.bytes, 0),
      files: families.reduce((sum, row) => sum + row.files, 0),
    };
  });
  const gatedGroups = groups.filter(({ demandPaged }) => !demandPaged);
  if (gatedGroups.length === 0) throw new PayloadError(`${DECLARATION}: every group is demandPaged, so the gate would judge nothing`);
  const rows = gatedGroups.flatMap(({ kind, families }) => families.map((row) => ({ ...row, kind })));
  const bytes = gatedGroups.reduce((sum, group) => sum + group.bytes, 0);
  const demandPagedBytes = groups.filter(({ demandPaged }) => demandPaged).reduce((sum, group) => sum + group.bytes, 0);
  const trimmedBytes = rows
    .filter(({ family }) => trim.some((name) => family.includes(name)))
    .reduce((sum, row) => sum + row.bytes, 0);
  const excludedRows = excluded
    .map(({ family, why }) => ({ family, why, bytes: inBuild.get(family)?.bytes ?? 0, inBuild: inBuild.has(family) }))
    .sort((left, right) => (left.family < right.family ? -1 : 1));

  return {
    dist,
    bytes,
    demandPagedBytes,
    declaredBytes: bytes + demandPagedBytes,
    files: gatedGroups.reduce((sum, group) => sum + group.files, 0),
    families: rows.length,
    groups,
    largest: [...rows].sort((left, right) => right.bytes - left.bytes || (left.family < right.family ? -1 : 1)).slice(0, 8),
    saveData: { trim: [...trim].sort(), bytes: bytes - trimmedBytes, dropped: trimmedBytes },
    excluded: excludedRows,
    corpus: corpus === null ? null : corpusCrossCheck(corpus, declaredKindByFamily, excluded),
  };
}

function render(payload) {
  const lines = [];
  lines.push(`first-town payload — declared families summed from ${payload.dist}/`);
  lines.push('');
  lines.push('| group | gated | families | files | bytes |');
  lines.push('| --- | --- | ---: | ---: | ---: |');
  for (const group of payload.groups) {
    lines.push(`| ${group.kind} | ${group.demandPaged ? 'no (demand-paged)' : 'yes'} | ${group.families.length} | ${group.files} | ${group.bytes} |`);
  }
  lines.push(`| GATED TOTAL | yes | ${payload.families} | ${payload.files} | ${payload.bytes} |`);
  lines.push(`| DECLARED TOTAL (gated + demand-paged) | — | — | — | ${payload.declaredBytes} |`);
  lines.push('');
  lines.push('largest gated families');
  for (const row of payload.largest) lines.push(`  ${String(row.bytes).padStart(9)}  ${row.kind}  ${row.family}`);
  lines.push('');
  lines.push(`Save Data arm (advance stream drops ${payload.saveData.trim.join(', ')}): ${payload.saveData.bytes} bytes (-${payload.saveData.dropped})`);
  const excludedInBuild = payload.excluded.filter(({ inBuild }) => inBuild);
  lines.push(`excluded by declaration: ${payload.excluded.length} families, ${excludedInBuild.reduce((sum, row) => sum + row.bytes, 0)} bytes in this build`);
  for (const row of payload.excluded) lines.push(`  ${String(row.bytes).padStart(9)}  ${row.family}${row.inBuild ? '' : ' (not emitted by this build)'}`);
  if (payload.corpus) {
    lines.push('');
    lines.push(`cue-window corpus cross-check: ${payload.corpus.read.length} files, ${payload.corpus.observed} families observed, ${payload.corpus.undeclared.length} undeclared`);
    for (const family of payload.corpus.undeclared) {
      lines.push(`  UNDECLARED (reported, not counted): ${family}`);
    }
  }
  lines.push('');
  lines.push(`first-town payload demand-paged: ${payload.demandPagedBytes} bytes`);
  lines.push(`first-town payload declared: ${payload.declaredBytes} bytes`);
  lines.push(`first-town payload: ${payload.bytes} bytes`);
  return lines.join('\n');
}

// REALPATHS, NOT PATHS. `import.meta.url` is already resolved through every symlink; `process.argv[1]`
// is whatever the caller typed. On macOS /var is a symlink to /private/var, so a run from any tmp
// directory compared `/var/…` against `/private/var/…`, decided it was being imported, and printed
// NOTHING while exiting 0 — a payload gate that silently measures nothing. Measured in the fixture.
const invokedDirectly = (() => {
  const entry = process.argv[1];
  if (!entry) return false;
  try {
    return realpathSync(entry) === realpathSync(fileURLToPath(import.meta.url));
  } catch {
    return resolve(entry) === resolve(fileURLToPath(import.meta.url));
  }
})();
if (invokedDirectly) {
  try {
    const options = parseArgs(process.argv.slice(2));
    const payload = computePayload(options);
    console.log(options.json ? JSON.stringify(payload, null, 2) : render(payload));
  } catch (error) {
    if (!(error instanceof PayloadError)) throw error;
    console.error(`first-town payload FAILED\n${error.message}`);
    process.exit(1);
  }
}
