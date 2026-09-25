#!/bin/bash
# preview-redeploy.sh --yes — redeploy the ALL-EPOCHS preview (a Cloudflare Pages BRANCH deployment aliased all-epochs.gold-rush-3in.pages.dev,
# never production): sync the repo's main tree into a git-less copy, run the FULL build (no GR_RELEASE=e1), deploy dist with --branch=all-epochs.
# Rebuilt 2026-09-25 from the previous helper's logs after that helper vanished with its session scratchpad (handover 13z-21); the first run
# after the rebuild must be watched. Refuses without --yes. Sources .env.local for the wrangler token, never prints it.
export PATH=/opt/homebrew/bin:$PATH; [ "$1" = "--yes" ] || { echo "preview-redeploy: refused without --yes (it publishes a branch deployment)"; exit 2; }
R="${GR_REPO:-/Users/robin/Claude/Projects/Gold Rush}"; HOMEDIR="${GR_LAND_HOME:-$HOME/.goldrush/land}"; P="$HOMEDIR/wt-preview-pub"; mkdir -p "$P"
cd "$R" || exit 1; rsync -a --delete --exclude .git --exclude node_modules --exclude dist --exclude .env.local ./ "$P/" || exit 1
ln -sfn "$R/node_modules" "$P/node_modules"; cd "$P" || exit 1
npm run build > "$HOMEDIR/preview-build.log" 2>&1 || { echo "preview build failed (see $HOMEDIR/preview-build.log)"; exit 1; }
set -a; . "$R/.env.local"; set +a; wrangler pages deploy dist --branch=all-epochs --commit-dirty=true > "$HOMEDIR/preview-deploy.log" 2>&1; RC=$?
echo "PREVIEW rc=$RC $(grep -oE 'https://[a-z0-9.-]+\.pages\.dev' "$HOMEDIR/preview-deploy.log" | tail -1)"; [ "$RC" = 0 ] && echo "PREVIEW-DONE"
