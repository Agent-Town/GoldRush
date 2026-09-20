#!/bin/zsh
# absolute-path runner so cwd drift can never mis-aim a probe
ER=/Users/robin/Claude/Projects/gr-milk-steamworks-rehearsal/logs/session-scratch/er02
cd "$ER" || exit 1
exec node play.mjs "$@"
