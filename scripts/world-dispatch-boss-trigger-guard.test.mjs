/**
 * F-E8LO-3 -- A WORLD DISPATCH WAITED ON A BOSS THAT THE MAP DOES NOT HAVE.
 *
 * OWNER RULING 2026-09-19, verbatim: "I agree with all your recommendations on the decisions - good
 * work", taken on `docs/OWNER-DESK-2026-09-19.md`, where the item reads: "`worldDispatches`
 * registers M8-5 as a boss-defeat trigger for Low Orbit, which declares no boss. Recommendation --
 * RULED 2026-09-19. (b). Low Orbit's fiction is a return home, not a boss. Data only, no engine
 * work."
 *
 * WHY A GUARD AND NOT JUST THE FIX. The defect was invisible for the worst possible reason: it cost
 * nothing. `triggerReached` resolves `{ kind: 'boss', id }` for any non-Baron id to exactly the same
 * predicate as `{ kind: 'contract', id }` -- "a secured score on that contract" -- so the wrong kind
 * behaved correctly and nothing could ever go red. What it did instead was tell a later reader that
 * Low Orbit has a boss, which is the kind of false premise a future slice builds on.
 *
 * WHAT IS PINNED. Every `{ kind: 'boss' }` dispatch trigger must name a contract that actually
 * DECLARES a boss in the shipped registry. Both sides are DERIVED -- the triggers by parsing
 * `MILESTONE_TRIGGERS` out of the module, the boss-bearing contracts by walking
 * `assets/contracts/<epoch>/contracts.json` for `bossKind` -- so neither list can be transcribed
 * wrong, and both extend themselves when an epoch is added.
 *
 * `e1-baron` is the one lawful exception and it is named rather than pattern-excused: it is not a
 * contract row at all, it is the Baron medal, and `triggerReached`'s first disjunct is written for
 * precisely that (`trigger.id === 'e1-baron' && hasBaronMedal()`).
 */
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const DISPATCHES = 'src/town/worldDispatches.ts';
const CONTRACTS = 'assets/contracts';
const MEDAL_TRIGGER = 'e1-baron'; // not a contract row: the Baron medal, handled by its own disjunct

/** `MILESTONE_TRIGGERS` as the module declares it, read rather than re-stated. */
function milestoneTriggers() {
  const source = readFileSync(new URL(`../${DISPATCHES}`, import.meta.url), 'utf8');
  const start = source.indexOf('const MILESTONE_TRIGGERS');
  assert.notEqual(start, -1, `${DISPATCHES}: MILESTONE_TRIGGERS is gone -- this guard lost its subject`);
  const end = source.indexOf('\n};', start);
  assert.ok(end > start, `${DISPATCHES}: MILESTONE_TRIGGERS has no closing brace this parser can find`);
  const rows = [...source.slice(start, end).matchAll(/'(M\d+-\d+)':\s*\{\s*kind:\s*'([a-z]+)'(?:,\s*id:\s*'([^']+)')?/g)]
    .map(([, milestone, kind, id]) => ({ milestone, kind, id }));
  assert.ok(rows.length > 0, 'ZERO milestone triggers parsed -- the parser or the file shape broke, never a clean table');
  return rows;
}

/** Does this contract row declare a boss anywhere in its shape? (`tileParams.bossKind` today.) */
function declaresBoss(value) {
  if (Array.isArray(value)) return value.some(declaresBoss);
  if (!value || typeof value !== 'object') return false;
  return Object.entries(value).some(([key, nested]) => /^boss/i.test(key) || declaresBoss(nested));
}

/** Every contract that declares a boss, taken from the shipped registry rather than a list here. */
function bossBearingContracts() {
  const bosses = new Set();
  let files = 0;
  for (const epoch of readdirSync(new URL(`../${CONTRACTS}`, import.meta.url), { withFileTypes: true })) {
    if (!epoch.isDirectory()) continue;
    const path = new URL(`../${CONTRACTS}/${epoch.name}/contracts.json`, import.meta.url);
    if (!existsSync(path)) continue;
    files += 1;
    const parsed = JSON.parse(readFileSync(path, 'utf8'));
    // `bossKind` lives inside `tileParams`, not at the top level, so the scan is by DEPTH rather
    // than by a path this guard would have to know. A boss declared anywhere in a contract's row
    // is a boss.
    for (const contract of parsed.contracts ?? parsed) {
      if (declaresBoss(contract)) bosses.add(contract.id);
    }
  }
  assert.ok(files > 0, `ZERO ${CONTRACTS}/*/contracts.json read -- refusing to certify an empty corpus`);
  assert.ok(bosses.size > 0, 'ZERO boss-bearing contracts found -- the key name or the registry shape moved');
  return { bosses, files };
}

test('every boss-kind dispatch trigger names a contract that declares a boss', () => {
  const { bosses, files } = bossBearingContracts();
  const offences = milestoneTriggers()
    .filter((row) => row.kind === 'boss' && row.id !== MEDAL_TRIGGER && !bosses.has(row.id))
    .map((row) => `${row.milestone} -> { kind: 'boss', id: '${row.id}' } but ${row.id} declares no boss`);
  assert.deepEqual(offences, [],
    `F-E8LO-3 (owner ruling 2026-09-19): a boss trigger must name a map with a boss. ${files} epoch registries read, `
    + `${bosses.size} boss-bearing contracts: ${[...bosses].sort().join(', ')}.`);
});

test('M8-5 is keyed to Low Orbit being secured, not to a boss it never had', () => {
  const row = milestoneTriggers().find((entry) => entry.milestone === 'M8-5');
  assert.ok(row, 'M8-5 has no milestone trigger at all');
  assert.deepEqual({ kind: row.kind, id: row.id }, { kind: 'contract', id: 'e8-low-orbit' },
    'owner ruling 2026-09-19 (F-E8LO-3): "(b). Low Orbit\'s fiction is a return home, not a boss."');
  const { bosses } = bossBearingContracts();
  assert.equal(bosses.has('e8-low-orbit'), false,
    'if Low Orbit ever declares a boss, this ruling is worth revisiting -- until then the trigger stays a secure');
});

test('the guard BITES: a boss trigger on a bossless map is rejected', () => {
  // The two arms above are the guard PASSING, and a passing guard never runs its violation path.
  // This one drives the same predicate over a manufactured table so the red is proven, not assumed.
  const { bosses } = bossBearingContracts();
  const manufactured = [
    { milestone: 'M8-5', kind: 'boss', id: 'e8-low-orbit' },
    { milestone: 'M2-5', kind: 'boss', id: 'e2-hill-mine' },
    { milestone: 'M1-5', kind: 'boss', id: MEDAL_TRIGGER },
  ];
  const offences = manufactured
    .filter((row) => row.kind === 'boss' && row.id !== MEDAL_TRIGGER && !bosses.has(row.id))
    .map((row) => row.milestone);
  assert.deepEqual(offences, ['M8-5'],
    'the predicate must reject the pre-cure row, accept a real boss map, and exempt the Baron medal');
});
