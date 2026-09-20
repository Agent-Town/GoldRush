#!/usr/bin/env node
// s1262 strike — F-1261-1's law applied: DRIVE THE GUARD, do not re-implement its predicate.
//
// s1261's first strike script re-implemented the probe's "F-ID in the leading subject zone" rule
// from its DESCRIPTION and struck the wrong line 4 times of 14. This script instead EXECUTES
// logs/session-scratch/s1259/findings-double-state.mjs, parses its HARMFUL SHAPE section, and takes
// the line number + expected glyph + expected head text FROM THE PROBE'S OWN OUTPUT.
//
// Every target is asserted against the probe's reported line BEFORE a single byte is written.
// Dry run by default; --write to commit changes to disk.
import { execSync } from 'node:child_process';
import fs from 'node:fs';

const WRITE = process.argv.includes('--write');
const BACKLOG = 'tasks/BACKLOG.md';
const PROBE = 'logs/session-scratch/s1259/findings-double-state.mjs';

// ---- 1. DRIVE THE PROBE ------------------------------------------------------
const probeOut = execSync(`node ${PROBE}`, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });

// The HARMFUL SHAPE block is the authoritative list. Parse ITS rows, not the ledger.
const harmfulStart = probeOut.indexOf('=== HARMFUL SHAPE');
if (harmfulStart < 0) throw new Error('probe output has no HARMFUL SHAPE section — refusing to guess');
const harmfulEnd = probeOut.indexOf('=== DOUBLE-STATE, BROAD', harmfulStart);
const harmfulBlock = probeOut.slice(harmfulStart, harmfulEnd < 0 ? undefined : harmfulEnd);

// rows look like:  "   OPEN!  L1277 📋  - 📋 **F-1032-1 (NON-BLOCKING, ..."
const openRows = new Map(); // F-ID -> {line, glyph, head}
let currentId = null;
for (const raw of harmfulBlock.split('\n')) {
  const idm = raw.match(/^(F-\d+-\d+)\s*$/);
  if (idm) { currentId = idm[1]; continue; }
  const m = raw.match(/^\s+OPEN!\s+L(\d+)\s+(\S+|\(none\))\s\s(.*)$/);
  if (m && currentId) openRows.set(currentId, { line: +m[1], glyph: m[2], head: m[3] });
}
console.log(`probe reports ${openRows.size} harmful-shape open rows: ${[...openRows.keys()].join(', ')}\n`);

// ---- 2. THE VERDICT — re-derived at source this fire, 5 strike / 4 preserve ----
const STRIKE = {
  'F-1032-1': {
    seeLine: 1260,
    evidence:
      'struck s1262 after RE-DERIVATION AT SOURCE (not inherited — s1261 warned these 9 were unmeasured): ' +
      'cure `022c842e` is ANCESTOR-OF-MAIN, and all four negative-assertion specs this row names now raise the buffer ' +
      'at source — `e2e/mu-02-music.spec.ts:8`, `e2e/mu-03-era-audio.spec.ts:5`, `e2e/e5-water-spike.spec.ts:85`, ' +
      '`e2e/e5-deepwater-claim.spec.ts:10`, each calling `performance.setResourceTimingBufferSize(10_000)` ' +
      '(`e2e/perf-05-startup.spec.ts:92` carries 5_000 as a fifth). The board-wide trap this row opened is closed at every site it counted. ' +
      'Reasoning retained per the Retention Law.',
  },
  'F-1045-1': {
    seeLine: 1270,
    evidence:
      'struck s1262 — THIS ROW IS ITS OWN CLOSURE WEARING AN OPEN GLYPH (🚨), which is why the probe kept flagging it. ' +
      '✓ RE-DERIVED AT SOURCE: `scripts/fire.md:22` carries the **ART-SLOT LAW** inside §2E verbatim, and ' +
      '`scripts/art-staging-audit.mjs` is present at **15,786 bytes** — grown from the 4.2 KB this row cites, because it has since been ' +
      'fixed TWICE (F-1054-1 `4051bf31` blob-hash classification, F-1055-1 `c8034384` remote-tracking check). ' +
      'The gate this finding ordered exists and has been hardened beyond its own ask. ' +
      '⚠️ The POLICY half (adopt-vs-reject the diverged staging files) stays OWNER-GATED under F-1044-2/-3 and F-1242-1/F-1193-2 — ' +
      'those ids are untouched by this strike. Reasoning retained per the Retention Law.',
  },
  'F-1068-5': {
    seeLine: 1396,
    evidence:
      'struck s1262 after RE-DERIVATION BY EXECUTION: `node scripts/goal-tracker.test.mjs` → **fail 0**, and both leaves now carry ' +
      'the field this row said was missing — `e9-art` `295a190d487b133f8b9f3d3125b25528e555e123`, ' +
      '`e10-art` `6c98a4286dc07fe0159492468119b43b306e6caa`; cure `bb57af63` is ANCESTOR-OF-MAIN. ' +
      'ⓘ Worth recording: the E9 hash finally chosen is **NOT** the `5e993443…` this row proposed — the attended writer picked a different ' +
      'representative commit, which is exactly the judgement the row said to leave to attended rather than fill mechanically. ' +
      'Reasoning retained per the Retention Law.',
  },
  'F-1104-1': {
    seeLine: 1688,
    evidence:
      'struck s1262 — A COMPLETION ROW WEARING 🟢, not an open finding: its own subject reads "IS DRAINED". ' +
      '✓ BOTH cited merges verified ANCESTOR-OF-MAIN this fire — `5ec26bce` (078-focus: ledger focus-restore + Tab trap) and ' +
      '`a659020a` (the rider, contract-art-key-adoption, closed at L1688). The 🟢 glyph is house voice for *green*, but the probe\'s ' +
      'vocabulary classifies every non-✅ glyph as OPEN — this row is one of the four data behind F-1262-1. ' +
      'Reasoning retained per the Retention Law.',
  },
  'F-1179-3': {
    seeLine: 197,
    evidence:
      'struck s1262 — SUPERSEDED BY ITS OWN SUCCESSOR AT L197 ("F-1179-3 ANSWERED s1180"), which this row predates. ' +
      '✓ BOTH merges verified ANCESTOR-OF-MAIN this fire: `556f0789` (the s1179 lawful STOP at scope 1(d), mechanism refuted) and ' +
      '`c2d1b690` (the s1180 answer at scope 1(c), which found the outer gate guilty after all). ' +
      'Mistake #5 shape — a ledger line that outlived its event. Reasoning retained per the Retention Law.',
  },
};

