# Task lane-gg-03-gazette-panel-swap: the Greenhorn's Gazette shows its engravings — swap the six reserved art slots for the GG-02 plates, and close the byte hole the masthead opens (LANE-D, commit prefix "feat:")

**FIRE-AUTHORED (attended review welcome)** — s1206, 2026-07-29.

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-d`.

READ FIRST: `AGENTS.md`; `specs/greenhorn-gazette/README.md` (**the ratified spec — the first Herald issue IS the tutorial, owner's own synthesis**); `reviews/gazette-first-issue.md` (**GG-01, the wiring this completes — `97c6a257`**); `reviews/art-gazette-first-issue.md` (**GG-02, the art this wires — `8dff01fb`**); `reviews/gazette-art-wiring.md` **and** `reviews/gazette-art-wiring-hardening.md` (**the two slices that already solved this exact problem for the `renderItem` engravings — reuse their technique, do not re-invent it**); `src/news/heraldReader.ts`; `scripts/asset-diet.mjs`; `tasks/BACKLOG.md`.

CODEX: gpt-5.6-sol effort=medium

## Why (the gate is satisfied — both halves landed, and this rung was named in advance)

`tasks/BACKLOG.md:1727` set the ladder out when the owner ratified the Gazette: *"GG-01 wiring queued lane-d (text-first per NO-BLOCKER), GG-02 art batch queued art slot (behind current batch), **GG-03 swap = ladder after both**."* Both are now on `main`:

- **GG-01 shipped `97c6a257`** — the pinned six-panel issue renders, and it deliberately left the art slots empty. `src/news/heraldReader.ts:151` is literally `<div class="claim-herald__art-slot" aria-hidden="true">Engraving reserved</div>`.
- **GG-02 accepted `8dff01fb`** — seven plates in `assets/raw/`, canon-verified by the s1205 drain **by opening the PNGs**, extraction and wiring **correctly withheld** because the batch is reference-tier and full-bleed with no `#ff00ff`. That withheld wiring is this task.

**The panel ids already match the filenames one-for-one** — verified at source by the authoring fire, not assumed. `FIRST_ISSUE_PANELS` (`heraldReader.ts:20-68`) declares `claim-goal`, `seams-gold`, `the-works`, `the-arms`, `freeing-fevered`, `town-serves`; `assets/raw/` holds `gazette-panel-<id>.png` for all six. There is no mapping to invent.

### 🔑 THE MEASUREMENT THAT SHAPES THIS TASK — DO NOT RE-DERIVE, BUT DO RE-CHECK

The authoring fire measured every raw (PNG IHDR, not a guess):

| file | dimensions | raw size | asset-diet branch |
|---|---|---|---|
| `gazette-panel-claim-goal.png` | **1672×941** | 3.64 MB | ✅ plate tier (`asset-diet.mjs:58`) |
| `gazette-panel-freeing-fevered.png` | **1672×941** | 3.71 MB | ✅ plate tier |
| `gazette-panel-seams-gold.png` | **1672×941** | 3.69 MB | ✅ plate tier |
| `gazette-panel-the-arms.png` | **1672×941** | 3.16 MB | ✅ plate tier |
| `gazette-panel-the-works.png` | **1672×941** | 3.58 MB | ✅ plate tier |
| `gazette-panel-town-serves.png` | **1672×941** | 3.67 MB | ✅ plate tier |
| `gazette-masthead.png` | **1983×793** | **3.10 MB** | 🚨 **MATCHES NO BRANCH** |

The six panels land inside the existing plate selector `(width === 1671 || width === 1672) && height === 941`, so they inherit the 87% cut for free. **The masthead matches nothing** — not the plate tier, not the 1024² square tier — so an eager import of it ships **3.10 MB unoptimized to a browser game**.

