# f-board-2 — live county-repo links + strictly OPT-IN source links

**Slice:** `f-board-2-opt-in-links` · **branch:** `lane/b` · **tip:** `9c0ab1e01`
**Base:** `8d7896e6e` (main) · **Merged:** `s1617` · **Review author:** s1617 fire

## Verdict

**MERGE.** Implements the owner's two-tier privacy model exactly as ruled, with the opt-in constraint honoured at
every boundary. Full F-1229-1 battery + board e2e green on the merged tree, gated in a detached worktree (§3.0b) on
scratch port 5234.

## What it does

Implements THE OPT-IN SKILL LAW (owner 2026-08-10, verbatim: *"other users might not want to do this kind of public
data collection. If we make it mandatory it adds a lot of complexity for a private person?"*):

1. **`source` joins the stack as its own optional rule** — `functions/api/standings.ts`: optional, `https://` only,
   ≤ `MAX_STACK_FIELD_LENGTH` (256), `new URL`-parseable, stored and projected through `boardRow` like
   model/harness. Absent = absent everywhere. Nothing new is required of anyone.
2. **The board renders it as a quiet chip** — `reader.ts:763` appends a `source ↗` anchor only when declared;
   undeclared rows render byte-identically to before (the template's else-branch is the empty string).
3. **The Front Desk repos go live** — the two plain `<span>`s become anchors to `Agent-Town/GoldRush` and
   `Agent-Town/goldrush-gauntlet` (`target="_blank"`, `rel="noopener"`). They 404 until the owner flips the repos
   public; that is expected and was explicitly not gated on.
4. **`public/skill.md`** documents the optional field in one sentence.

## Evidence (merged tree, `--workers=1` per F-1270-1)

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | rc=0 |
| `npm run build` | rc=0, built in 1.07 s |
| `test:stats` (F-1229-1) | **87 checks passed** |
| `test:accounts` (F-1229-1) | **43 checks passed** |
| `test:mp` (F-1229-1) | **462 checks passed** |
| `e2e/lb-01-county-standings.spec.ts` + `e2e/field-book.spec.ts` | **26/26**, desktop + 390 px, 52.0 s |
| screenshots | 4 in `reviews/shots-f-board-2/` — with-source and without-source, both projects |

Every figure independently reproduces the runner's own report.

## Security review (done because this renders a user-supplied URL as an `href`)

✓ **Sound, defence in depth at both trust boundaries. No finding.**

- **Server.** The `source` rule (`functions/api/standings.ts:500-508`) lives inside `validateStack`, which is called
  on **all three** paths — POST (`:347`), stored-row rehydration (`:430`, `stored=true`), and `:531`. So a row
  poisoned in storage is rejected on read, not merely on write.
- **It is an allowlist, not a blocklist:** `new URL(value.source).protocol !== 'https:' → return null`. That rejects
  `javascript:`, `data:`, `vbscript:` and plain `http:` by construction rather than by enumeration, so it cannot rot
  as new schemes appear. Unparseable input is caught and rejected. Length capped at 256.
- **Client re-validates rather than trusting the wire** — `reader.ts:808-816` repeats the same https check at the
  render boundary, and `:705` additionally forbids an *undeclared* rider from carrying a source at all.
- **Output is escaped** — `escapeHtml(stack.source)` on the href, with `rel="noopener"` and `target="_blank"`.
- **The opt-in law holds mechanically, not just by intention:** no key was added to any required set; `source`
  appears in `STACK_KEYS` / `STORED_STACK_KEYS` only, and `boardRow` spreads it conditionally (`:254`), so an
  undeclared rider's payload and rendered row are unchanged.

## Merge classification

`main..lane/b` = 1 commit (`9c0ab1e01`), **10 paths, all LANE-ONLY**; main moved none of them since the base.
Every path is inside the master's TOUCH-ONLY list — `functions/api/standings.ts`, `src/encyclopedia/reader.ts` +
`reader.css`, `e2e/field-book.spec.ts`, `e2e/lb-01-county-standings.spec.ts`, `public/skill.md`, and 4 screenshots.
No firewall violation. Three-way merge (`ort`), clean; merged and committed as **one act**, never staged (F-1589-5).

## Findings

None blocking. Two notes for the record:

- **This slice's "done" was a FALSE DONE first (F-1617-2), and the guard is why it wasn't a disaster.** Its first
  dispatch STOPPED at the lane-safety pre-flight because `lane/b` still held f1614-1's three undrained
  advance-stream paths; the runner discarded nothing, edited nothing, and said *"Retry after f1614-1 drains."*
  f1614-1 merged at `1e2172f45` twelve minutes later, s1617 re-queued the master byte-identically
  (sha256 `b53014c129dcf1aa`) after refreshing the lane `behind=27 → 0`, and it completed first time. **Authored,
  stopped, re-queued and merged inside two fires, with zero work lost.**
- **The Front Desk anchors point at repos that are still private**, so they 404 today. That is the owner's
  outstanding click (repo-public flips), already tracked on the release checklist — deliberately not gated on, per
  the master.
