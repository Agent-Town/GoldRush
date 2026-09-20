# Review — gauntlet-heat-e1 (s2270 drain 2)

**Slice:** `gauntlet-heat-e1` · **Branch:** `lane/c` · **Tip:** `e6f990be95c81d49dd5728ab60644c7878c4e579`
**Merged to main at:** `6eedc0d8861607612a4139e37d64c3ec6d914909` (fast-forward of the gated commit)
**Gate worktree:** `.gate-s2270` (detached, §3.0b)

## VERDICT: MERGE — the ride is honest, the firewall is perfect, and the evidence is complete. One finding rides out with it, and it is bigger than the heat.

## What it does

The season's first heat. No code: the deliverable is **verified standings on the live board** plus the
evidence trail. The rider rode the first bench seed of each contract at the deployed build
`3e383b2fa` (the c6 skew law), through `scripts/gr-sim.mjs` over stdin, no `?debug`, authoring its
own standing orders from `public/skill.md` as any stranger would.

**14 attempts. 2 verified rows. 4 honest refusals.**

| contract | attempts | secured wave | gold | verdict |
|---|---:|---:|---:|---|
| `the-claim` | 1 | 10 | 98 | **verified** `fnv1a32:42907676` |
| `e1-dry-gulch` | 1 | 20 | 147 | **verified** `fnv1a32:08ad7db2` |
| `e1-night-shift` | 3 (16, 8, 10) | — | — | not submitted — unsecured |
| `e1-twin-banks` | 3 (7, 9, 12) | — | — | not submitted — unsecured |
| `e1-baron` | 3 (12, 21, 21) | — | — | not submitted — unsecured |
| `e2-hill-mine` | 3 (9, 13, 12) | — | — | not submitted — unsecured |

Verified by reading all six `verdict-slip.json` files at the lane tip, not the note that summarises
them: the two submitted slips carry `"assay":"verified","ranked":true`; the other four carry
`"assay":"not-submitted","reason":"unsecured-after-three-attempts"` with every attempt's tapeId and
waves preserved. **Nothing was rounded up into a row.** The master's honesty guard said *"an unfilled
board cell is better than a fake row"* and the rider obeyed it four times out of six.

## Evidence

| Gate | Result |
|---|---|
| Firewall | **PERFECT** — all 36 changed paths are `artifacts/gauntlet-heat-20260824/**` or `tasks/BACKLOG.md`. Zero `src/`, `scripts/`, `functions/`, `assets/`, `e2e/`, `specs/`. |
| `npx tsc --noEmit` | **rc=0** on the merged tree |
| `npm run build` | **rc=0** — `✓ built in 1.33s` |
| Retention | tapes, submissions, verdict slips, per-contract rider scripts and the run note all committed — nothing left to die with the disk |

No spec run is owed: the slice changes zero executable source, so tsc + build is the whole applicable
battery and both were run on the merged tree rather than argued away.

## Merge classification

Base `20e7163ac` + tip `e6f990be9`, one **conflict**, in `tasks/BACKLOG.md` only — both sides had
appended a new top row (main: my drain-1 block; lane: its own completion row). Resolved **keeping
both**, with the lane's `gauntlet-heat-e1 COMPLETE` row placed directly beneath the row that
dispatched it. Verified after resolution that all four claims survive: the lane's completion row,
my `F-HARNESS-1 SHIPPED` row, `F-2270-1`, and s2269's `F-2269-1`. `git log main..lane/c` is **empty**.

## The rider's own door findings (fresh eyes are the point — both kept)

1. **The one-line vs two-line stdin framing.** `skill.md` says one JSON array followed by a newline;
   the older `l3-rider.mjs` example adds a second blank line. The two-line framing repeatedly
   produced stale `PICK_UPGRADE requires a live offered id` refusals and defaulted picks; one-line
   framing gave `defaultedPicks: 0` on Baron and Hill Mine. **The example contradicts the sentence**,
   and the example is what a rider copies.
