#!/usr/bin/env bash
# F-ASTRA-6 census pipeline: validate opaque culling before recording a browser arm.
# Requires the authorized external Vite server (default http://127.0.0.1:5301).
set -euo pipefail
cd "$(dirname "$0")/.."
node --test --test-concurrency=1 scripts/f-astra-6-census.test.mjs
exec node scripts/f-astra-6-census.mjs "$@"