⚠️ **This is F-1186-1 arriving exactly when it said it would.** That finding closed the GAZETTE-ART ladder with a forward-looking rider: the resize (`asset-diet.mjs:88`) and the budget (`:116`) both key on the literal basename substring `herald-engraving-`, so *"a cut named otherwise escapes **both** silently; zero exposure today, **fix belongs with the eighth cut, not before.**"* You are the eighth cut. The gazette plates are named `gazette-panel-*` / `gazette-masthead`, so **they are outside the herald budget's denominator entirely** — the ceiling that exists cannot see them.

⚠️ **And F-1184-1 is the reason a budget is not optional:** the herald spot cuts were measured at **16,492,796 B naive → 281,444 B** as 384 px WebP. Naive eager globbing of seven multi-MB plates is the same mistake with a bigger number.

## Scope

### 1. Measure-first gate — establish the real cost BEFORE choosing a mechanism (MANDATORY; a STOP here is a SUCCESS)

**1a.** Wire the six panels the *simplest* way that mirrors the shipped precedent (`heraldReader.ts:5-18`: an eager `import.meta.glob` with `{ query: '?url', import: 'default', eager: true }` over `assets/raw/`, keyed by id) and build.
**1b.** Measure the **total `dist/` bytes attributable to the gazette plates** — the same way `reviews/gazette-art-wiring.md` measured its 16.5 MB → 281 KB, by enumerating `dist/` and attributing by filename family. Report the number.
**1c.** Decide the masthead separately and **report the decision with its number**: either (i) widen `asset-diet.mjs`'s selector so `1983×793` is a recognised tier, or (ii) do not ship the masthead as an image at all if the rendered issue never displays it — **check whether the masthead is even referenced by the renderer before you spend bytes on it.** The spec's six panels are the deliverable; the masthead may be a reference asset with no consumer, and *a merged art file can be unreachable — verify the consumer, not the filename.*
**1d.** ⛔ **STOP AND REPORT if the gazette tier cannot be brought under a stated ceiling** without touching anything outside this task's firewall. Do not thin the images' quality to force a pass, and do not widen a selector so broadly that unrelated PNGs get swept in — F-1185-3 already had to narrow exactly that over-reach.

### 2. The swap