const PRESERVE = {
  'F-1126-2': 'GENUINELY OPEN: only the FACTUAL half closed at L1799. Re-derived s1262 — `test:release` (package.json:29) and ' +
    '`test:asset-diet` (package.json:12) still have ZERO callers; both are now recorded in `scripts/gate-caller-baseline.json` as ' +
    'F-1253-1, explicitly "owner\'s desk". Same subject, two ids.',
  'F-1173-7': 'ACTION DISCHARGED but the row carries a LIVE design note: `drain-block-check.mjs:315` exits `strict ? 2 : 0`, so UNKNOWN ' +
    'is rc=0 by default, while `scripts/fire.md` §3.0 calls it "Exit 2/UNKNOWN". Verified true at source s1262. Striking would bury it.',
  'F-1201-1': 'DELIBERATELY PERMANENT: the row exists so nobody "fixes" a correct regex (`whole-suite-collection.test.mjs:9` is right). ' +
    'Striking it removes the exact warning it was written to give, and its symptom half stays open as environmental/contention.',
  'F-1252-1': 'EXPLICIT OWNER\'S DESK ASK, deliberately not fixed (should the citation ratchet cover the 853 citations outside `tasks/`?). ' +
    'L147 closes a DIFFERENT half (the vacuous pass). Not stale in any sense.',
};

// ---- 3. ASSERT EVERY TARGET BEFORE WRITING A BYTE ----------------------------
const lines = fs.readFileSync(BACKLOG, 'utf8').split('\n');
const plan = [];
let failed = 0;

for (const [id, spec] of Object.entries(STRIKE)) {
  const probeRow = openRows.get(id);
  if (!probeRow) { console.error(`✗ ${id}: probe no longer reports it as harmful-shape open — REFUSING`); failed++; continue; }
  const idx = probeRow.line - 1;
  const line = lines[idx];
  if (line === undefined) { console.error(`✗ ${id}: L${probeRow.line} out of range`); failed++; continue; }
  // assert the probe's own head text is a prefix of the real line (guard against drift)
  if (!line.startsWith(probeRow.head.trimEnd().slice(0, 60))) {
    console.error(`✗ ${id}: L${probeRow.line} does not match the probe's reported head\n    probe: ${probeRow.head.slice(0, 90)}\n    file : ${line.slice(0, 90)}`);
    failed++; continue;
  }
  if (line.includes('~~')) { console.error(`✗ ${id}: L${probeRow.line} already contains a strike span — REFUSING`); failed++; continue; }
  const boldAt = line.indexOf('**');
  if (boldAt < 0) { console.error(`✗ ${id}: L${probeRow.line} has no bold subject to wrap — REFUSING`); failed++; continue; }
  const prefix = line.slice(0, boldAt);
  const body = line.slice(boldAt);
  const struck = `${prefix}~~**${id} — ✅ CLOSED, see L${spec.seeLine}; ${spec.evidence}** ${body}~~`;
  plan.push({ id, idx, struck, glyph: probeRow.glyph });
  console.log(`✓ ${id}  L${probeRow.line}  glyph ${probeRow.glyph}  → strike planned (${line.length} → ${struck.length} chars)`);
}

console.log('');
for (const [id, why] of Object.entries(PRESERVE)) {
  const r = openRows.get(id);
  console.log(`• PRESERVED ${id} (L${r ? r.line : '?'}): ${why}`);
}

if (failed) { console.error(`\n${failed} assertion(s) failed — NOTHING WRITTEN.`); process.exit(1); }
console.log(`\nall ${plan.length} targets asserted against the probe's own line numbers.`);

if (!WRITE) { console.log('DRY RUN — pass --write to apply.'); process.exit(0); }
for (const p of plan) lines[p.idx] = p.struck;
fs.writeFileSync(BACKLOG, lines.join('\n'));
console.log(`WROTE ${plan.length} strikes to ${BACKLOG}`);
