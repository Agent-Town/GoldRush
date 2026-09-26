#!/bin/bash
# river-assay-1 environment control: the three env-bound node-guards reds, on base and tip, each in its own TMPDIR.
set -u
arm="$1"; tree="$2"; out="$3"
cd "$tree" || exit 9
for t in desk-declaration-guard ledger-backup-pull ledger-mirror-freshness-guard; do
  tmp="$out/tmp-$arm-$t"; rm -rf "$tmp"; mkdir -p "$tmp"
  TMPDIR="$tmp" node --test --test-reporter=spec "scripts/$t.test.mjs" > "$out/$arm-$t.log" 2>&1
  echo "rc=$?" >> "$out/$arm-$t.log"
  echo "survivors: $(ls "$tmp" | grep -E '^(s2672-dest-|s2351-lmf-|desk-guard-|desk guard with spaces-)' | sed -E 's/-[A-Za-z0-9]{6}$/-*/' | sort | uniq -c | tr '\n' ' ')" >> "$out/$arm-$t.log"
done
