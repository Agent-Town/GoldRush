#!/bin/bash
export PATH=/opt/homebrew/bin:$PATH
node artifacts/gr-campaign-fixture-cleanup-1/browser-gates.mjs > artifacts/gr-campaign-fixture-cleanup-1/browser-driver.txt 2>&1
browser_exit=$?
printf 'BROWSER_EXIT=%s\n' "$browser_exit" > artifacts/gr-campaign-fixture-cleanup-1/remaining-gates-result.txt
node scripts/gate-battery.mjs --transcript artifacts/gr-campaign-fixture-cleanup-1/full-node.txt '[["complete npm run test:node-guards","npm","run","test:node-guards"]]' > artifacts/gr-campaign-fixture-cleanup-1/full-node-driver.txt 2>&1
node_exit=$?
printf 'NODE_EXIT=%s\n' "$node_exit" >> artifacts/gr-campaign-fixture-cleanup-1/remaining-gates-result.txt
if [ "$browser_exit" -ne 0 ] || [ "$node_exit" -ne 0 ]; then exit 1; fi
