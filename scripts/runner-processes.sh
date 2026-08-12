#!/bin/bash

# Bash keeps the script it is executing on fd 255; argv prose opens no such file.
runner_pids() {
  local pid
  ps -axo pid=,comm= | awk '$2 ~ /(^|\/)bash$/ { print $1 }' | while read -r pid; do
    lsof -a -p "$pid" -d 255 -Fn 2>/dev/null | grep -qE '^n(.*/)?lane-runner-v3\.sh$' && echo "$pid"
  done
}
