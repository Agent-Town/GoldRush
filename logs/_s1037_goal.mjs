import { readFileSync, writeFileSync } from 'node:fs';

// Line-level surgery, NOT a re-serialize (s1036's reason still holds: tasks/goals.json
// mixes raw-UTF8 and \uXXXX escaping across entries, so a whole-document JSON.stringify
// churns ~180 unrelated lines whichever style you pick). Only the new leaf is inserted.
const p = '/Users/robin/Claude/Projects/Gold Rush/tasks/goals.json';
const lines = readFileSync(p, 'utf8').split('\n');

if (lines.some((l) => l.includes('"id": "perf-05-startup-attribution"'))) {
  console.error('leaf already present — aborting (idempotence guard)');
  process.exit(1);
}

// Anchor: insert immediately AFTER the m2-05-geometry-settle block closes.
const at = lines.findIndex((l) => l.includes('"id": "m2-05-geometry-settle"'));
if (at < 0) {
  console.error('anchor leaf not found — aborting');
  process.exit(1);
}
const close = lines.findIndex((l, i) => i > at && l.trim() === '},');
if (close < 0 || close - at > 12) {
  console.error('anchor block boundary looks wrong — aborting', { at, close });
  process.exit(1);
}

const ind = lines[at].match(/^\s*/)[0];
const outer = ind.slice(0, -1);

const TITLE =
  'F-1034-3 (perf-05 half): perf-05-startup:213 is NOT a CPU-load flake — every threshold passes and :223 fails on a substring collision, needle \'icon-\' matching favicon-32.png';

