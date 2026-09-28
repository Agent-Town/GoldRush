#!/bin/bash
# lawfix.sh <tag> <gates-file> — in a chain worktree after its merge commit: re-base fire.md's drifted pointers by their banked excerpts,
# re-bank only when NEW POINTER lines are all that remain, commit path-scoped. Exit 1 leaves the drift for hands. Ported 2026-09-25.
export PATH=/opt/homebrew/bin:$PATH; TAG=$1; G=$2; H=${GR_LAND_HOME:-$HOME/.goldrush/land}; mkdir -p "$H"; D=$(cd "$(dirname "$0")" && pwd)
node scripts/law-pointer-guard.mjs > "$H/$TAG-law0.log" 2>&1 && { echo "law-pointer (pre): rc=0, no re-base needed" >> "$G"; exit 0; }
node "$D/law-rebase.cjs" > "$H/$TAG-lawfix.log" 2>&1 || { echo "law re-base failed — needs hands: $(tail -1 "$H/$TAG-lawfix.log" | cut -c1-160)" >> "$G"; exit 1; }
node scripts/law-pointer-guard.mjs > "$H/$TAG-law1.log" 2>&1; grep -qE 'POINTER DRIFT|DEAD' "$H/$TAG-law1.log" && { echo "law-pointer: drift or dead pointers remain after the re-base — needs hands" >> "$G"; exit 1; }
node scripts/law-pointer-guard.mjs --update > /dev/null 2>&1; node scripts/law-pointer-guard.mjs > "$H/$TAG-law2.log" 2>&1; RC=$?; echo "law-pointer (re-based by banked excerpts and re-banked): rc=$RC $(tail -1 "$H/$TAG-lawfix.log" | cut -c1-160)" >> "$G"; [ "$RC" = "0" ] || exit 1
git add -- scripts/fire.md scripts/law-pointer-baseline.json; git diff --cached --quiet || git commit -q -m "drain: fire.md pointers re-based by their banked excerpts and re-banked ($TAG: the branch grew cited files above the cited lines; the excerpts unchanged, only the lines moved)

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
