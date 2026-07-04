#!/bin/bash
# batch-004: maps the 5 NEWEST "ChatGPT Image*.png" in ~/Downloads to the five
# animation sheets, by download order (oldest of the five = first downloaded):
#   1 hero-front, 2 hero-back, 3 hero-side-actions, 4 jumper-front, 5 jumper-back
# Run:  bash "/Users/robin/Claude/Projects/Gold Rush/scripts/move-batch-004-downloads.sh"
set -u
DL="$HOME/Downloads"
RAW="$(cd "$(dirname "$0")/.." && pwd)/assets/raw"
mkdir -p "$RAW"
targets="char-hero-sheet-front.png char-hero-sheet-back.png char-hero-sheet-side-actions.png char-jumper-sheet-front.png char-jumper-sheet-back.png"
count=$(ls -t "$DL"/ChatGPT\ Image*.png 2>/dev/null | head -5 | wc -l | tr -d ' ')
if [ "$count" -lt 5 ]; then echo "Expected 5 ChatGPT Image files in ~/Downloads, found $count — aborting."; exit 1; fi
i=1
ls -t "$DL"/ChatGPT\ Image*.png | head -5 | tail -r | while IFS= read -r f; do
  t=$(echo "$targets" | cut -d' ' -f$i)
  mv "$f" "$RAW/$t" && echo "OK  $t  <-  $(basename "$f")"
  i=$((i+1))
done
echo "---"
ls -la "$RAW" | grep sheet
echo "Five distinct file sizes above = healthy. Identical sizes = tell Claude."
