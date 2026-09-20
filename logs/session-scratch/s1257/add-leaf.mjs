#!/usr/bin/env node
// s1257 — GOAL REGISTRATION LAW: register the authored master's leaf in the SAME COMMIT.
// Placed as a sibling of the e1 plain-boot leaf it follows up on.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const repo = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const p = resolve(repo, 'tasks/goals.json');
const raw = readFileSync(p, 'utf8');
const data = JSON.parse(raw);

const ID = 'e1-approach-helper-dedupe';
let existing = null, parentArr = null, sibling = null;
(function walk(n, arr) {
  if (!n || typeof n !== 'object') return;
  if (Array.isArray(n)) { n.forEach((c) => walk(c, n)); return; }
  if (n.id === ID) existing = n;
  if (n.id === 'e1-trail-guide-plain-boot-proof') { parentArr = arr; sibling = n; }
  Object.values(n).forEach((v) => walk(v, Array.isArray(v) ? v : arr));
})(data, null);

if (existing) { console.log('leaf already present — nothing to do'); process.exit(0); }
if (!parentArr) { console.error('could not locate the sibling leaf array'); process.exit(1); }

const leaf = {
  id: ID,
  title: "E1 follow-up — retire the duplicated hero-approach helper from the release suite so the braking-lead algorithm has exactly one copy.",
  taskFile: 'lane-b-approach-helper-dedupe.md',
  status: 'queued',
  lane: 'lane-b',
  authoredBy: 's1257 fire (FIRE-AUTHORED, attended review welcome) — authored by the drain that created the duplicate, discharging its own F-1257-3',
  spec: 'reviews/e1-trail-guide-plain-boot-proof.md F-1257-3 (s1257); the duplicate was ORDERED left standing by scope 5 of lane-b-trail-guide-plain-boot-seam-approach.md (s1256), which handed the follow-up to the drain',
  authorNotes: "MEASURED AT AUTHORING, NOT INFERRED: the two bodies are byte-identical today — e2e/helpers/hero-approach.ts:5-59 vs the inlined moveHeroTo at e2e/release-build.spec.ts:311-365, down to SIM_PROGRESS_TIMEOUT = 15_000 (hero-approach.ts:3, release-build.spec.ts:19); the module differs only by an export keyword and its import. So this is a deletion plus an import, NOT a reconciliation of diverged copies — and scope 3 carries a STOP if that is no longer true when it runs, because a divergence means someone tuned one copy and picking a winner is a drain question. GATE BASELINE DERIVED, NOT INHERITED (s1257): the release suite under playwright.release.config.ts is 26 tests, measured 25 passed / 1 failed in 1.3m, the single red being 'later flagship URLs decline to the Claim' (mobile-chrome) = F-1180-2's known transient, to be cited BY TITLE because deleting ~55 lines moves its line number. s1255 measured the same suite 26/26 with that test GREEN, so both readings exist on unchanged code: it is a rate, not a line. WHY IT MATTERS BEYOND TIDINESS: this exact helper is the thing that was silently wrong — s1256 measured its predecessor missing its own 0.12 tolerance on 13/13 moves (0.237-2.153) on PASSING runs too, so the E1 proof passed by harvest-range luck for an unknown number of fires. The corrected algorithm's guarantee is structural (it can only return through its hypot<=0.12 branch), and that guarantee is worth exactly one copy. The second caller's canonical arm is NOT --workers=1: that config produced a false GREEN on the plain-boot spec three times running.",
};

parentArr.splice(parentArr.indexOf(sibling) + 1, 0, leaf);
writeFileSync(p, JSON.stringify(data, null, 2) + (raw.endsWith('\n') ? '\n' : ''));
console.log('registered leaf', ID, 'after', sibling.id, '— array now', parentArr.length, 'entries');
