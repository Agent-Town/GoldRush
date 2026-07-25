#!/usr/bin/env bash
# Contract test for scripts/deploy-site.sh — the deploy-honesty invariants (F-1049-1 / F-1057-1).
#
# WHY THIS EXISTS (F-1059-1, s1059): the false-green class was cured in BOTH of this repo's
# wrangler-deploying scripts — deploy.sh (s1049 -> s1050 -> s1053) and deploy-site.sh (s1057) — but
# GUARDED in only one. scripts/test-deploy-contract.sh copies and runs deploy.sh alone (its :7/:71),
# so deploy-site.sh's cure rested on a single hand-run mutation control that s1057 performed once and
# no one could repeat. A cure nothing watches is a cure with a clock on it: that is exactly how the
# class survived in deploy-site.sh for eight fires after deploy.sh was fixed.
#
# THE INVARIANT UNDER TEST, in one line: this script may only say "DEPLOYED ok" about a URL that
# THIS run's wrangler invocation printed. Not an exit code, not a friendly placeholder, not a URL
# left in the cumulative log by an earlier run, and not the banner URL that `pages project create`
# prints for a project it merely reserved.
#
# Usage: bash scripts/test-deploy-site-contract.sh [script-under-test]
#   The optional path runs the suite against ANOTHER copy of the script — which is how you prove the
#   suite has teeth rather than assuming it. Mutation control (must FAIL; that is the pass condition):
#     git show d9897a26:scripts/deploy-site.sh > /tmp/prefix-deploy-site.sh
#     bash scripts/test-deploy-site-contract.sh /tmp/prefix-deploy-site.sh
#
# No network is possible: wrangler is stubbed onto PATH, so no upload can occur and no real Pages
# project is touched. Assertions are on LOG CONTENT, never exit codes — deploy-site.sh deliberately
# exits 0 on every path (it must never block a fire), so its exit code carries no honesty signal.
set -eu

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
UNDER_TEST="${1:-$ROOT/scripts/deploy-site.sh}"
[ -f "$UNDER_TEST" ] || { echo "script under test not found: $UNDER_TEST" >&2; exit 1; }

TMP="$(mktemp -d "${TMPDIR:-/tmp}/gold-rush-deploy-site-test.XXXXXX")"
trap 'rm -rf "$TMP"' EXIT
mkdir -p "$TMP/repo/scripts" "$TMP/repo/logs" "$TMP/repo/site" "$TMP/bin" "$TMP/emptybin"
cp "$UNDER_TEST" "$TMP/repo/scripts/deploy-site.sh"
chmod +x "$TMP/repo/scripts/deploy-site.sh"
printf '<!doctype html><title>agent town</title>\n' > "$TMP/repo/site/index.html"

STUB_URL='https://s1059-stub.pages.dev'
BANNER_URL='https://banner-never-deployed.pages.dev'
EARLIER_URL='https://s1059-earlier-run.pages.dev'

cat > "$TMP/bin/wrangler" <<STUB
#!/usr/bin/env bash
echo "wrangler \$*" >> "\$STUB_CALLS"
if [ "\${2:-}" = project ]; then
  # A real \`pages project create\` prints a pages.dev banner for a project it has merely
  # RESERVED — nothing is published yet. It must never be reported as a deployed URL.
  echo "Successfully created the 'agenttown' project. It will be available at $BANNER_URL"
  exit "\${STUB_CREATE_RC:-0}"
fi
if [ "\${STUB_DEPLOY_RC:-0}" -eq 0 ]; then
  echo 'Uploading... (12/12)'
  [ "\${STUB_DEPLOY_URL:-yes}" = yes ] && echo 'Deployment complete! Take a peek over at $STUB_URL'
else
  echo 'A request to the Cloudflare API failed.'
fi
exit "\${STUB_DEPLOY_RC:-0}"
STUB
chmod +x "$TMP/bin/wrangler"

LOG="$TMP/repo/logs/deploy-site.log"
FAILURES=0

fail() { echo "FAIL $1: $2" >&2; FAILURES=$((FAILURES + 1)); }

count_in_log() {
  if [ -f "$LOG" ]; then grep -c "$1" "$LOG" 2>/dev/null || true; else echo 0; fi
}

