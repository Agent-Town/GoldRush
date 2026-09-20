import { readFileSync, writeFileSync } from 'node:fs'

const B = 'tasks/BACKLOG.md'
const R = readFileSync(B, 'utf8').split('\n')
const anchor = R.findIndex((l) => l.startsWith('🟡 **F-1327-3'))
if (anchor === -1) throw new Error('anchor F-1327-3 not found')

const f4 =
  '🟡 **F-1327-4 (s1327, MEASURED ON BOTH LIVE DRAINS — THE TWO THE-STATIC MASTERS WERE QUEUED WITHOUT GOAL LEAVES, SO §3.0 ANSWERS "UNKNOWN" AND THE DEFAULT EXIT CODE READS AS CLEARANCE).** `8a4de2c1` queued `lane-survive-copy` and `lane-herostart-rename` and **did** touch `tasks/goals.json` — but only to retitle two existing leaves (`e1-hold-the-claim-defeat-fork`, `roster-wiring-e6-e10`). **Neither new master got a leaf.** Measured: `node scripts/drain-block-check.mjs 20260801-112853-lane-survive-copy.md --strict` → **rc=2, `? UNKNOWN — no goal leaf matches`**; the same call without `--strict` exits **0**, identical text. ⚠️ **That is precisely the trap §3.0 documents — a fire branching on the exit code alone reads UNKNOWN as permission — and it is now live on two real drains at once, which is the first time this has been observed on a pair.** ⓘ **This is a bookkeeping gap, NOT a policy block: the owner explicitly ruled (C)-now on 2026-08-01, so both slices are authorised** — the parent `e1-hold-the-claim-defeat-fork` leaf correctly stays `blocked`, because what remains banked is the *fork* (`DRAFT-e1-hold-the-claim.md`, options (A)/(B)), not the two carve-outs. **Read the WORD, not the code, and do not mistake this row for an unblock.** ➡️ **OWED IN THE DRAIN COMMIT (Goal Registration Law): register a leaf for each master keyed by `taskFile`, and set status + `mergeHash` (40-hex — `goal-tracker.test.mjs:80` asserts the full sha, and a truncated one reddened `test:node-guards` for s1300) as part of the same commit.** 💡 *Reusable shape: the Goal Registration Law is usually broken by a commit that **did** edit `goals.json` — retitling an existing leaf feels like registration and satisfies every eyeball, while the new master is still keyed to nothing.*'

R.splice(anchor + 1, 0, '', f4)
writeFileSync(B, R.join('\n'))
console.log('F-1327-4 filed after F-1327-3 (line ' + (anchor + 1) + ')')
