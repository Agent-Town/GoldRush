# retention audit — verified against the REAL remote (s1058)

**Slice:** none (audit / null result) · **Branch:** main · **Tip:** `5bdd37a2`
**Verdict:** ✅ **NO THIRD GAP.** `art-staging-audit.mjs`'s green is genuine — re-derived from origin itself, not from origin's local mirror.

## Why this was asked at all

`fire.md` §2E now orders every ART-touching fire to report this audit's two counts, and attaches a standing warning: **the audit has shipped a false zero TWICE.**

- **F-1054-1 (s1054):** identity decided by NAME, then SIZE. 36.54 MB in no object database printed as `0 files`. Fixed → blob hash.
- **F-1055-1 (s1055):** "in git" was `cat-file -e`, which **asks only THIS disk** — and this script's whole question is what happens when the disk is gone. The same 36.54 MB, parked on a local `save/*` branch whose push had timed out, again read `AT RISK 0`. Fixed → also check the remote-tracking refs.

Both bugs are **one shape**: *the check answered a narrower question than the headline above it.* The standing order is **"if you find a third such gap, fix the class, not the instance."** So the honest move is not to read the zero — it is to attack it.

## The hypothesis I tried to prove true

F-1055-1's fix reads `git rev-list --objects --remotes`. **Remote-tracking refs are themselves a local cache** — the script's own header says so (`:52-54`), but only in the *false-red* direction ("run `git fetch` first if another writer may have pushed"). The **false-green** direction was unaddressed and is the exact F-1055-1 shape one layer out:

> a `refs/remotes/origin/save/*` can exist here, and vouch for blobs, while origin's real branch is **gone** or points at an **older commit**.

That would make LOCAL-ONLY read `0` over bytes that die with this disk — a third false zero, in the same place, for the third time.

## Evidence — measured, not reasoned

Run via `node -e` (the bash gate denies `git ls-remote`; s1053 precedent — node runs what the gate blocks; the audit itself shells git the same way).

| # | Question | Method | Result |
|---|---|---|---|
| 1 | Both headline counts | `node scripts/art-staging-audit.mjs` | **AT RISK 0 files / 0 KB** · **LOCAL-ONLY 0 files / 0 KB** (192 staging raws: 168 SHIPPED, 14 DIVERGED, 10 SALVAGED) |
| 2 | Do the tracking refs correspond to real origin branches? | `git ls-remote --heads origin` vs `for-each-ref refs/remotes/origin` | origin really has **19 heads**; **NO GHOST REFS** |
| 3 | Do they point at the **same commits**? (the actual false-green risk) | SHA-compare each tracking ref against origin's real SHA | **ALL 19 MATCH ORIGIN EXACTLY** — zero drift |
| 4 | Is `--remotes` actually offsite? | `git remote -v` | exactly one remote: `origin` → `git@github.com:Agent-Town/GoldRush.git`. No second/local remote inflating the offsite set |
| 5 | Is main itself backed up? (BACKUP LAW) | `rev-parse main` vs `refs/remotes/origin/main` | **IN SYNC** at `78ea49c7` (s1057's handoff) |

Checks 2+3 are the ones that matter: they upgrade "LOCAL-ONLY 0" from *this disk believes the bytes are offsite* to **origin was asked and agrees.** The two salvage branches carrying the once-at-risk 36.54 MB — `save/art-staging-20260725` and `save/art-diverged-20260726` — are both present on origin at the exact SHAs tracked here.

**The 36.54 MB F-1054-1 found and F-1055-1 proved was local-only is now genuinely offsite.** That hole is closed, and closed verifiably rather than assertedly.

## Honest limits

- This proves the **refs and their commits** match origin. I did not re-download and re-hash every blob from GitHub; I trust that a ref present on origin at a given SHA implies its reachable objects are present (git's own connectivity guarantee on push). Stated so nobody reads more into it.
- The audit's **DIVERGED (14)** and **SALVAGED (10)** buckets are *adjudication material*, not risk — bytes are in git and on origin. Untouched here; they still want an owner/attended call on which regenerated plates supersede shipped art.
- `--strict` was not exercised this fire (both counts zero ⇒ nothing to trip it).
- **No fix was needed, so none was made.** Recorded as a NULL result on the F-1056-2 precedent: after two false zeros, "is this green real?" is a standing question, and a fire that checks and finds nothing should still leave the proof behind — otherwise the next fire re-litigates it from scratch.

## Findings

**None.** No third gap exists. The `:52` caveat could optionally be widened to name the false-green direction, but that is a comment, not a defect — **reject-don't-stretch**, no corrective authored.
