#!/bin/bash
# SECURE-PATH SANITY — public-verb secure replays on maps this prototype cannot touch.
# e7-dead-band is Signal-epoch: WrangleSystem is disabled there, so the pool's holder is
# seated NULL and the reclaim branch is unreachable by construction. If these hashes hold,
# the secure path is untouched off E6.
#
# Usage: bash artifacts/proto-pool-recycle/run-secure-replays.sh
set -u
export PATH="$HOME/.nvm/versions/node/v26.4.0/bin:$PATH"
cd "$(dirname "$0")/../.." || exit 1
OUT="artifacts/proto-pool-recycle/secure-replays.jsonl"
: > "$OUT"
for seed in e7-dead-band-01 e7-dead-band-02 ; do
  echo "--- prover $seed" >&2
  node artifacts/e7-dead-band/prover.mjs --seed "$seed" --quiet 2>/dev/null | tail -1 \
    | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{try{const o=JSON.parse(d.trim());console.log(JSON.stringify({seed:'$seed',...o}));}catch(e){console.log(JSON.stringify({seed:'$seed',error:String(e)}));}})" >> "$OUT"
done
cat "$OUT"