const NOTE =
  "s1037 FIRE-AUTHORED (my one this fire), and the premise CORRECTS the ledger entry it came from. " +
  "tasks/BACKLOG.md:819 records the perf-05 half of F-1034-3 as 'threshold-shaped (TTI / deferred textures)' and load-sensitive, offering 'perf-05 may be pure CPU-load flake, which would be a cheap close' by analogy to F-perf05-1. " +
  "s1037 read the failing run's OWN artifacts (artifacts/perf-05/after-desktop-chrome.json + after-mobile-chrome.json, both written by the failing run) instead of inheriting that reading, and it does not survive contact with the numbers: " +
  "desktop ttiMs 2701 < 3000 PASS, firstFrameMs 2592 < tti PASS, consoleErrors/pageErrors/assetErrors all EMPTY PASS; mobile 1701/1606 same. " +
  "EVERY THRESHOLD PASSED. The only failing assertion is :223, expect(report.lazy.beforeFirstFrame).toEqual([]), and on BOTH projects the array holds exactly one entry: favicon-32.png. " +
  "DEFECT 1, verified by direct probe not by reading: hasAny (spec:201-203) is a bare String.includes with no separator or boundary, and NON_CRITICAL_TEXTURES (spec:28) contains the needle 'icon-', intended for the UI icon sheets. " +
  "'http://localhost:5173/favicon-32.png'.includes('icon-') === true — fav<icon->32.png, the match lands at offset 3. " +
  "The favicons are declared in index.html:7-9 as <link rel=\"icon\">, so the browser requests them during document parse, necessarily long before firstFrameMs (2592ms desktop). " +
  "So whenever a resource-timing entry for the favicon exists at all, :223 fails WITH CERTAINTY — this is a guard mis-classifying a browser-chrome icon on the deliberate critical path as a deferred game texture. It is not a timing draw, and no number of isolated re-runs could ever have closed it. " +
  "OPEN QUESTION handed to the runner rather than guessed: the favicon files date from Jul 5, BEFORE perf-05 shipped 2/2 green (s216, 8bd9eca), so something drifted since — either headless Chromium's favicon-fetch behaviour changed under a browser/Playwright bump (the entry now exists where it used to be absent), or a <link>/filename moved. The master orders that measured, not reasoned. " +
  "DEFECT 2, and this one may be real: prefetchedBeforeWaveSpawn is EMPTY on both projects, so :224 (.length > 0) would also fail — it is simply never reached because :223 throws first. That assertion guards perf-05's OWN shipped deliverable, the wave-1 prefetch of bld-sentry-beacon/palisade/sluice-works/stockpile-yard/signal-turret, and the measured window is wide (desktop 2592->6133ms, ~3.5s) with nothing in it. " +
  "Three readings are laddered in the master and they are NOT equally bad: (1) needles no longer match the URLs = measurement bug, in firewall; (2) prefetch fires outside the window = window bug, in firewall; (3) THE WAVE-1 PREFETCH STOPPED HAPPENING = a real product regression against 8bd9eca, OUT of firewall — the master orders STOP-and-report on that branch, no src/ edit. " +
  "SHAPE OF THE MASTER: scope 1 reproduces the attribution with ONE invocation per project and says so explicitly — a string match is not a timing draw, so repetition buys nothing here, and this is deliberately NOT the six-separate-invocations bar F-1036-2 imposed on the F-1030-3 timing list, because that bar exists for cold-start races and this defect is deterministic. A GREEN run is defined as a CLASS CHANGE to stop and report, not as a close. " +
  "scope 2's resource-row dump (every /icon/ entry with startTime/initiatorType/bytes, plus the launched browser version) is a deliverable in its own right — diagnose-and-patch-nothing is explicitly not a no-op. " +
  "scope 3 fixes defect 1 by NARROWING the needle (anchor to a path separator or the real asset prefix) and requires an audit of EVERY needle in both lists for collision. " +
  "scope 4 is the primary acceptance evidence and has TWO halves because the edit has two ways to go wrong: still-bites (mutate a genuine icon-* to load before first frame -> :223 must go RED, then revert) AND no-longer-false (favicon absent from beforeFirstFrame while the favicon request is still observably happening in the row dump). " +
  "That second half exists because a narrowed matcher that no longer bites is the F-1032-1 vacuous-guard defect wearing a fix's coat — the same class this board closed in F-1026-1, F-1026-5, F-1029-3 and F-1032-1. " +
  "FIREWALL: TOUCH-ONLY e2e/perf-05-startup.spec.ts + artifacts/perf-05/**; NO src/, NO index.html, and explicitly no renaming/moving/deleting a favicon to make the test green (the favicons are correct; the test is wrong about them). Do not DELETE the 'icon-' needle or any list entry — the fix is a narrower match, not a shorter list, or the UI icon sheets go unguarded (reject-don't-stretch). No skipping/softening :223 or :224, no bare waitForTimeout, no widening the firstFrame/waveSpawn windows. " +
  "ed-04-gizmos — the OTHER half of F-1034-3 — is fenced out of both the scope and the adjacent battery: it is a documented known-red (F-cp00-1, BACKLOG:425) and BACKLOG:819 rules it explicitly not fire-authorable, so running it would only re-import someone else's failure into the report. " +
  "LANE-SAFETY pre-proved by s1037 THIS FIRE and not inherited: git log main..lane/m3 returned EMPTY, so lane/m3 holds nothing that is not already on main and the pre-flight reset is loss-free. " +
  "STATUS 'planned' NOT 'queued' — deliberately: tasks/CODEX-WALL was up (raised s1036 09:23Z, upstream 503/circuit-open) when this was authored, and a queued task is grabbed within ~60s and burns to rc1. The master is complete and waiting; queue it to lane-a the moment the wall lifts.";

const leaf = [
  `${ind}{`,
  `${ind} "id": "perf-05-startup-attribution",`,
  `${ind} "title": ${JSON.stringify(TITLE)},`,
  `${ind} "status": "planned",`,
  `${ind} "taskFile": "lane-a-perf-05-startup-attribution.md",`,
  `${ind} "attempts": 0,`,
  `${ind} "note": ${JSON.stringify(NOTE)}`,
  `${ind}},`,
];

lines.splice(close + 1, 0, ...leaf);

const out = lines.join('\n');
JSON.parse(out); // validate before writing
writeFileSync(p, out);
console.log(`leaf perf-05-startup-attribution inserted after line ${close + 1} (${leaf.length} lines); JSON validates`);
