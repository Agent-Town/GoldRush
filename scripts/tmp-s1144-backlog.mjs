// s1144: append the lane-b ladder item recording the lawful STOP + the authored successor.
import { readFileSync, writeFileSync } from 'node:fs';

const path = 'tasks/BACKLOG.md';
const lines = readFileSync(path, 'utf8').split('\n');
const marker = '## lane-c (world/polish)';
const idx = lines.findIndex((l) => l.startsWith(marker));
if (idx === -1) throw new Error('lane-c header not found');
if (lines.some((l) => l.includes('lane-vp-02b-jumper-slot-repair'))) {
  console.log('BACKLOG item already present');
} else {
  const item =
    '6. ⚠️ **vp-02b jumper red — THE HYPOTHESIS WAS WRONG AND THE STOP PROVED IT; SUCCESSOR QUEUED s1144.** ' +
    '`lane-vp-02b-jumper-slot-red` **STOPPED LAWFULLY at its own scope-1 measure-first gate** (run `20260727-234321`, zero diff, `main..lane/m4` EMPTY, done-move renamed `stopped-lawful-s1144-…`, goal leaf `stopped-lawful`, **NO mergeHash**). ' +
    'The runner refused to invent a cure and was right to: ✓ **verified at source s1144 — no spawn surface can EVER mount `char.claim_jumper`.** ' +
    '**ROOT CAUSE: `82543f27` (2026-07-12, `runner(lane-d): wire-e1-bandit-variants`)** rewired the enemy animators (`src/entities/pools.ts:337`/`:355`) to `assetSlots.charBanditBase`/`charBanditThief`, added both to `characters.v2.json`, and updated **ZERO of the seven e2e specs** naming the old slot; `git log -G"charBanditBase" -- src/entities/pools.ts` returns exactly that one commit. ' +
    '`spriteAnimationDiagnostics()` (`SpriteAnimator.ts:208`) is keyed per constructed animator, so the old wait was **unfalsifiable by construction**. ' +
    '✓ **NO art/gameplay regression — checked before blaming the runtime:** `char.bandit_base` carries `walk8:true` and its processed PNGs are on disk; the enemy got new art and `enemy-claim-jumper.png` is now the encyclopedia portrait only. The runtime half of `82543f27` was correct and complete; **only the e2e layer was stranded.** ' +
    '**F-1144-1 — the stranded set is SEVEN specs** (`066-walk8-engine`, `lane-c-activations-assay-office`, `task-031-anim-roundness`, `task-042-anim-smoothness`, `visual-polish-assets`, `vp-02-sprite-animation`, `vp-02b-rotation-resolver`), **fingerprinted one-at-a-time as separate “pre-existing known reds” for 15 days** (`reviews/vp-02d.md:26`, `reviews/vp-02e.md:60`, `reviews/vp-02e-runner-report.md:81`/`:108`) without ever being joined to one cause — the *fix-the-class* law failing in slow motion. ⚠️ `reviews/066-walk8-engine.md:24` records `pass ×2` but is dated **2026-07-10, two days BEFORE the rename** — stale green, do not inherit. ' +
    '**F-1144-2 — TWO stale classes, and Class A MASKS Class B.** Measured s1144 (desktop-chrome, port 5188 verified free, all six queues empty, no runner live): 4 failed / 1 passed. ' +
    '**Class A (hero walk4→walk8):** `task-031:202` `hero.frameCount` **Expected 4, Received 8**; same wait times out at `task-042:59` and `066:81`. ' +
    '**Class B (the rename):** `visual-polish-assets:68` `char.claim_jumper` → **"missing"** (expected "loaded"); `vp-02b:283` and `vp-02:705`/`:739` time out on the jumper wait. ' +
    '🔑 Class A fails FIRST in three specs, so **they never reach their jumper asserts at all** — curing Class B alone will not green them, and curing Class A will *unmask* three more Class-B failures. ' +
    '✍️ **AUTHORED + QUEUED `lane-vp-02b-jumper-slot-repair` → lane-b** (master↔queued byte-identical; `^CODEX:` column 0 line 5; goal leaf same commit; `task-guard-audit` **663 masters, 0 invisible, rc=0**; `drain-block-check` CLEAR). ' +
    'Scope is **Class B only** — mechanical and verifiable. **Class A is deliberately EXCLUDED and routed to the OWNER’S DESK:** whether the hero being walk8 is the intended shipped state or a regression is a design fork, and `066-walk8-engine:200-205` asserts `.not.toContain(\'walk8\')` **on purpose**. ' +
    '`visual-polish-assets` is written as a **STOP-and-report judgement** (it is a boot canary — a blind rename could turn a real guard into one asserting a falsehood), and scope 5 warns that asserts unexecuted since 2026-07-12 may surface **true reds**, explicitly licensing the runner to report one rather than green it. ' +
    '`tasks/025-vp-02e-jumper-8way-activation.md` stays ⛔ DO-NOT-QUEUE. Evidence: `reviews/vp-02b-jumper-slot-red-stop.md`. ' +
    '**GATE (next fire):** drain the repair when lane-b done-moves — the bar is the before/after table for all seven with first-failure lines, base-vs-thief justified per call site, the scope-6 mutation control shown RED then restored, zero `src/`, and **the three Class-A specs still red is EXPECTED, not a failure**. ' +
    '**Report-only findings for a later slice (`src/**` barred there):** `src/assets/generated.ts:206` still names `charClaimJumper` boot-critical though it measures "missing" in a plain boot; `src/entities/pools.ts:343`/`:349` batch names still read `GeneratedClaimJumperThief…`, the vestige that hid this for 15 days.';
  lines.splice(idx, 0, item, '');
  writeFileSync(path, lines.join('\n'));
  console.log('BACKLOG lane-b item 6 inserted at line ' + (idx + 1));
}
