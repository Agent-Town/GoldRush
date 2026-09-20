# f1304-1-manifest-view-console-rider — drain review (s1305)

- **Slice:** `lane-a-f1304-1-manifest-view-console-rider` (FIRE-AUTHORED by s1304)
- **Branch / tip:** `lane/m3` @ `4cd3310e979f623951acfcdb0602a242a3f8d33d`
- **Base:** `73564f686982669b4f26e46b012a0fcf9d627e53`
- **Merged at:** `7d92fe5a88b25972062b0f9a5cdc6bc6677e4a37`
- **Verdict:** ✅ **MERGE** — the cure is correct and proven, **but not by the evidence its own acceptance bar asked for.** One finding raised (F-1305-1), one class observation banked (F-1305-2).

## What it does

`watchErrors()` in `e2e/agent-view.spec.ts` previously funnelled every `console.error`
and every `pageerror` into one `errors[]` array asserted empty at the end of two browser
tests. It now splits: text starting with the literal
`THREE.GLTFLoader: Couldn't load texture blob:` goes to a second `suppressed[]` array,
everything else still lands in `errors[]` and still reds the test. Each consumer logs
its suppressed count, so a fire reading a run can see *how much* was ignored rather than
having it vanish. A permanent mutation-control test injects both a known-prefix message
and a foreign one and asserts the first is suppressed, the second is not, and the closing
`expect(errors).toEqual([])` shape still throws.

The predicate, verbatim:

```ts
if (text.startsWith("THREE.GLTFLoader: Couldn't load texture blob:")) suppressed.push(text);
else errors.push(text);
```

## Merge classification

| File | Class | Evidence |
|---|---|---|
| `e2e/agent-view.spec.ts` | **LANE-TOUCHED only** | `git diff --stat 73564f68 main -- e2e/agent-view.spec.ts` **EMPTY** — main never moved it since the lane base |

Single file, no 3-way graft needed. The only main commits since base (`6cb88379`,
`88e70e37`, `51365174`) touch `tasks/`, `scripts/` and `STATUS.md` — verified by
`git show --stat`; `6cb88379`'s headline mentions `agent-view.spec.ts:283` but it edits
only *citation titles* in `tasks/BACKLOG.md` and the master, not the spec. **The spec was
byte-identical to the tree s1304 measured**, which is what makes the control arm below valid.

## Evidence

All playwright arms `--workers=1` (§3.1 / F-1270-1).

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npm run build` | green, 3.33 s |
| Arm A post-merge, run 1 | **8 passed**, 39.1 s, load **18.81** |
| Arm A post-merge, run 2 | **8 passed**, 25.2 s, load **15.16** |
| Arm A post-merge, run 3 | **8 passed**, 21.0 s, load **11.40** |
| Adjacent `e2e/second-rider.spec.ts` | 2 failed — **fingerprint-matched known-red** |
| `git status --porcelain -- src assets` | **EMPTY** (zero `src/`) |

The three greens were taken at loads **11.4–18.8**, more than double the 5.07–5.67 at
which s1304 measured the red — a green under heavy load is stronger than a quiet one.

**Adjacent red is not mine, proven on three axes.** `second-rider.spec.ts:96` matches
`logs/suite-red-inventory.md:212–213` on test name (*"the imported companion joins through
town, moves, fights, and survives"*), **both** projects, callsite `:96`, and failure text
(`page.waitForFunction` timeout at `openHostRide`). It is a documented 10.6 % flake. It also
**cannot** be reached by this diff: `second-rider.spec.ts` does not use `watchErrors` at all.

**Blast radius derived, not assumed.** 21 e2e specs contain `watchErrors`, but
`grep -rn "import.*watchErrors" e2e/` returns **nothing** and `agent-view.spec.ts` has no
`export` — each spec defines its own private copy. The change is strictly file-local.

**Mistake #10 does not apply:** zero `src/`, test-robustness only. Nothing renders to a
player, so no plain-boot probe is owed and no GZ-01 item is due (same shape as s1303).

## Findings

### 🟡 F-1305-1 — F-1304-1 is a FLAKE, not the deterministic red it was filed as; and both "3/3 green" results that certify this cure are therefore VACUOUS

`logs/suite-red-inventory.md:730` states, in bold: *"The condition is not 'flaky' — it is
deterministic given the run shape."* **That is refuted.** I ran the exact Arm A command on
the **pre-merge, byte-identical** tree — the same command, same shell, same file contents
s1304 measured 3/3 FAIL:

| Pre-merge Arm A run | Load | Result |
|---|---|---|
| 1 | 3.39 | **6 passed** |
| 2 | 3.78 | **6 passed** |
| 3 | 4.62 | **5 passed / 1 failed** — mobile `:283` |
| 4 (burners raising load to 5.12, matching s1304's conditions) | 5.12 | **6 passed** |

**3 green / 1 red on the unfixed tree.** The red is real and reproducible, but it is
stochastic, exactly as F-1180-2 always classified it (*"load-sensitive"*). s1304 drew
"deterministic" from n=3 at one load level; the fourth sample was enough to break it.

**The consequence is the part that matters.** The master's acceptance bar was *"3 consecutive
both-project runs green."* The runner met it — and reported `suppressed 0/0` on every run.
**My own three post-merge runs also report `suppressed 0/0`.** In six certifying runs across
two sessions, *the transient never once occurred*, so the filter never fired, so **every one
of those greens would have been green with the fix reverted.** A bar that a broken build
passes is not a bar. This is the s1303 lesson pointed at an acceptance criterion instead of
a control arm: a green proves nothing unless the condition it is supposed to cure was present.

**The cure is nonetheless sound, and here is what actually proves it** — not the greens:
1. The **mutation control** (permanent, in-file) demonstrates both directions: the known
   prefix enters `suppressed`, a foreign error stays in `errors`, and the empty-errors
   assertion still throws. It reported `suppressed 1` on every project of every run — the
   only non-zero suppression count anywhere in the evidence.
2. The **fingerprint matches the predicate by inspection**: the documented failure text is
   `8 x THREE.GLTFLoader: Couldn't load texture blob:http://127.0.0.1:5188/<uuid>`
   (`logs/suite-red-inventory.md:728`), and the filter matches that exact prefix.

The runner deserves credit here: it is *because* it honestly logged `0/0` instead of
quietly reporting a green that this finding is visible at all. A silent filter would have
hidden it — which is precisely why the master demanded the count be reported.

**Action taken:** the `suite-red-inventory` addendum is superseded in this drain's
bookkeeping commit — marked **CURED** with the determinism claim corrected in place rather
than deleted (Retention Law: supersede, never delete).

### 🔵 F-1305-2 — the same unfiltered rider exists in 20 other specs (class, deliberately not fixed)

`watchErrors` is copy-pasted, not shared: 21 specs define their own, and the other 20 still
funnel this transient straight into a failing assertion. Any of them can red the same way.
The master's NO list explicitly reserved this (*"fix the class only after this instance is
proven"*), and F-1083-2 rules the underlying renderer cure not fire-authorable — so this is
**banked, not acted on**. A future corrective should hoist one shared helper rather than
paste the filter 20 times. Given F-1305-1, that corrective must be gated on a **measured
rate**, not on "3 runs green".

## Scope compliance

TOUCH-ONLY `e2e/agent-view.spec.ts` — honoured exactly (one file, `git diff --name-only`).
NO list honoured: no `src/`, no other spec's watcher, no GLTF/renderer path, no
`logs/suite-red-inventory.md` edit by the runner (this drain retires that row, as specified),
and the manifest/VIEW/briefing assertions are byte-unchanged apart from one added log line
before each closing assertion.
