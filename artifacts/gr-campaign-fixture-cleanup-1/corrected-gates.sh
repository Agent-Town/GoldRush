#!/bin/bash
export PATH=/opt/homebrew/bin:$PATH
node artifacts/gr-campaign-fixture-cleanup-1/plain-recheck.mjs > artifacts/gr-campaign-fixture-cleanup-1/plain-recheck-driver.txt 2>&1
plain_exit=$?
printf 'PLAIN_EXIT=%s\n' "$plain_exit" > artifacts/gr-campaign-fixture-cleanup-1/corrected-gates-result.txt
bash artifacts/gr-campaign-fixture-cleanup-1/control-corrected.sh
control_exit=$?
printf 'CONTROL_EXIT=%s\n' "$control_exit" >> artifacts/gr-campaign-fixture-cleanup-1/corrected-gates-result.txt
if [ "$plain_exit" -ne 0 ] || [ "$control_exit" -ne 0 ]; then exit 1; fi
