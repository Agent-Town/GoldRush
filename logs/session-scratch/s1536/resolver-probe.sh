#!/usr/bin/env bash
# s1536 / F-1536-1 probe: does the worktree-resolved lane list beat the hardcoded one?
# Run from the repo root. Preserved per the Retention Law.
set -uo pipefail

lane_branches() {
  git worktree list --porcelain 2>/dev/null | awk '
    /^worktree / { wt = substr($0, 10) }
    /^branch /   { b = substr($0, 8); sub(/^refs\/heads\//, "", b);
                   if (wt ~ /\/worktrees\/lane-[a-z]+$/) print b }
  '
}

echo "=== RESOLVED lane branches (from git worktree list) ==="
lane_branches | sed 's/^/  /'

echo
echo "=== ahead-of-main, resolved set ==="
for b in $(lane_branches); do
  echo "  $b: $(git rev-list --count "main..$b" 2>/dev/null || echo '?')"
done

echo
echo "=== ahead-of-main, the HARDCODED set fire-runner.sh:63 polls ==="
for b in lane/m3 lane/m4 lane/e2-arsenal lane/perf; do
  echo "  $b: $(git rev-list --count "origin/main..$b" 2>/dev/null || echo 1)"
done

echo
echo "=== the guard's own arithmetic, both ways ==="
for set_name in hardcoded resolved; do
  dry=1
  if [ "$set_name" = "hardcoded" ]; then
    list="lane/m3 lane/m4 lane/e2-arsenal lane/perf"
  else
    list=$(lane_branches)
  fi
  for b in $list; do
    [ "$(git rev-list --count "origin/main..$b" 2>/dev/null || echo 1)" != "0" ] && dry=0
  done
  echo "  $set_name -> dry=$dry"
done
