#!/bin/bash
# v2 — ChatGPT downloads are timestamp-named ("ChatGPT Image Jul 4, 2026, 08_11_25 AM.png"),
# not title-named. Mapping derived from generation/download order + Finder thumbnails
# (see assets/requests/batch-003.md log). Run on Robin's Mac:
#   bash "/Users/robin/Claude/Projects/Gold Rush/scripts/move-art-downloads.sh"
set -u
DL="$HOME/Downloads"
RAW="$(cd "$(dirname "$0")/.." && pwd)/assets/raw"
mkdir -p "$RAW"
move_ts() { # move_ts <HH_MM_SS fragment> <target>
  local f
  f=$(ls -t "$DL"/ChatGPT\ Image*"$1"*.png 2>/dev/null | head -1)
  if [ -n "${f:-}" ]; then mv "$f" "$RAW/$2" && echo "OK       $2  <-  $(basename "$f")"
  else echo "MISSING  $2  (no ChatGPT Image *$1*.png)"; fi
}
move_ts 08_11_25 icon-range.png            # diagonal brass rod
move_ts 08_11_29 icon-firerate.png         # twin coils
move_ts 08_17_24 icon-mobility.png         # spring boot
move_ts 08_17_41 icon-plating.png          # breastplate
move_ts 08_18_30 icon-volley.png           # Y-fork
move_ts 08_31_00 char-hero-sheet-side.png  # 2x2 magenta hero
move_ts 08_33_39 char-jumper-sheet-side.png# 2x2 magenta bandit
move_ts 08_35_07 terrain-bank-tile-c.png   # sage-tuft accent tile
move_ts 08_36_49 terrain-bank-tile-b.png   # plain filler tile
# icon-damage (lightning bolt) was re-downloaded LAST (after 08:36) — newest remaining ChatGPT file:
BOLT=$(ls -t "$DL"/ChatGPT\ Image*.png 2>/dev/null | grep -v 08_11_34 | head -1)
if [ -n "${BOLT:-}" ]; then mv "$BOLT" "$RAW/icon-damage.png" && echo "OK       icon-damage.png  <-  $(basename "$BOLT")"
else echo "MISSING  icon-damage.png"; fi
echo "---"
echo "Leftover 08_11_34 (duplicate coils download) can be deleted from ~/Downloads."
ls -la "$RAW"