# run_case <name> <deploy_rc> <deploy_url:yes|no> <create_rc> <seed_log_line> <expect>
#   expect = "failed" | "deployed:<url>"
run_case() {
  local name="$1" deploy_rc="$2" deploy_url="$3" create_rc="$4" seed="$5" expect="$6"
  rm -f "$LOG" "$TMP/calls"
  if [ -n "$seed" ]; then printf '%s\n' "$seed" > "$LOG"; fi
  PATH="$TMP/bin:$PATH" STUB_CALLS="$TMP/calls" \
    STUB_DEPLOY_RC="$deploy_rc" STUB_DEPLOY_URL="$deploy_url" STUB_CREATE_RC="$create_rc" \
    CLOUDFLARE_API_TOKEN=fake-test-token \
    bash "$TMP/repo/scripts/deploy-site.sh" >/dev/null 2>&1 || true

  local ok_count failed_count
  ok_count="$(count_in_log 'DEPLOYED ok')"
  failed_count="$(count_in_log 'FAILED: pages deploy')"

  case "$expect" in
    failed)
      [ "$ok_count" -eq 0 ] || fail "$name" "claimed 'DEPLOYED ok' for a run that published nothing"
      [ "$failed_count" -ge 1 ] || fail "$name" "published nothing but never logged a failure"
      # Nothing that was not published by THIS run may be reported as this run's URL.
      if [ "$(count_in_log "DEPLOYED ok $EARLIER_URL")" -ne 0 ]; then
        fail "$name" "re-served an EARLIER run's URL as its own"
      fi
      if [ "$(count_in_log "DEPLOYED ok $BANNER_URL")" -ne 0 ]; then
        fail "$name" "reported the 'project create' banner URL as a deployed URL"
      fi
      ;;
    deployed:*)
      local want="${expect#deployed:}"
      [ "$(count_in_log "DEPLOYED ok $want")" -ge 1 ] || \
        fail "$name" "a real publish at $want was not reported as DEPLOYED ok (fail-closed)"
      [ "$failed_count" -eq 0 ] || fail "$name" "reported a failure for a successful publish"
      ;;
  esac
  echo "  ran $name (DEPLOYED ok x$ok_count, FAILED x$failed_count)"
}

# run_skip <name> <use_stub_path> <token> <expected_stdout_fragment>
run_skip() {
  local name="$1" use_stub="$2" token="$3" want="$4" out
  rm -f "$LOG" "$TMP/calls"
  local bin="$TMP/emptybin"
  [ "$use_stub" = yes ] && bin="$TMP/bin"
  out="$(PATH="$bin:/usr/bin:/bin" STUB_CALLS="$TMP/calls" CLOUDFLARE_API_TOKEN="$token" \
    bash "$TMP/repo/scripts/deploy-site.sh" 2>&1 || true)"
  case "$out" in
    *"$want"*) ;;
    *) fail "$name" "expected stdout to contain '$want', got: $out" ;;
  esac
  [ "$(count_in_log 'DEPLOYED ok')" -eq 0 ] || fail "$name" "a skipped run still claimed DEPLOYED ok"
  echo "  ran $name"
}

echo "deploy-site contract — script under test: $UNDER_TEST"

# [A] The exact F-1049-1 mode: wrangler exits 0 having published nothing. The fallback
#     `pages project create` then succeeds and prints its banner URL — which is NOT a publish.
run_case no-url            0 no  0 '' failed

# [B] A real publish must still be reported. The cure must not be fail-closed into uselessness.
run_case real-url          0 yes 0 '' "deployed:$STUB_URL"

# [C] wrangler exits non-zero and the project-create fallback also fails.
run_case wrangler-red      1 no  1 '' failed

# [D] The worst defect: publishes nothing while the CUMULATIVE log already holds an earlier run's
#     URL, planted here as raw wrangler output exactly as `cat "$CAPTURE" >> "$LOG"` would leave it.
run_case poisoned-log      0 no  0 \
  "[deploy-site] 2026-07-25 03:00:00 Deployment complete! Take a peek over at $EARLIER_URL" failed

# [E] A poisoned log must not suppress a genuine success either.
run_case poisoned-but-real 0 yes 0 \
  "[deploy-site] 2026-07-25 03:00:00 Deployment complete! Take a peek over at $EARLIER_URL" \
  "deployed:$STUB_URL"

# Skip paths: missing tooling/auth is a clean skip that claims nothing.
run_skip skip-no-wrangler no  fake-test-token 'SKIP: wrangler not installed'
run_skip skip-no-token    yes ''              'SKIP: CLOUDFLARE_API_TOKEN missing'

if [ "$FAILURES" -ne 0 ]; then
  echo "deploy-site contract FAIL ($FAILURES assertion failure(s))" >&2
  exit 1
fi
echo 'deploy-site contract PASS (no-url, real-url, wrangler-red, poisoned-log, poisoned-but-real, 2 skips)'