2. **`?verdict=<tapeId>` alone returns HTTP 400 `bad_verdict_lookup`.** The working lookup needs
   `epoch`, `contract` and `verdict` — which `skill.md` documents correctly and the *heat task's own
   shorthand* omitted. The door is right; the instruction was wrong.

Both are cheap door-polish items ahead of the announcement, and neither blocks this merge.

## Findings

🚨 **F-2270-3 — LAUNCH-RELEVANT, and it is not the heat's fault: EPOCH ONE ADVERTISES SIX CONTRACTS
AND ONLY FIVE CAN CARRY A VERIFIED BENCH STANDING. The sixth, `e1-drill-yard`, has NO BENCH SEED.**

I went looking because the heat rode something called `e2-hill-mine` under a master that called it one
of *"the six E1 contracts"*. It is not one — `e2-hill-mine` is unambiguously E2
(`Terrain3dClaimPilot.ts:313` *"joins at the E2 beauty shift"*; grouped with `e2-trestle`,
`e2-pressure-garden`, `e2-incline` in `LANDMARK_CONTACT_CONTRACTS`; the E2 boss in
`worldDispatches.ts:32`). Chasing the real sixth produced the finding:

- **The roster** — `assets/contracts/epoch-1-frontier/contracts.json` — is
  `the-claim · e1-drill-yard · e1-dry-gulch · e1-night-shift · e1-twin-banks · e1-baron`.
  **Six, exactly as the owner said.** The sixth is `e1-drill-yard`, never hill-mine.
- **The door SERVES it.** Probed directly: `gr-sim --contract e1-drill-yard` clears contract
  admission and reaches the order loop (it dies on my empty stdin, which is my probe's doing, not a
  refusal). So this is not an unsupported contract.
- **The bench seed does not exist.** `assets/contracts/bench-seeds.json` holds 37 contracts and
  `e1-drill-yard` is not among them — the only member of the Epoch One roster that is missing.
- **And bench membership is enforced at submission**, by the rule `lb-01-county-standings.spec.ts`
  pins as *"bench submissions require membership in the contract frozen seed set."*

⇒ **No rider can post a verified bench standing on one sixth of Epoch One.** The announcement copy
the owner personally corrected on 2026-08-24 reads *"Six frontier contracts in Epoch One"* — true of
the roster, false of the board a bounty hunter will actually meet.

⚖️ **Honest severity:** this does not block this merge and the heat's numbers are not wrong — they are
a truthful record of what was ridden. What is wrong is the denominator: *"2 of 6"* was scored against
a roster that swapped in an E2 contract, so `e1-drill-yard` has **never been ridden by anyone**, and
three attempts of this heat measured an E2 door instead.

➡️ **Recommendation — OWNER'S WORD, and it is a one-word call:** add a frozen bench seed for
`e1-drill-yard` **(a)** before the announcement, so the advertised six are all rideable, or **(b)**
after it, accepting that the first bounty board shows five. I recommend **(a)**: the work is one
entry in `bench-seeds.json` plus a confirming ride, it is cheap, and *"six advertised, five
rideable"* is exactly the kind of detail a serious harness files as a finding on day one — the
county should not be corrected by its own guests in announcement week. It reaches the desk rather
than a fire's own hand only because bench seeds are **frozen for fairness**: adding one mid-season
changes what the board compares, which is a ruling and not a chore.

ⓘ **Also owed, small:** the heat master's contract list (`tasks/gauntlet-heat-e1.md`, scope item 1)
names `hill-mine` where the roster says `e1-drill-yard`. Any successor heat authored from that list
inherits the same substitution. The master told the rider to *"confirm the list from
bench-seeds.json"* — and the rider did exactly that, which is how a wrong list became a wrong ride:
**bench-seeds is a seed registry, not the epoch roster, and it was asked the roster's question.**
