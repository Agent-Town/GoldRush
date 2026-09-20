#!/bin/bash
# F-1425-2: every citation key in the f1453-1 master must grep to exactly 1 in the tree under test.
# Run from the repo root of whatever tree you are checking (main, then the refreshed lane).
cd "$(dirname "$0")/../.." || exit 2
fail=0
check() {
  n=$(grep -cF "$2" "$1")
  printf '%-28s %s  %s\n' "$n" "$1" "$(printf '%.62s' "$2")"
  [ "$n" = "1" ] || fail=1
}
check src/entities/Enemy.ts "let cachedCrossingData: {"
check src/entities/Enemy.ts "  if (cachedCrossingData) return cachedCrossingData;"
check src/entities/Enemy.ts "    const targetSlideX = this.blockerSlideDirection('x', moveTarget);"
check src/entities/Enemy.ts "    const targetSlideZ = this.blockerSlideDirection('z', moveTarget);"
check src/entities/Enemy.ts "    speed: Terrain.sample(fords[0]?.centerX ?? 0, (Terrain.RIVER_MIN_Z + Terrain.RIVER_MAX_Z) / 2).speedMul,"
check src/entities/Enemy.ts "  const crossings = fords.length > 0 ? fords : crossingData().crossings;"
check src/world/Terrain.ts "  if (!ACTIVE_CONTRACT.tileParams.ford) return [];"
echo "---"
[ "$fail" = "0" ] && echo "ALL KEYS =1 (rc0)" || echo "KEY MISMATCH (rc1)"
exit $fail
