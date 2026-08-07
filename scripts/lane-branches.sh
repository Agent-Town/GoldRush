# scripts/lane-branches.sh — the ONE answer to "which branches are the lanes on?"
# Sourced, not executed:  . scripts/lane-branches.sh   then   lane_branches
#
# WHY THIS EXISTS (F-1536-1, s1536). Three scripts each carried their OWN hardcoded
# list of lane branch names:
#   scripts/fire-runner.sh:63    lane/m3 lane/m4 lane/e2-arsenal lane/perf
#   scripts/health-watch.sh:68   lane/m3 lane/m4 lane/polish lane/perf lane/m6-r3a-apply
#   scripts/dashboard-gen.sh:280 (the same five, plus three save/* refs)
# The lanes moved to lane/a..lane/d on ~2026-08-03. None of the lists moved with them.
#
# That is worse than merely showing stale names, because of HOW those branches were
# retired: their commits were absorbed into main by PATH-SCOPED merges and never
# fast-forwarded, so `main..lane/m3` reads 5 and `main..lane/m4` reads 7 FOREVER —
# the "SAFE DUPE" shape health-watch.sh's own comment warns about. So every consumer
# asking "is a lane ahead of main?" got a permanent YES about branches no lane is on,
# and NOTHING AT ALL about the four branches the lanes are actually on.
#
# The measured casualty was not cosmetic. fire-runner.sh's DRY-BOARD GUARD (added
# 2026-07-25, owner-prompted: "no-op fires burned the weekly Opus meter") sets dry=0
# whenever any polled branch is ahead. With lane/m3 permanently ahead, dry could never
# be 1 and the skip branch was UNREACHABLE. Measured s1536: last skip 2026-07-31
# 08:16:57; Aug 1-7 = 695 model calls, 0 skips, tasks/.fire-skip-count == 0.
#
# NEVER HARDCODE A LANE BRANCH LIST AGAIN — ask git. A lane rename cannot rot this.
# (Same lesson as F-1464-3, which found scripts/fire.md's PROSE naming the stale
# mapping; the cure reached the prose and lane-usable.mjs and missed these three.)
#
# Prints one branch name per line; prints NOTHING if no lane worktree exists.
# Callers must treat empty as "could not resolve" and fail OPEN — see fire-runner.sh.
# substr() rather than $2 is deliberate: the repo path contains a space ("Gold Rush"),
# which field-splitting silently truncates.
lane_branches() {
  git worktree list --porcelain 2>/dev/null | awk '
    /^worktree / { wt = substr($0, 10) }
    /^branch /   { b = substr($0, 8); sub(/^refs\/heads\//, "", b)
                   if (wt ~ /\/worktrees\/lane-[a-z]+$/) print b }
  '
}
