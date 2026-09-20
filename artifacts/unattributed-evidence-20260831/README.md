# Unattributed evidence salvaged from `undefined/` — 2026-08-31 (s2398)

## What this is
Two evidence screenshots were written on 2026-08-31T00:36–00:37Z into a literal
`undefined/` directory, by an ad-hoc command whose output path was interpolated
from an unset variable. No tracked file in the repo names them (re-verified
s2398: `grep -rln` over `scripts e2e tasks reviews docs .claude marketing`
returns only `scripts/fire.md`, which is F-2389-1's own clause, and one lane run
log, whose hits are all embedded STATUS.md handoff archives). **They have no
owner and no owning review.**

They were found and reported by s2389 (F-2389-1) and re-reported untouched by
s2390, s2392 and s2397. This directory preserves the bytes that were genuinely
at risk, under the RETENTION LAW (`CLAUDE.md` §4.10b) and Mistake #11.

## The correction — the inherited report was wrong about WHICH file was at risk

Every prior report described **both** files as "untracked, non-ignored, **in no
object database**". Measured s2398 by `git hash-object` + `git cat-file -e`, that
is true of only one of them:

| file | size (B) | blob | in object DB? |
|---|---|---|---|
| `undefined/prod-boot.png` | 1,755,040 | `7f7f134cdb57…` | **YES** |
| `undefined/post-profile.png` | 692,911 | `d7e473da5efa…` | **NO** |

`prod-boot.png` is **byte-identical to the tracked
`reviews/shots-rf-34/plain-boot-desktop.png`** (located by scanning
`git rev-list --all --objects`, 99,024 objects). A deterministic boot produces
identical bytes, so that file's content has been safe in git all along and
copying it here would add 1.75 MB of duplicate object for nothing.

So the at-risk figure was **692,911 B, not 2,447,951 B** — the standing report
over-counted by 71.7% for four consecutive fires. Only `post-profile.png` is
preserved here.

## What was preserved
- `post-profile.png` — 692,911 B, blob `d7e473da5efa3b0cb78e0001207f63fec5db14e9`,
  verified byte-identical to the source before commit.

Content, verified by reading the image before committing it (no secrets, no
account data): the Town Square with the FOUNDING LEDGER naming prompt ("What
will you call this place?"), an Assay Clerk toast ("The ledger gains a page: The
Claim"), and a `the town is raising… 24/30` progress readout.

## What was NOT done, and why
- **`undefined/` was NOT deleted or emptied.** `rm` prompts by design; the
  RETENTION LAW forbids deleting untracked history; and `undefined/` is the live
  evidence of the F-2389-1 defect, which s2389 deliberately kept in place. This
  is an additive **copy**, so nothing an attended session may still be holding
  was moved out from under it.
- **`prod-boot.png` was NOT copied.** Its bytes are already in git (see above).

## Veto window
Reversible with one word: this is an additive commit of one PNG plus this note.
Delete the directory if the evidence is unwanted — the source files in
`undefined/` are untouched either way.
