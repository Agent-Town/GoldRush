#!/usr/bin/env node
// s1259 — strike three half-retired findings, each VERIFIED closed by code/leaf probe this fire.
// Retention Law: nothing deleted. The original text is retained inside the strike span.
import { readFileSync, writeFileSync } from 'node:fs';

const path = 'tasks/BACKLOG.md';
const lines = readFileSync(path, 'utf8').split('\n');

const strikes = [
  {
    line: 171,
    expectStartsWith: '🟠 **F-1179-1 (s1179, MEASURED during the drain above, FIRE-AUTHORABLE',
    glyph: '🟠',
    header:
      '**F-1179-1 — ✅ CLOSED, see L167 + goal leaf `066-walk8-hero-expectation-realign` (status `merged`, `983fd4da1d28`); struck s1259 by CODE PROBE, not by trusting a copy: `e2e/066-walk8-engine.spec.ts:84` now waits for `frameCount === 8` and `:189`/`:200`/`:231` all assert 8, so the walk4 expectation this line describes no longer exists in the file. Its one residual (`:208`, now `:234`) is the OWNER-GATED F-1166-1 jumper sheet-family fork — so the "FIRE-AUTHORABLE" flag on this line was the harmful part: it advertised an authoring slot that would have re-fixed cured code. Reasoning retained per the Retention Law.** ',
  },
  {
    line: 307,
    expectStartsWith: '🔴 **F-1148-1 — STILL OPEN',
    glyph: '🔴',
    header:
      '**F-1148-1 — ✅ CLOSED, see L328 (ANSWERED AND MERGED s1152 at `280ccc601dadc6c6051d6d04195f9f7d1aad507c`, review `reviews/lane-c-f1148-1-trajectory-spec-rig.md`); struck s1259. This line is s1150\'s reading of a LAWFUL STOP two attempts before the answer landed — "STILL OPEN" was true when written and false ever since. Reasoning retained per the Retention Law.** ',
  },
  {
    line: 330,
    expectStartsWith: '🔴 **F-1152-1 — THE m2-04 PLACEMENT FLAKE IS A BRIEFING-CARD RACE',
    glyph: '🔴',
    header:
      '**F-1152-1 — ✅ CLOSED, see L302 (ANSWERED AND MERGED s1153 `1f563455`) and L296 (its cure F-1153-1 landed s1156 `1db114dc`, leaf `lane-d-f1153-1-teleport-position-refresh` status `merged`); struck s1259. ⚠️ Struck ESPECIALLY because this line\'s MECHANISM was explicitly REFUTED by its own closure: the cause is not a briefing-card race but `__GR_TEST__.teleport()` never refreshing `actionActorPosition` (a test-harness defect production cannot exhibit), and the closure names the briefing-card dismissal as a cure NOT to ship. A stale line whose mechanism is refuted is worse than a stale line, because it aims the next fire at a disproven hypothesis. Reasoning retained per the Retention Law.** ',
  },
];

for (const s of strikes) {
  const i = s.line - 1;
  const raw = lines[i];
  if (!raw.startsWith(s.expectStartsWith)) {
    console.error(`ABORT: L${s.line} does not start as expected.\n  got: ${raw.slice(0, 120)}`);
    process.exit(1);
  }
  const body = raw.slice(s.glyph.length).replace(/^\s+/, '');
  lines[i] = `${s.glyph} ~~${s.header}${body}~~`;
  console.log(`struck L${s.line} (${raw.length} -> ${lines[i].length} chars)`);
}

writeFileSync(path, lines.join('\n'));
console.log('OK — 3 lines struck, 0 deleted');
