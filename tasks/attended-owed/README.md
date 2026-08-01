# tasks/attended-owed — edits a fire is PERMISSION-DENIED from making

Opened s1343 (2026-08-01), F-1343-1. Guard: `scripts/attended-owed-audit.mjs`, wired into
`npm run test:ledger-guards`, which every fire runs as its last act (F-1300-4).

## What belongs here

An **ACTION**: a specific, already-decided edit that any unrestricted shell can perform, which a
fire cannot — overwhelmingly writes under `.claude/` (F-1027-4 denies the fire shell).

## What does NOT belong here

A **RULING**: anything needing Robin to *decide* — a design fork, canon, money, publishing.
Those go on the OWNER'S DESK as they always have.

That distinction is the entire point of this directory. The desk's 🔺 is an owner-**routing**
axis and BACKLOG's 🟡/✅ is a census-**visibility** axis (`desk-declaration-guard.mjs:26-34`
forbids conflating them); **neither can express "anyone could do this, the fire was just
gated."** So an ACTION filed as desk prose queues behind decisions it does not need, and reads
as though it were waiting on judgement when it is waiting on thirty seconds.

## 🚫 The one rule that outranks everything else here (s1349, F-1349-2)

**Never land an item by routing around the permission denial that put it here.**

Items in this directory exist *because* a tool call was denied. The fire allowlist is broad —
`Bash(node:*)`, `Bash(cat:*)`, `Bash(cp:*)`, `Bash(mv:*)` — so for a `.claude/` target a fire
almost certainly **could** write the file from a shell. **It must not.** The boundary on
`.claude/` exists to stop an autonomous agent from editing its own instruction surface; an agent
that satisfies it with one tool and defeats it with another has defeated the control, not
complied with it. **The denial is the answer, not an obstacle in front of the answer.**

⚠️ The risk here is not ignorance, it is **attrition**. These items are by construction cheap,
already-decided, fully composed, and printed at every fire — item 001 has now been read out
**seven** times without landing. The fire most likely to shell around it is a *late* one that has
inherited the frustration of six predecessors. **If you catch yourself reasoning "it's only a doc
paste" — that is the exact thought this paragraph is for.** Write another line in your handoff
and leave it open; an item that stays OPEN is the mechanism working.

**And do not propose an allowlist entry either.** Measured s1349 (F-1349-1): `.claude/settings.json`
already grants bare `"Edit"` and `"Write"` unqualified, this fire's config dir carries no
`permissions` key at all, neither config denies `.claude`, and the write is *still* refused while
the same `Edit` tool succeeds on a non-`.claude` path in the same session. **There is no
allow-entry left to add** — the boundary is enforced above the settings layer. That recommendation
is measured worthless; spend no further lines on it.

## Format

A header block of `key: value` lines, then a `---` fence, then whatever a human needs:

```
target: .claude/skills/drain/SKILL.md      # required — the file that must change
anchor: SOME DISTINCTIVE PHRASE            # required — see below
why:    one line                           # optional but expected
opened: s1343 2026-08-01                   # optional
kind:   ACTION                             # optional
```

## The anchor is the contract

**"Landed" is never a claim anyone makes — it is `target` containing `anchor`, verified by
reading the target file.** Choose a short, distinctive, stable phrase from the text being
pasted. If a later editor paraphrases the anchor away, the item correctly stays OPEN: the
guard's question is "can a reader find this in the destination?", which is the only question
that matters.

This is s1342's through-line mechanised — *before writing "GATE: none" because you did the
thing, ask what a reader would have to READ to know you did it.* Here the reader is a script.

## Lifecycle

1. A fire hits a permission denial, writes the item here **with the exact text to paste**.
2. Every subsequent fire prints it (rc 0 — an OPEN item is not a defect; only the attended
   side can clear it, and a permanently-red guard gets flagged past within a fire or two).
3. Attended pastes it. The guard now finds the anchor in the target and reports
   **LANDED-NOT-ARCHIVED at rc 1** — a defect a *fire* can fix.
4. Any fire clears it: `mv tasks/attended-owed/<item>.md tasks/attended-owed/archive/`, commit.

`archive/` is invisible to the guard (it globs `*.md` at the top level only). Items are
archived, never deleted — Retention Law.
