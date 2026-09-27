#!/bin/bash
export PATH=/opt/homebrew/bin:$PATH
cd '/Users/robin/Claude/Projects/Gold Rush/worktrees/lane-a/artifacts/gr-campaign-fixture-cleanup-1/control-arena' || exit 2
export CAMPAIGN_SWEEP_CAPTURE="$PWD/../control-children.jsonl"
printf 'COMMAND: /opt/homebrew/bin/node --require ../capture-sweep.cjs --test --test-reporter=spec scripts/fixture-teardown.test.mjs\n' > ../control-result.txt
/opt/homebrew/bin/node -p 'process.execPath + " " + process.version' >> ../control-result.txt
date -u >> ../control-result.txt
/opt/homebrew/bin/node --require ../capture-sweep.cjs --test --test-reporter=spec scripts/fixture-teardown.test.mjs > ../control-sweep.txt 2>&1
result=$?
printf 'EXIT=%s\n' "$result" >> ../control-result.txt
date -u >> ../control-result.txt
exit "$result"
