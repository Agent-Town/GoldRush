# f1510-3-inventory-revision-metadata — drain review (s1516)

**Slice:** `lane-f1510-3-inventory-revision-metadata` (F-1510-3, the revised s1514 gate)
**Branch:** `lane/b` · **Tip:** `6c7f6cac9` · **Base:** `8c2189875` (main at drain time)

## VERDICT: **MERGED — as a NEGATIVE RESULT.** F-1510-3 is NOT cured; its row stays OPEN with the residue reduced to one line.

The licensed negative condition fired, and it fired on **the exact hazard the master named**. The
runner refused to ship guards around an output it had proved false. That is the correct call and the
`8134ec30` precedent: hardening a defect behind a green test is strictly worse than shipping nothing.

Docs-only: **1 file, +101 lines**, no code, no guard arms, no config change left behind.

## What was measured

The runner did the expensive half properly before concluding anything:

1. **Manufactured the reducer REDs first** — three fixture arms (recorded 40-hex revision with
   `dirty:false`; absent metadata → `unrecorded`; `dirty:true` visible) against the **pre-change**
   reducer: `tests 10 / pass 7 / fail 3`, rc=1. Each failure the expected missing-output assertion.
2. Temporarily implemented the copy-only reducer line → all three green (`10 pass / 0 fail`). This
   established **reducer** behaviour only, and the report says so explicitly rather than letting it
   stand in for the end-to-end claim.
3. **Ran a real Playwright JSON-reporter run**, which is the step that decided it:

```
{"revision":"unrecorded","dirty":"unrecorded","actualWorkers":1}
configFile=/Users/robin/Claude/Projects/Gold Rush/worktrees/lane-b/playwright.config.ts
playwright_rc=0
```

4. Exposed the swallowed error to name the cause instead of guessing:

```
Playwright revision metadata could not be recorded: ReferenceError: __dirname is not defined
    at captureRevision (.../worktrees/lane-b/playwright.config.ts:109:28)
```

## Constraints held (verified in the diff and the report)

- `workers: isFireShell ? 1 : undefined,` remained on **line 50** throughout — the hard bar.
- `node scripts/law-pointer-guard.mjs` **PASS** (26 pointers, 23 checked, 2 illustrative, 1 known-rotten).
- The reducer never called `git`.
- `logs/suite-red-inventory.md` and `-compact.json` untouched.
- `npx tsc --noEmit` rc=0 during the temporary implementation.
- `npm run build` + browser **NOT OWED** (no `src/**`). [F-1460-1] paths checked: none touched.

Gates owed on the merged tree are trivial here — the merge adds a single markdown file and no
executable surface, so tsc/build/browser are not owed and are stated rather than skipped silently.

## 🔑 The finding is against MY OWN pricing, and it is the reusable half

**[F-1516-1] — a probe can validate the right mechanism through the wrong module system.**

s1516 priced this task the same fire, and its decisive evidence was a probe in `/tmp/s1516-pw-probe`
that declared `metadata: { revision: <git rev-parse HEAD, cwd: __dirname> }` and **worked** — it
returned a real sha. On that basis the pricing doc and the master both **mandated `__dirname`**.

The probe directory had **no `package.json`**, so Playwright transpiled its TS config to **CommonJS**,
where `__dirname` exists. This repo is `"type": "module"` (`package.json:5`), so the same config
loads as **ESM**, where it does not. **The probe validated the mechanism through a module system the
subject does not use** — a control that matched on flags and not on *composition*.

⚖️ **What survives and what does not, stated precisely, because the distinction decides the successor's size:**

- ✅ **SURVIVES — and is now independently confirmed in the repo.** The threading channel works:
  `report.config.metadata` carries user-declared keys verbatim **alongside** Playwright's injected
  `actualWorkers`. The runner's own real run proves it — `{"revision":…,"dirty":…,"actualWorkers":1}`
  is exactly that co-existence, measured in `worktrees/lane-b` rather than in my `/tmp` stub. Every
  conjunct of the revised gate except the directory source is now proved **twice, in two trees**.
- ❌ **DOES NOT SURVIVE.** `__dirname` as the directory source, in this repo's ESM config.

➡️ **The successor is therefore SMALLER than this task, not larger:** swap the directory source for
`import.meta.dirname` (available on the pinned 26.4.0) or `fileURLToPath(import.meta.url)`, and
re-run the same JSON-reporter proof the runner has already built and documented. The reducer line and
the three fixture arms are specified and were proved red-then-green; they simply must not land until
the config half is proved.

💡 The instructive part is that the pricing was otherwise careful — it asked the F-1514-1 question
conjunct by conjunct, and got four of five right. **The one it got wrong is the one it had "proved"
by experiment**, which is precisely the conjunct nobody re-examines. A probe's *composition* is part
of its claim.

## Residue

**F-1510-3 stays OPEN**, scope now reduced to the directory source. The gate sentence is unchanged
and still correct. Do not close it on this merge.
