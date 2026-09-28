#!/bin/bash
export PATH=/opt/homebrew/bin:$PATH
cd '/Users/robin/Claude/Projects/Gold Rush/worktrees/lane-a/artifacts/gr-campaign-fixture-cleanup-1/control-arena' || exit 2
export CAMPAIGN_SWEEP_CAPTURE="$PWD/../control-corrected-children.jsonl"
printf 'COMMAND: /opt/homebrew/bin/node --require ../capture-sweep.cjs --test --test-reporter=spec scripts/fixture-teardown.test.mjs\n' > ../control-corrected-result.txt
/opt/homebrew/bin/node -p 'process.execPath + " " + process.version' >> ../control-corrected-result.txt
date -u >> ../control-corrected-result.txt
/opt/homebrew/bin/node --require ../capture-sweep.cjs --test --test-reporter=spec scripts/fixture-teardown.test.mjs > ../control-corrected-sweep.txt 2>&1
result=$?
printf 'EXIT=%s\n' "$result" >> ../control-corrected-result.txt
date -u >> ../control-corrected-result.txt
exit "$result"
