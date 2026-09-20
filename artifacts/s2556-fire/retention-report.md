# s2556 retention read

Visited all **110 registered working trees**, including main and trees inside the repo root. **109 answered** with non-empty tracked-file controls (5,123–31,954 files); **1 could not answer**, `/private/tmp/heat11-5e7a7c0b`, and was handled separately. A closing registry read still listed the same 110 trees.

The pathspec-free untracked read selected **2,150 evidence candidates**. **672** belong to recently written foreign evidence: 39 in `/Users/robin/.codex/worktrees/572c/Gold Rush` (boss art fidelity) and 633 in `/Users/robin/.codex/worktrees/b9fe/Gold Rush` (code-review fixes). Both were deferred to their writers, without reading their contents or touching the trees. Two new `gr-codefix-*` scratch trees hold source/test copies, with no evidence candidates. Review/source paths outside the evidence selector are recorded in the full untracked names and remain writer-owned.

The quiet pass hashed **1,478/1,478 files** against 116,149 objects reachable from remote-tracking refs: **1,470 raw blobs remote-safe, 7 local-only, 1 absent**. All eight exception identities match s2555 exactly by tree, path, blob, size and verdict; no new quiet evidence needs salvage. Six raw trace blobs match existing offsite reconstruction manifests: manifests match origin/main, all **23 parts** exist at expected sizes, and both save-ref tips matched fresh `git ls-remote origin` reads. This verifies existing retained manifests and parts; no reassembly is claimed.

The **274,833,116-byte heat12 full-view stream** remains the recorded local-only size-boundary exception. The **2,203-byte rehearsal index** remains the recorded redundant index. Neither is newly declared offsite-safe, and neither was changed.

The gitless-safe fallback walked the four established evidence prefixes, confirmed a quiet corpus, and hashed **6,775/6,775 files (7,107,705,597 bytes)**; **all 6,775 are reachable from remote refs**. The fallback asserted this is the sole could-not-answer tree before using the known path. No registry cleanup was performed.

Method: read and reused s2552's retained methods, redirecting all outputs to `/tmp/s2556-retention/`. Removed the stale unconditional `gr-gate-s2552` exemption. Added newest-evidence and newest-untracked-file mtimes; the foreign-tree deferral uses the newest untracked write within 15 minutes. The candidate selector retains every `artifacts/`, `reviews/shots-`, `tasks/runs/`, and `logs/runs-archive/` file, plus PNG/WebP/JSONL paths outside `.claude/` and `logs/`. The full untracked census has no pathspec. Ordinary source, vendor and build scratch outside that judgment set are not claimed audited by blob. All selection counts reconcile: 2,150 = 1,478 quiet + 672 deferred.

Only files under `/tmp/s2556-retention/` were written. No refs, branches, lanes, arenas, main tracked files, statistics, logs or STATUS were changed; no tests or batteries were run.
