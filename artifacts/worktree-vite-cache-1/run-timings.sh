#!/bin/bash
# run-timings.sh <before|after> (worktree-vite-cache-1): three cold and three warm boots of THIS worktree's
# dev server on port 5326, interleaved cold/warm so every warm boot follows the cold boot that filled the cache.
#   before: the tree without the cure. A cold boot is `vite --force` (vite itself clears its deps cache and
#           rescans, which is exactly what a boot meets after another checkout wrote the SHARED cache; the
#           shared cache is never moved or deleted by hand). A warm boot is the next plain boot.
#   after:  the tree with the cure. A cold boot is a FRESH checkout: this worktree's own `.vite-cache` is moved
#           aside into the session scratchpad first (never deleted). A warm boot is the next plain boot.
# Each boot is one `boot-probe.mjs timing` run (numbers in <phase>/<label>.json, the server log beside it).
set -u
export PATH=/opt/homebrew/bin:$PATH
PHASE=${1:?before|after}
WT=/Users/robin/Claude/Projects/wt-wvc1
E="$WT/artifacts/worktree-vite-cache-1/$PHASE"
ASIDE=${WVC1_ASIDE:?WVC1_ASIDE must name a scratch directory for caches moved aside}
cd "$WT" || exit 1
for i in 1 2 3; do
  if [ "$PHASE" = before ]; then
    node artifacts/worktree-vite-cache-1/boot-probe.mjs timing "before-cold-$i" "$WT" 5326 "$E" --force
  else
    if [ -e "$WT/.vite-cache" ]; then mkdir -p "$ASIDE"; mv "$WT/.vite-cache" "$ASIDE/vite-cache-before-after-cold-$i"; fi
    node artifacts/worktree-vite-cache-1/boot-probe.mjs timing "after-cold-$i" "$WT" 5326 "$E"
  fi
  node artifacts/worktree-vite-cache-1/boot-probe.mjs timing "$PHASE-warm-$i" "$WT" 5326 "$E"
done
