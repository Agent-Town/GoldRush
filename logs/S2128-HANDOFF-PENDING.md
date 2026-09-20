# s2128 handoff is UNCOMMITTED on main — commit it (fire protocol §2A)

STATUS.md in the working tree carries the full s2128 handoff as DIRT. It could not be committed:
a concurrent writer held an in-progress merge (.git/MERGE_HEAD — the owner-ruled
"e7-relay-rush ADMITTED" merge, open 30+ minutes). During a merge git REFUSES a pathspec commit,
and concluding someone else's merge is exactly the defect this fire filed as F-2128-1.

DO THIS FIRST, once .git/MERGE_HEAD is gone:
  git commit -m "s2128 handoff: <summary>" -- STATUS.md

BACKUP COPY, if the dirt was lost to a sweep or a checkout:
  git show save/s2128-handoff:STATUS.md > STATUS.md     # branch e928632dc

Delete this file once the handoff is committed.

---

## s2129 addendum (2026-08-21T14:12Z) — STILL BLOCKED, BY A **DIFFERENT** MERGE. DO NOT ASSUME THE e7 BLOCKER IS THE ONE YOU FACE.

s2129 took NO lock and wrote NO commit: every write path was closed. Verified, not inherited:

- `.git/MERGE_HEAD` is **present again**, stamped 14:05 — and it is **NOT** the e7-relay-rush merge
  s2128 named. That one CONCLUDED at `45c3e3443` (14:02:57). The live one is
  **`f0a29f5bc`** — "feat: E2 pressure line — review re-derived on the merged tree", authored by
  **Claude (Cowork orchestrator)** at 14:04:13. A second Cowork drain opened ~2 min after the first closed.
- The writer is **LIVE, not abandoned debris**: pid 62641 is a shell whose command ends in
  `git commit … && git push origin main`, and `.git/index` was rewritten at 14:08 (2.7 MB —
  the ~200 staged `artifacts/e2-pressure-line/**` paths).
- ✅ **THE DIRT IS SAFE — BACKUP VERIFIED BY READING IT, not by trusting the line above:**
  `git show save/s2128-handoff:STATUS.md | head -1` returns the s2128 handoff line-1 verbatim
  (`…s2128 handoff, lock CLEARED — **THE BOARD WAS DRY OF DRAINS…`). Branch e928632dc. Nothing can be lost.

⚠️ **THE REUSABLE HALF, and it is why this addendum exists rather than a silent re-try:** the instruction
above reads "once `.git/MERGE_HEAD` is gone", which invites a fire to check the file's ABSENCE once,
find it present, and conclude *"still the same 30-minute e7 merge, just wait."* **That premise is now false.**
`MERGE_HEAD` is a single-slot file that says nothing about WHICH merge it holds, so a
recurring blocker and a persistent one are indistinguishable by absence alone — Mistake #4 with a
one-byte surface. **Resolve it every time:** `git log -1 --format='%h %cI %an | %s' MERGE_HEAD`.
Two Cowork drains have now landed back-to-back on this main, so expect a THIRD rather than a clear window.

➡️ **NEXT FIRE: re-run that one command first.** If it names a merge, stand off again — do not
"just commit STATUS.md", because git refuses a pathspec commit mid-merge and a plain `git commit`
concludes someone else's merge under your headline (F-2128-1, committed twice by s2128).
If it is genuinely gone, s2128's recipe at the top of this file is correct and unchanged.
