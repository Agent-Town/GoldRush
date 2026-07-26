# rf-23 — the OTHER throw: guarding the bare `localStorage` ACCESS on the boot path

Slice: `lane-blocked-storage-access-throw` (goal leaf `rf-23`)
Branch: `lane/m3` · tip `f231b073` · merge-base `1bffcdbe`
Drained: s1085, 2026-07-26

**Verdict: MERGED.** All gates green, and the fix is proven by a mutation control I re-ran myself.

## What it does

There are two ways a browser refuses storage. Rounds 1–3 (`rf-19`, `rf-20`, `rf-22`) all fixed **mode 1** — `window.localStorage` returns an object whose *methods* throw. This slice fixes **mode 2** — Safari *Block All Cookies* and third-party-blocked iframes raise `SecurityError` on the **property access itself**, before any method is called.

Two boot-path sites took that access bare:

- `src/game/Game.ts:570` — `new TileStateStore(localStorage)` in a **class field initializer**. Under mode 2 it throws *during field initialization*, so `new Game()` never returns — and it cannot be try/caught where it stands.
- `src/game/Game.ts:1309` — bare `localStorage` into `new E7SignalSystem(...)`, same constructor.

The fix exports one accessor from `ProfileStorage.ts`:

```ts
export function safeLocalStorage(): Storage {
  return browserStorage() ?? inertStorage;
}
```

`browserStorage()` (`:476-482`) already wrapped the bare access in try/catch — it is reused rather than duplicated, which is the whole lesson of F-1083-1. `inertStorage` is a module-scope **null object**: `getItem`/`key` → `null`, `setItem`/`removeItem`/`clear` → no-ops, `length` → 0. It **retains nothing**, so the shadow-store hazard (F-1083-3) stays out of scope as the master required. `TileStateStore.ts` needed no type change, so the narrow firewall lift went unused.

The other half is the oracle: a new test whose stub makes the **property access** throw, which the existing `:130` test structurally cannot simulate (its getter *returns* a throwing object, so the access succeeds).

## Evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **exit 0** (3.69s) |
| `npm run build` | **exit 0** (14.02s, built in 1.16s) |
| Battery, 6 suites × 2 projects, `--workers=1` | **54 passed / 0 failed, exit 0**, summary line present (F-1081-6) — 4.1m |
| Plain-boot probe, desktop 1280×800 + mobile 390×844 | **0 errors · 0 warnings · 0 pageErrors** → `PROBE CLEAN` |
| Guard-silence check | new guard's "Tile state read failed" warns: **0** at both viewports |

Battery suites: `task-024-blast-aim-presets` · `profile-first-boot` · `m3-06-demo-profiles` · `board-gating-and-profiles` · `tp00-tile-persistence` · `e6-tile-consumers`. Both storage oracles pass on both projects — `:130` (mode 1, methods throw) and `:167` (mode 2, access throws).

Measurement hygiene: scratch vite on port **5256** via `playwright.s1085-scratch.config.ts` (`reuseExistingServer:false`, `--strictPort`), and the listener's **cwd was proven** `= /Users/robin/Claude/Projects/Gold Rush` by `lsof -d cwd` before any number was trusted (F-1077-3).

## Mutation control — re-run by the drain, not merely inherited

`Game.ts:570` alone reverted to bare `localStorage` (one site; `:1309` left guarded), then the new oracle run on desktop-chrome:

```
✘ e2e/task-024-blast-aim-presets.spec.ts:167:1 › difficulty preset falls back to default
                                                 when profile storage access is blocked (30.1s)
  1 failed        (exit 1)
[vite] (client) [Unhandled rejection] Error: SecurityError: storage access denied
 > <instance_members_initializer> src/game/Game.ts:570:55
```

This is the result F-1084-3 said `rf-22` could not produce. There, the control failed at the pre-existing `openGame` wait and never reached the new assertion, leaving the fix formally unproven. Here the throw is **attributed to `Game.ts:570:55` inside `<instance_members_initializer>`** — precisely the failure the master predicted — so the new test demonstrably exercises the site it claims to guard.

The mutation was reverted and the tree re-verified **byte-identical to `f231b073`** both before and after the control.

## Merge classification

Merge-base `1bffcdbe`. All three files **LANE-TOUCHED only, zero MAIN-MOVED**, so this was a byte-identical graft with no 3-way and no conflict resolution:

| File | Lane | Main | Resolution |
|---|---|---|---|
| `e2e/task-024-blast-aim-presets.spec.ts` | +19 | — | wholesale, byte-identical |
| `src/game/Game.ts` | +3 −3 | — | wholesale, byte-identical |
| `src/game/ProfileStorage.ts` | +16 | — | wholesale, byte-identical |

Total **38 insertions / 3 deletions**. A real diff exists, so this is not a Silent No-Op (Mistake #1). Firewall held exactly: three files, all inside TOUCH-ONLY; `TileStateStore.ts` untouched; nothing under `functions/`; `scripts/deploy.sh` absent from the diff (F-1073-1).

## Findings

- **F-1085-2 (non-blocking, informational).** The mode-2 failure still surfaces as a 30s *timeout* rather than a crisp assertion failure, because an unguarded boot hangs before any assertion runs. The control is valid — the cause is printed and localized to `:570:55` — but a future reader of a red run sees "timeout" first and the `SecurityError` only in the WebServer log. Not worth a corrective on its own; worth knowing when triaging.
- **Scope-3 sweep returned empty.** Codex reported no further boot-path bare accesses; the out-of-scope sites (`Game.ts:1380`, `:1962-1964`, `DebugEraSeed.ts`, `CeremonySystem.ts:503`) remain post-boot or `?debug`-only, where a throw degrades a feature rather than preventing play.
- **The storage thread is now closed on both modes.** Mode 1 closed by `rf-19`/`rf-20`/`rf-22`; mode 2 closed here, each with its own oracle. A round 5 would need a third failure mode, not another site.
