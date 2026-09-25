#!/bin/bash
# attribute.sh <tag> <battery-row-substring> <reason...>: allow ONE battery row for ONE landing after reading its assertion,
# append the reason to the review body, recompute the verdict with the lib, and append "verdict: clean" to the gates log
# ONLY when the lib says exactly that. Anything else (an e2e red, a guard red, another battery row) is printed and the
# script exits 1, so a blind "verdict: clean" can never be appended again (F-LAND-3, 2026-09-25: an attribution snippet
# appended the clean verdict while the lib was reporting the branch's own e2e red, and a resume was queued on it).
set -u; export PATH=/opt/homebrew/bin:$PATH
TAG=$1; ROW=$2; shift 2; REASON="$*"; R="/Users/robin/Claude/Projects/Gold Rush"; cd "$R" || exit 1
CFG="scripts/attended/landings/$TAG.json"; BODY="scripts/attended/landings/$TAG-review.md"; G="$HOME/.goldrush/land/$TAG-gates.txt"
[ -f "$CFG" ] && [ -f "$BODY" ] && [ -f "$G" ] || { echo "missing config, review body or gates log for $TAG"; exit 2; }
node -e 'const fs=require("fs");const [p,row]=process.argv.slice(1);const c=JSON.parse(fs.readFileSync(p,"utf8"));c.gates.allowedBattery=[...new Set([...(c.gates.allowedBattery||[]),row])];fs.writeFileSync(p,JSON.stringify(c,null,2)+"\n")' "$CFG" "$ROW"
printf '\n### Battery attribution (drain, %s)\nRow "%s" allowed for this landing only: %s\n' "$(date -u '+%H:%MZ')" "$ROW" "$REASON" >> "$BODY"
OUT=$(node scripts/attended/land-lib.cjs verdict "$CFG" "$G" 2>&1 | tail -1)
if [ "$OUT" = "verdict: clean" ]; then
  grep -q '^verdict: clean' "$G" || printf 'RESUME-PREP %s: %s = %s\nverdict: clean\n' "$(date -u '+%H:%MZ')" "$ROW" "$REASON" >> "$G"
  echo "verdict: clean (row allowed; resume with GR_LAND_RESUME=1)"
else
  echo "verdict NOT clean after allowing \"$ROW\": $OUT"; exit 1
fi