Replace the `Engraving reserved` placeholder in `renderFirstIssuePanel` (`heraldReader.ts:148-156`) with the panel's engraving, following `renderItem`'s shipped shape (`:158-167`): an `<img>` carrying `alt=""` + `aria-hidden="true"` (these are decorative — the panel's headline and lines are the accessible content, and that must not change), a stable `data-testid`, and a **graceful fallback to the existing placeholder when a panel has no image**, since the unclassified path being the common path is what F-1184-1's sibling finding got wrong once already.

### 3. The budget becomes a guard, not a hand-measurement

`asset-diet.mjs` already carries `HERALD_SPOT_CUT_BUDGET_BYTES = 1_500_000` (`:12`), prints the tier's measured bytes, and **throws above the ceiling** (`:123-124`). Extend that same mechanism to cover the gazette family with its own named constant and its own printed line. **F-1184-1's ceiling was proved once, by hand, by a drain, and nothing preserved it** — that was the whole lesson of the hardening slice. Prove the new ceiling fails by lowering it below the measured value and showing the build exit non-zero, then restore it.

### 4. The proof a player sees it (Mistake #10)

Extend the GG-01 spec (`e2e/` — the one `reviews/gazette-first-issue.md` names) so a **plain `/` boot** with no `?debug` opens the Gazette and asserts each of the six panels shows its engraving. **Assert `naturalWidth > 0`, not merely that `src` contains the right substring** — F-1185-2 was exactly this gap, and F-1185-3's control *demonstrated* it: pointing a map entry at a 404 whose URL still contained the family substring left the `src`-contains assertion **PASSING** while the `naturalWidth` assertion failed with `Received: 0`.

**4.1 — the load-bearing control.** Prove the new assertion **separates** from a weaker one, by the same method: break one panel's reference to a 404 that still matches the family substring, show the weak assertion passes and yours fails, then restore. **STOP if it cannot separate** — an assertion that cannot distinguish itself from the one it replaces is not coverage.

### 5. What you must NOT do

- ⛔ **Do not extract, key, or crop the plates.** They are reference-tier and full-bleed with **no `#ff00ff`**; `scripts/extract-alpha.mjs` is not for them. The s1205 drain withheld extraction deliberately.
- ⛔ **Do not edit the panel copy.** It is owner-ratified canon (`specs/greenhorn-gazette/README.md`) and was canon-verified plate-by-plate.
- ⛔ **Do not touch `playwright.config.ts`**, and do not raise timeouts as a fix for anything.
- ⛔ **Do not regenerate, retouch, or replace any `assets/raw/gazette-*.png`.** Art generation is the ART slot's act, never a lane's.

## Firewall

**TOUCH-ONLY:** `src/news/heraldReader.ts` · the GG-01 e2e spec named in `reviews/gazette-first-issue.md` · `scripts/asset-diet.mjs` · CSS for `claim-herald__art-slot` if the swap needs it · `artifacts/gg-03-gazette-panel-swap/` for screenshots.

**NO:** `assets/raw/**` (read-only) · `specs/**` · `playwright.config.ts` · `src/news/herald.ts` · any other `src/` surface · any other spec · `tasks/` · `reviews/` · `STATUS.md`.

## Two owner notes to carry, NOT to act on

Both are 🔻 low and sit on the owner's desk; **report them in your run notes, change nothing:**

- **F-1205-7** — the helping hand in panel 5 (`freeing-fevered`) is a **human** arm, not the Prospector's brass one. The owner wanted an eyeball on this *at GG-03* **before it is captioned as the player's action**. You are wiring it, not captioning it; if your swap makes that panel read as the player's own act, say so.
- **F-1205-8** — panel 4 (`the-arms`) frames combat as a **target range**. Canon-safe (ADR-001 clean: a broad open brass ring, no barrel/muzzle/grip/trigger), but never explicitly ratified.

## Self-check before you report

- `npx tsc --noEmit` rc=0 · `npm run build` rc=0 with the **new budget line printed** and its measured bytes.
- `npm run test:node-guards` — run it **first**, per s1185's own lesson.
- The GG-01 spec **green on desktop AND mobile-chrome (390 px)**, on a **plain `/` boot**, with zero console/page errors asserted **inside** the spec.
- Adjacent: `gazette-art-wiring` and `asset-diet` suites green.
- Scope 1's byte numbers, scope 3's deliberately-failed ceiling, and scope 4.1's separation control each reported with **real numbers**, not adjectives.
- Screenshots of the rendered issue (desktop + 390 px) in `artifacts/gg-03-gazette-panel-swap/`.
- ⚠️ **If a gate goes red, report the red.** Do not re-run until it passes and report the passing arm — that is F-1205-6, and it is the single reason a sibling slice on this same board was rejected twice.

**READY-FOR-GATES** + report: the gazette tier's dist bytes before/after, the masthead decision and why, the ceiling's proved-failure number, the 4.1 separation result, and anything you had to leave alone.

## Lane pre-flight (SAFE-DUPE — read this, do not skip it)

`lane/perf` is **1 commit ahead of `main` and it is a FALSE-AHEAD SAFE DUPE**, proved by content by the authoring fire, not assumed: `641140f6`'s cure is already on `main` (both collection guards carry the truncation guard *and* `mkdtemp` file-backed capture), the two-dot diff's only addition is the task master copy, and everything else in it is phantom deletions from a stale base. `worktrees/lane-d` is **clean**. A `reset --hard` is therefore safe **for this lane at this tip**.

**Re-verify it yourself before resetting** — that is the LANE-SAFETY LAW, and w1-03 and polish-02 were destroyed by exactly this step: if `git log main..lane/perf` shows any commit whose content is **not** already on `main`, **STOP and report** instead of resetting.
