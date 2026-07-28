# Review — eight-winds-wiring-enemies (EIGHT WINDS slice 2: the three outlaw slots)

**Slice:** `eight-winds-wiring-enemies` · **branch:** `lane/e2-arsenal` · **tip:** `29396f9c`
**Base:** `784a2efe` (= merge-base with main) · **merge:** `c3d8470e` *(this drain, `--no-ff`)*
**Run report:** `tasks/runs/20260728-223409-lane-c-eight-winds-wiring-enemies.md`
**Drain:** s1184 fire, 2026-07-28 · **§3.0 drain-block-check:** ✅ CLEAR (`eight-winds-wiring-enemies`)

## Verdict

**ACCEPT — merged.** The slice does exactly what its master ordered, and its own evidence is
unusually strong: both mutation controls went **RED** on demand, the perf delta was measured against
an untouched control at the lane's exact base, and the two adjacent-suite reds were fingerprinted
rather than waved through. This drain re-ran the whole battery on the *merged* tree and reproduced
every claim.

## What it does

`char.bandit_base`, `char.bandit_thief` and `char.baron` were each bound to their landed
`walkdiag8` sheets with explicit `walk8.directions` (sw→row 0, se→row 1, nw→row 2, ne→row 3, cells
c0..c7 @ 16 fps), and each slot's `walk8.aliases` — previously
`{"se":"e","ne":"e","sw":"w","nw":"w"}` — is now `{}`. Before this slice all four diagonals aliased
onto cardinal art; the three outlaws now turn on all eight winds like the hero does.

It also settles the `aliases` question that slice 1 explicitly deferred as "the next rung's
decision": the aliases are **emptied**, not widened.

## Merge classification

Merge-base is `784a2efe`, the lane's own base. Main advanced by four commits while the lane ran
(the art batch, the s1183 handoff, this fire's lock, and this fire's art drain). Classified per file:

- **LANE-TOUCHED only:** `assets/layer-contracts/characters.v2.json`, `assets/processed/**` (96 new
  cells + 3 `.frames.json`), `assets/processed-full/**` (32 Baron masters),
  `e2e/eight-winds-enemies.spec.ts` (new), `e2e/eight-winds-hero.spec.ts` (+18),
  `artifacts/eight-winds-enemies/**`, its own run file.
- **MAIN-MOVED only:** `STATUS.md`, `assets/LEDGER.md`, `assets/raw/**`, `logs/**`, `reviews/**`,
  `tasks/goals.json`, `tasks/art-gazette-engravings.md`.
- **BOTH:** **none.** The two sets are fully disjoint, so this was a clean 3-way with no conflicts
  and no hand-resolution. Verified by diffing `784a2efe..main` against the lane's own file list
  before merging, not discovered during it.

## Evidence — re-run by this drain on the merged tree

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | ✅ clean, rc 0 |
| `npm run build` | ✅ green, built in 1.10 s, asset-diet clean |
| `e2e/eight-winds-enemies.spec.ts` (own spec) + `eight-winds-hero.spec.ts` (extended guard) | ✅ **8/8 passed**, desktop + mobile 390 px, 12.5 s |
| `e2e/066-walk8-engine.spec.ts` (adjacent) | ⚠️ **4 passed / 2 failed — pre-existing F-1166-1**, fingerprint matched (below) |
| console / page errors | ✅ zero (the specs assert this and passed, incl. a no-`?debug` plain boot) |
| frame p95 | ✅ −1.0 % median across three paired 180-frame windows vs untouched `784a2efe` (runner-measured; well inside the 15 % threshold) |

### The two adjacent reds are F-1166-1, verified not inherited

The run report claimed the only reds were the standing owner-gated F-1166-1. This drain checked the
claim at the assertion rather than accepting the count:

```
e2e/066-walk8-engine.spec.ts:234
  expect(jumper.sourceFrameKey).toContain('char-jumper-sheet-walk8-')
  Expected substring: "char-jumper-sheet-walk8-"
  Received string:    "char-bandit-base-sheet-walk8-r2c0.png"
```

Both the line and the received string match the recorded F-1166-1 signature exactly — the claim
jumper slot still falls back to bandit_base art. **It cannot be collateral from this slice:** the
received cell is `r2c0`, a *cardinal* `walk8` cell, whereas this slice adds only diagonal rows and
empties only diagonal aliases. The runner independently reproduced the identical failure in a
detached control worktree at the lane's exact base `784a2efe`, on both projects. Pre-existing,
unchanged, still on the owner's desk.

### The controls the runner built, and why they earn trust

Two mutation controls, both aimed at this slice's own claims, both **RED on demand**:

1. **Crossed row** — swapping `char.bandit_base`'s SW and NE file lists made the *plain-boot*
   assertion fail (`MUTATION_ROW_SWAP_EXIT=1`). The row binding is load-bearing.
2. **Original alias map** — restoring the original aliases *while keeping* the explicit directions
   made the generic resolution guard fail (`MUTATION_ALIAS_RESTORE_EXIT=1`). **This is the important
   one:** it proves emptying the aliases is what does the work, not merely adding directions —
   i.e. the guard would not have passed on the directions alone.

The extraction control is also provenance-aware: `15 byte-identical, 0 unexplained, 17
master-divergent by design`. Only Baron got `processed-full` masters because the two bandit bases
declare `master NO`; `--like` reproduced each base's own convention rather than imposing one.

### F-1175-1 confirmed at source — the spec's own recommended fix was inert

The master closed off the spec's suggested `src/` one-liner rather than offering it, on the strength
of F-1175-1. The runner re-confirmed that premise before doing anything else, and it held:

```
char.bandit_base / bandit_thief / baron — rotations.directions diagonal keys: []
```

`SpriteAnimator.ts:843`'s escape hatch tests `slot.rotations.directions`, which is **empty for
precisely these three slots**, so widening that guard would have changed nothing. The contract edit
was the only route. Firewall held: **zero `src/`**, and `char.hero` / `char.claim_jumper` refused.

## Findings

- **F-1184-4 (non-blocking, cosmetic, pre-existing)** — the extraction script prints a legacy
  `wrote 31 cells` summary that contradicts its own following `32 written` counter; disk and all
  three manifests contain 32. The runner correctly left it out of scope and reported it. A one-line
  off-by-one in a *message*, but it is the kind of thing a future drain reads as evidence of a
  dropped cell. Worth a cheap corrective.
- **F-1182-2, fourth instance** — the optional `codex review --uncommitted` second-opinion pass
  again failed to act as a gate; here it recursively invoked another `codex review` after reading
  the local Codex skill and was stopped without findings. The runner then re-checked the diff
  directly. Still `brew upgrade codex`, still owner, still low urgency.
- **F-1166-1 unchanged** — see above; this slice neither fixes nor worsens it.

## Player-visible change

**Yes** — the three outlaws now animate on all eight winds instead of aliasing diagonals onto
cardinal art. Proven in a **no-`?debug` plain boot** for `char.bandit_base` (Mistake #10): the
player runs southwest, the outlaw follows southwest, and the diagnostic requires walkdiag row 0.
`bandit_thief` (northeast, row 3) and `baron` (southwest, row 0) are proven by diagnostic
spawning/positioning — a weaker proof, which the runner labelled honestly rather than overselling.

Screenshots: `artifacts/eight-winds-enemies/{desktop,mobile}-chrome-char-{bandit-base,bandit-thief,baron}.png`.
