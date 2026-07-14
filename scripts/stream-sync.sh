#!/usr/bin/env bash
set -euo pipefail

ROOT=${GOLD_RUSH_ROOT:-"$(cd "$(dirname "$0")/.." && pwd)"}
MANIFEST=${STREAM_MANIFEST:-"$ROOT/assets/stream/loop-manifest.json"}
LOOP_DIR=${STREAM_LOOP_DIR:-"$HOME/GoldRushStream/loop"}

case "$LOOP_DIR" in ""|/) echo "Refusing unsafe loop directory: $LOOP_DIR" >&2; exit 1;; esac
command -v jq >/dev/null || { echo "jq is required" >&2; exit 1; }
command -v ffmpeg >/dev/null || { echo "ffmpeg is required" >&2; exit 1; }
ffmpeg -version >/dev/null 2>&1 || { echo "ffmpeg is installed but cannot run" >&2; exit 1; }
jq -e '
  .version == 1 and
  (.entries | type == "array" and length > 0) and
  all(.entries[];
    (.file | type == "string" and length > 0) and
    (.title | type == "string" and length > 0) and
    (.class | IN("finished-game-footage", "era-art-card", "era-art-reel", "ceremony-recording", "sonilo-audio")) and
    .approvedBy == "class-delegation-2026-07-12"
  )
' "$MANIFEST" >/dev/null
mkdir -p "$LOOP_DIR"

declare -a wanted=()
index=0
while IFS=$'\t' read -r file duration; do
  index=$((index + 1))
  case "$file" in /*|*../*|../*|*/..|..) echo "Unsafe manifest path: $file" >&2; exit 1;; esac
  source="$ROOT/$file"
  [ -f "$source" ] || { echo "Missing manifest file: $file" >&2; exit 1; }
  base=${file##*/}; stem=${base%.*}; ext=${base##*.}
  printf -v prefix '%03d' "$index"
  output="$LOOP_DIR/$prefix-$stem.mp4"
  wanted+=("${output##*/}")
  if [ "$ext" = mp4 ]; then
    [ -e "$output" ] && [ "$output" -nt "$source" ] || cp -f "$source" "$output"
  elif [ "$ext" = webm ]; then
    [ -e "$output" ] && [ "$output" -nt "$source" ] || ffmpeg -nostdin -loglevel error -y -i "$source" -c:v libx264 -pix_fmt yuv420p -movflags +faststart -c:a aac "$output"
  else
    duration=${duration:-5}
    [ -e "$output" ] && [ "$output" -nt "$source" ] || ffmpeg -nostdin -loglevel error -y -loop 1 -i "$source" -t "$duration" -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" -r 30 -c:v libx264 -pix_fmt yuv420p -movflags +faststart "$output"
  fi
done < <(jq -r '.entries[] | [.file, (.duration // "")] | @tsv' "$MANIFEST")

for output in "$LOOP_DIR"/*; do
  [ -f "$output" ] || continue
  name=${output##*/}; keep=0
  for expected in "${wanted[@]}"; do [ "$name" = "$expected" ] && keep=1 && break; done
  [ "$keep" -eq 1 ] || rm -f -- "$output"
done

printf 'Synced %d entries to %s\n' "${#wanted[@]}" "$LOOP_DIR"
