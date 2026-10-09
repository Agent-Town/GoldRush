#!/bin/bash

# Bash keeps the script it is executing on fd 255; argv prose opens no such file.
runner_pids() {
  local pid
  ps -axo pid=,comm= | awk '$2 ~ /(^|\/)bash$/ { print $1 }' | while read -r pid; do
    lsof -a -p "$pid" -d 255 -Fn 2>/dev/null | grep -qE '^n(.*/)?lane-runner-v3\.sh$' && echo "$pid"
  done
}

# F-2137-1: how many commits to the runner script postdate the running process?
# A live runner executes the parse it loaded at exec time (bash parses a `while` body whole
# before running it), so every later commit to that file is INERT until someone restarts.
# READING the file is therefore not a measurement of what is RUNNING — s2136 simulated the
# F-2089-1 opt-in against the file, dispatched, and the process refused f2136-1 64 times in
# 12 min having never contained the cure. Echoes a count; 0 means current OR unknowable.
# Lives HERE because start-lane-runner.sh and health-watch.sh both source this file and must
# not answer the same question with two implementations (the sibling-script hazard).
# Usage: runner_inert_commits <pid> <repo-root> <runner-script-path>
runner_inert_commits() {
  local pid="$1" root="$2" script="$3" lstart start_epoch commit_epoch
  command -v git >/dev/null 2>&1 || { echo 0; return 0; }
  [ -n "$pid" ] && [ -n "$root" ] && [ -n "$script" ] || { echo 0; return 0; }
  lstart=$(ps -o lstart= -p "$pid" 2>/dev/null | tr -s ' ' | sed 's/^ *//;s/ *$//')
  [ -n "$lstart" ] || { echo 0; return 0; }
  start_epoch=$(date -j -f "%a %b %e %H:%M:%S %Y" "$lstart" +%s 2>/dev/null) || { echo 0; return 0; }
  [ -n "$start_epoch" ] || { echo 0; return 0; }
  commit_epoch=$(git -C "$root" log -1 --format=%ct -- "$script" 2>/dev/null) || { echo 0; return 0; }
  [ -n "$commit_epoch" ] || { echo 0; return 0; }
  [ "$commit_epoch" -gt "$start_epoch" ] || { echo 0; return 0; }
  git -C "$root" log --format=%h --since="@$start_epoch" -- "$script" 2>/dev/null | wc -l | tr -d ' '
}

# The process start time as ps reports it, for messages that want to name it. Empty if unknown.
runner_started_at() {
  ps -o lstart= -p "$1" 2>/dev/null | tr -s ' ' | sed 's/^ *//;s/ *$//'
}
