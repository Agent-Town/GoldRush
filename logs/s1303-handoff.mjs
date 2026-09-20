import { readFileSync, writeFileSync } from 'node:fs';

// ---- 1. BACKLOG: two new rows (F-1303-2, F-1303-3) after F-1303-1 ----
const B = 'tasks/BACKLOG.md';
const lines = readFileSync(B, 'utf8').split('\n');
const j = lines.findIndex((l) => l.startsWith('🟡 **F-1303-1 (s1303'));
if (j < 0) throw new Error('F-1303-1 row not found');

const f2 = '🟡 **F-1303-2 (s1303, MEASURED — THE ATTENDED-AUTHORED `lane-mechanics-manifest` HAS NO GOAL LEAF, AND `drain-block-check` REPORTS THAT AS EXIT 0).** Re-triaging for a second drain I ran `node scripts/drain-block-check.mjs 20260731-215132-lane-mechanics-manifest.md` and got **`? UNKNOWN — no goal leaf matches`**. ✓ **VERIFIED, NOT INFERRED:** `grep -c "mechanics-manifest" tasks/goals.json` returns **1**, and reading it shows the single hit is inside **s1302\'s own `authorNotes` prose** (*"lane-a held a LIVE run (lane-mechanics-manifest, 21:51:32)"*) — **not an `id` and not a `taskFile`.** So the leaf genuinely does not exist; this is a Goal Registration Law miss on an attended-authored master (`690a91f6`), not a lookup artifact. ⚠️ **THE REASON THIS IS A ROW AND NOT A SHRUG IS THE EXIT CODE.** §3.0 warns that the no-leaf path ends in `process.exit(strict ? 2 : 0)`, so by default **UNKNOWN is indistinguishable from CLEAR to any fire that branches on `$?`** — and this is the first live instance since the doc was corrected s1273. A fire in a hurry reads rc=0 and drains a 642-line `src/agent` + `src/town` slice believing policy cleared it. **It did not; nothing looked.** ➡️ **NEXT FIRE: register the leaf BEFORE draining lane-a** (`taskFile: "lane-mechanics-manifest.md"`, AP-11, ratified owner 2026-07-31 per L2213), then re-run the check and expect a real ✅ CLEAR that **matches by name** — the name-match is what independently proves the registration took, exactly as it did for `066-jumper-cadence-realign` this fire. ⓘ Stated without blame: attended was authoring live (the AP-11 census sweep is mid-flight, E5–E6 pending) and may well register it themselves; the row exists so the gap cannot pass silently, not to assign fault. 💡 *Reusable shape: **an advisory default is a trap for whoever reads the code instead of the word.** The guard did its job perfectly — it printed "not a clearance" in plain English — and would still have been overridden by anyone who trusted `$?`.*';

const f3 = '🔵 **F-1303-3 (s1303, SELF-INFLICTED AND WORTH RECORDING — CHOOSING MY OWN GATE-RUN ARTIFACTS OVER THE LANE\'S LEFT lane-b FALSELY `HOLDS` ON SIX BINARIES).** After merging `066-jumper-cadence-realign`, `node scripts/lane-usable.mjs --all` reports **lane-b `lane/m4` ahead=1 paths=9 → HOLDS**, listing six `artifacts/066/*.png` as **BOTH-MOVED**. ✓ **The code is fully absorbed:** of the 9 paths, the three text files (`e2e/066-walk8-engine.spec.ts` and both `*-frame-probe.json`) are gone from the held list — only the **six binary screenshots** remain. 🔑 **CAUSE, AND IT WAS MY CHOICE:** my gate battery re-ran the slice and regenerated those PNGs, and I committed **my** renders rather than `git checkout lane/m4 --`’s. Both are honest evidence of the same passing run, but they differ byte-wise, so main and lane both "moved" and `lane-freeze-classify` correctly drops them in BOTH-MOVED — the bucket that **cannot be line-diffed for binaries**, so `--cure` rightly refuses. ⚠️ **This is a FALSE hold in substance and a TRUE one by the instrument\'s rules, which is the interesting part**: F-1081-9\'s lesson was that BOTH-MOVED is a triage bucket rather than a loss verdict, and here it is that again — but for once the coarseness is unfixable by resolution, because there is no line-level question to ask of a PNG. ➡️ **CURE (next fire, cheap): archive the tip to `archive/lane-m4-s1303-absorbed-5f75bad0` and reset** — history first, then `main..lane/m4` empty and lane-b returns USABLE. Nothing is at risk: main holds a superset of the content. 💡 *Reusable shape: **when a drain regenerates the lane\'s own evidence, prefer the lane\'s bytes unless yours differ meaningfully.** Committing my own renders bought nothing and cost the next fire a lane-archive ceremony — the cheapest merge is the one that leaves `main..branch` empty.*';

lines.splice(j + 1, 0, f2, f3);
writeFileSync(B, lines.join('\n'));

// ---- 2. STATUS: handoff line-1, archive the lock ----
const S = 'STATUS.md';
const s = readFileSync(S, 'utf8').split('\n');
const prevLock = s[0];

s[0] = `Last updated: ${process.argv[2]} s1303 handoff, lock CLEARED — ${process.argv[3]}`;

let at = s.findIndex((l, i) => i > 0 && l.startsWith('- **s'));
if (at < 0) at = 2;
s.splice(at, 0, `- **s1303 lock (line-1 archive):** ${prevLock}`);
writeFileSync(S, s.join('\n'));

console.log('BACKLOG: F-1303-2 + F-1303-3 inserted at', j + 2);
console.log('STATUS: handoff written, lock archived at bullet', at);
