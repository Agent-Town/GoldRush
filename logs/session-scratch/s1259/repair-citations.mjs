#!/usr/bin/env node
// s1259 — repair four citations the citation ratchet reds on. THREE OF THEM ARE NOT MINE:
// ca64bf26 (s1258's merge) DELETED the inlined `moveHeroTo` from e2e/release-build.spec.ts, so every
// citation quoting that function's signature at :311 now quotes a line that exists nowhere in the
// cited spec -> CARRIES-LINE fails. The claims are all still TRUE; only the pointers rotted.
// Repair rule: follow the code. The function now lives, byte-identical modulo `export`, at
// e2e/helpers/hero-approach.ts:5. Nothing is deleted; each edit records the retirement.
import { readFileSync, writeFileSync } from 'node:fs';

const NEW_PTR =
  '`e2e/helpers/hero-approach.ts:5` (`export async function moveHeroTo(page: Page, x: number, z: number): Promise<void> {`; inlined in `e2e/release-build.spec.ts` until `ca64bf26` retired the duplicate — pointer repaired s1259, the claim below is unchanged)';

const edits = [
  {
    file: 'tasks/lane-b-approach-helper-dedupe.md',
    from: '`e2e/release-build.spec.ts:311-365` have identical bodies',
    to: `${NEW_PTR} have identical bodies`,
  },
  {
    file: 'tasks/lane-b-trail-guide-plain-boot-seam-approach.md',
    from: '`e2e/release-build.spec.ts:311` (`async function moveHeroTo(page: Page, x: number, z: number): Promise<void> {`)',
    to: NEW_PTR,
  },
  {
    file: 'tasks/lane-b-trail-guide-plain-boot-seam-approach.md',
    from: '`e2e/release-build.spec.ts:311-365` (`async function moveHeroTo(page: Page, x: number, z: number): Promise<void> {`',
    to: `${NEW_PTR} (`,
  },
  {
    file: 'tasks/BACKLOG.md',
    from: '`e2e/release-build.spec.ts:311` (`async function moveHeroTo(page: Page, x: number, z: number): Promise<void> {`)',
    to: NEW_PTR,
    all: true,
  },
  {
    // s1259's own citation: :84 is inside a helper, so cite the TEST that consumes it, by title.
    file: 'tasks/BACKLOG.md',
    from: '`e2e/066-walk8-engine.spec.ts:84` now waits `frameCount === 8` and `:189`/`:200`/`:231` asserting 8',
    to: 'its shared helper now waits for `frameCount === 8` and the test consuming it (`e2e/066-walk8-engine.spec.ts:194`, "hero walks on the activated walk8 sheet at the ratified cadence") asserts 8, as do `:200` and `:231`',
  },
];

let failed = false;
for (const e of edits) {
  const text = readFileSync(e.file, 'utf8');
  const n = text.split(e.from).length - 1;
  if (n === 0) {
    console.error(`MISS  ${e.file}: ${e.from.slice(0, 70)}`);
    failed = true;
    continue;
  }
  if (n > 1 && !e.all) {
    console.error(`AMBIGUOUS (${n}x) ${e.file}: ${e.from.slice(0, 70)}`);
    failed = true;
    continue;
  }
  writeFileSync(e.file, e.all ? text.split(e.from).join(e.to) : text.replace(e.from, e.to));
  console.log(`OK  ${e.file}  (${n} occurrence${n > 1 ? 's' : ''})`);
}
process.exit(failed ? 1 : 0);
