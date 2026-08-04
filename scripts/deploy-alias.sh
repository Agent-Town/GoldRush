#!/usr/bin/env bash
# Gold Rush — deploy a RELEASE build to a Pages branch alias (e1-preview | goldrush-base).
# Exists because of F-FRESHINK-1 (2026-08-04): a hand-run alias deploy built WITHOUT
# CF_PAGES_COMMIT_SHA, baking __APP_BUILD__='dev' into the bundle while version.json said
# the real sha — BuildFreshness.ts then showed a refresh-proof "Fresh ink" toast forever
# ('dev' !== sha on every check). The build id and version.json MUST come from one variable.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

ALIAS="${1:-}"
case "$ALIAS" in
  e1-preview) GR_BASE_VALUE="" ;;
  goldrush-base) GR_BASE_VALUE="/goldrush/" ;;
  *) echo "usage: deploy-alias.sh <e1-preview|goldrush-base>"; exit 2 ;;
esac

BUILD_ID="$(git rev-parse --short=8 HEAD)"
echo "[deploy-alias] building GR_RELEASE=e1 ${GR_BASE_VALUE:+GR_BASE=$GR_BASE_VALUE }build $BUILD_ID for alias $ALIAS"
if [ -n "$GR_BASE_VALUE" ]; then
  CF_PAGES_COMMIT_SHA="$BUILD_ID" GR_RELEASE=e1 GR_BASE="$GR_BASE_VALUE" npm run build:release
else
  CF_PAGES_COMMIT_SHA="$BUILD_ID" GR_RELEASE=e1 npm run build:release
fi
printf '{"build":"%s","builtAt":"%s"}\n' "$BUILD_ID" "$(date -u '+%Y-%m-%dT%H:%M:%SZ')" > dist/version.json

set -a; [ -f .env.local ] && . ./.env.local; set +a
[ -n "${CLOUDFLARE_API_TOKEN:-}" ] || { echo "[deploy-alias] CLOUDFLARE_API_TOKEN missing from .env.local"; exit 3; }
npx wrangler pages deploy dist --project-name gold-rush --branch "$ALIAS" --commit-dirty=true
echo "[deploy-alias] $ALIAS deployed at build $BUILD_ID — verify: the origin's /version.json must match the bundle's __APP_BUILD__ (no Fresh-ink toast on a fresh load)."
