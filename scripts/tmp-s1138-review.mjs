import { appendFileSync } from 'node:fs';

const addendum = `

---

# DRAIN ADDENDUM — s1138 fire, 2026-07-27

- **Slice/branch/tip:** \`lane-vp-02f-stale-and-flaky-assertions\` · \`lane/m4\` @ \`7b35e6d3\` (base \`cc663f52\`)
- **Verdict:** **ACCEPT (merge).** Both repairs verified on the merged tree, not inherited from the runner.
- **§3.0 \`drain-block-check\`:** **CLEAR**, run before I formed an opinion.

## Merge classification

Base \`cc663f52\`; three-dot LANE-TOUCHED = **3 files** (the two specs + this review).
\`git log cc663f52..main -- <both specs> reviews/vp-02f.md\` is **empty** — main never moved
them, so **LANE-TOUCHED clean, no graft**. The only main movement since the base is this
fire's own three bookkeeping commits (\`STATUS.md\`, \`tasks/\`), which touch no \`src/\` or
\`e2e/\`. Files taken with \`git checkout lane/m4 -- …\`; \`git diff lane/m4 -- <paths>\` after
the checkout is **empty**, i.e. taken **verbatim**.

## Scope-2 verified at the contract, which is the one that mattered

The master forbade re-deriving \`:292\`'s NE keys from observed runtime (the vp-02d failure
mode that promoted a live bug into a spec). The landed keys are
\`char-hero-sheet-rotation-f-r1c2.png\` / \`…r1c3.png\`. ✓ **Traced to
\`assets/layer-contracts/characters.v2.json:28\`** — \`char.hero.rotations.directions.ne.frames.files\`
— which holds exactly those two filenames in that order. **The runner read the contract; it
did not copy the runtime.**

The \`:388\` repair also did what was asked structurally: it **generalised the existing
\`steadyCalls()\`** into \`steadyRendererCount(page, key)\` and applied it to \`textures\`, rather
than inventing a second settle mechanism.

## Evidence (re-measured on the merged tree, scratch port 5241, \`--workers=1\`)

| Gate | Result |
|---|---|
| \`npx tsc --noEmit\` | **clean** |
| \`npm run build\` | **green, 1.30s** |
| \`:292\` (F-1137-1 target) | **PASS desktop + mobile** |
| \`:388\` (F-1136-1 target), full battery, quiet box | **PASS desktop + mobile** |
| \`:388\` isolated, \`--repeat-each=3\` | **6/6 PASS** (3 desktop, 3 mobile) |
| full two-suite battery, quiet box | **32 passed / 4 failed** |
| console/page errors | none — \`consoleErrors\`/\`pageErrors\` assertions pass in every green test |

The 4 remaining reds are **\`:233\` ×2 and \`:707\` ×2** (was \`:705\`; +2 line shift from the
helper edit) — both the \`char.claim_jumper\` absent-slot waits the master named as known
reds and told the runner to leave alone. Fingerprint matches: \`page.waitForFunction\` timeout
on the same wait, both projects.

## F-1138-6 — my FIRST battery failed \`:388\` on both projects, and the cause was my own box, not the repair

Worth recording because it nearly produced a wrong rejection of a correct fix. My first
full battery ran **while the lane-a runner was still live**, and returned **\`:388\` RED on
both projects — \`Expected: 80, Received: 81\`**, an off-by-one texture: *the exact signature
of the F-1136-1 flake this task exists to cure.* The tempting read was "the settle does not
work".

**Separated by A/B on the same invocation rather than argued:** same command, same commit,
the only variable being load.

| \`:388\`, full battery, \`--workers=1\` | desktop | mobile |
|---|---|---|
| lane-a runner live | **RED** (80 vs 81) | **RED** |
| quiet box | **GREEN** | **GREEN** |
| isolated \`--repeat-each=3\` | GREEN ×3 | GREEN ×3 |

Note the in-suite baseline is **80 textures** against **33** isolated, so a suite-context
explanation was live and had to be excluded, not assumed away — the quiet-box *full-suite*
re-run is what excluded it. ➡️ **The repair is sound.** It settles a transient; it cannot
settle a machine that is starved of CPU, and no assertion of this shape could. *A gate
battery run beside a live runner measures the runner too.*

## F-1138-7 — F-1137-2 did NOT reproduce here, so "reproducible" is now doubtful (open, unchanged, do not act on this)

\`:547\` → now **\`:549\`** after the +2 shift. s1137 recorded it as *"Reproducible, cure-caused,
mobile-only"* and the vp-02f runner reported it *"remains red on mobile"* with desktop
alternating. **On my merged tree it passed on BOTH projects in BOTH full batteries — 2/2,
contended and quiet.** That does not clear it and I am not claiming a diagnosis: it makes
the finding look **intermittent** rather than deterministic, which is a different open
question from the one s1137 wrote down. ⚠️ **This strengthens the master's decision to
EXCLUDE \`:547\` from repair.** An intermittent red is exactly the kind someone "fixes" by
loosening the assertion; the probe F-1137-2 asks for is still the right next step, and it
now needs enough runs to establish a rate rather than a single reproduction.
`;

appendFileSync('reviews/vp-02f.md', addendum);
console.log('drain addendum appended to reviews/vp-02f.md');
