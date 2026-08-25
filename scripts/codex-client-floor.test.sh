#!/bin/bash
# Guard for F-1651-1 (s1651, 2026-08-11) — the CODEX CLIENT FLOOR in lane-runner-v3.sh.
#
# WHAT WENT WRONG: the runner dispatches with bare `codex`, resolved from the PATH of the
# shell that launched it. Restarted 2026-08-11 05:08:20 from a shell without nvm, bare
# `codex` resolved to Homebrew's 0.133.0 — under the 0.144.1 floor that knows gpt-5.6 ids
# — and the next dispatch died in 14 s with HTTP 400, AFTER its master had been consumed
# into tasks/running/. One master shredded per cycle, each corpse looking like a task bug.
#
# WHAT THIS ASSERTS, in order of how much it matters:
#   1. ORDERING — the client check runs BEFORE `mv "$f" "$run"` consumes the master.
#      This is the whole point; a check after the mv would still shred the queue.
#   2. The dispatch invokes "$codex_bin", never bare `codex`.
#   3. resolve_codex_bin SELF-HEALS a wrong-shell PATH by falling through to nvm.
#   4. It SKIPS a binary that cannot answer --version (the v24.14.0 ENOENT corpse), so
#      "highest node version" can never select a client whose failure mimics a wall.
#   5. It REFUSES (rc 1) when nothing meets the floor — proven by manufacturing that
#      state, not by observing the happy path. A passing checker never runs its red.
#   6. Version comparison is correct at the boundary (0.144.0 fails, 0.144.1 passes).
set -u
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# $1 exists ONLY so this guard's own red paths can be proven against a scratch copy
# (a passing guard never executes its violation path, so its green is no evidence
# about its red). Defaults to the live runner; CI/gates pass no argument.
RUNNER="${1:-$ROOT/scripts/lane-runner-v3.sh}"
# s2307 / F-2307-1 — an ABSENT subject is "could not answer" (exit 2), not "answered, and the
# answer refuses" (exit 1). Without this, `bash -n` on a missing file fails and the guard below
# reports "lane-runner-v3.sh does not parse" — a diagnosis that accuses the wrong subject and
# collapses the 2-vs-1 distinction its three siblings in this same battery already carry
# (main-lock-gate-guard.test.sh:29, lane-dispatch-safety-guard.test.sh:12,
# janitor-request-rejection.test.sh). Silent on the happy path: every non-readable state
# refuses LOUDLY here, so the absence of a banner is unambiguous (the F-2224-1 boundary).
[ -r "$RUNNER" ] || { echo "MISUSE: cannot read $RUNNER"; exit 2; }
fails=0
ok()   { echo "  ok   — $1"; }
bad()  { echo "  FAIL — $1"; fails=$((fails+1)); }

echo "codex-client-floor guard (F-1651-1)"

# --- 0. the runner still parses -----------------------------------------------------
if bash -n "$RUNNER" 2>/dev/null; then ok "lane-runner-v3.sh parses"
else bad "lane-runner-v3.sh does not parse"; echo "RESULT: $fails failure(s)"; exit 1; fi

# --- 1. ORDERING: the floor check precedes the master-consuming mv ------------------
check_ln=$(grep -n 'if ! codex_bin=$(resolve_codex_bin)' "$RUNNER" | head -1 | cut -d: -f1)
mv_ln=$(grep -n 'mv "\$f" "\$run"' "$RUNNER" | head -1 | cut -d: -f1)
if [ -z "${check_ln:-}" ]; then
  bad "no resolve_codex_bin gate found at the dispatch site"
elif [ -z "${mv_ln:-}" ]; then
  bad "could not locate the master-consuming mv"
elif [ "$check_ln" -lt "$mv_ln" ]; then
  ok "floor check (line $check_ln) precedes master consumption (line $mv_ln)"
else
  bad "floor check at $check_ln runs AFTER the mv at $mv_ln — masters still get shredded"
fi

# --- 2. dispatch uses the resolved binary, not bare codex ---------------------------
if grep -q 'cd "$wd" && "$codex_bin" exec ' "$RUNNER"; then
  ok 'dispatch invokes "$codex_bin"'
else
  bad 'dispatch does not invoke "$codex_bin"'
fi
if grep -qE 'cd "\$wd" && codex exec ' "$RUNNER"; then
  bad "dispatch still invokes bare codex (PATH-dependent — the F-1651-1 defect)"
else
  ok "no bare-codex dispatch remains"
fi

# --- extract the F-1651-1 helpers and exercise them against stubs -------------------
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT
sed -n '/^# --- F-1651-1 .*CODEX CLIENT FLOOR/,/^# --- END F-1651-1/p' "$RUNNER" > "$tmp/helpers.sh"
if [ ! -s "$tmp/helpers.sh" ]; then
  bad "could not extract the F-1651-1 helper block"; echo "RESULT: $fails failure(s)"; exit 1
fi
# shellcheck disable=SC1090
. "$tmp/helpers.sh"

mkstub() { # $1 = path, $2 = version text ("" = a corpse that cannot answer)
  mkdir -p "$(dirname "$1")"
  if [ -z "$2" ]; then printf '#!/bin/bash\nexit 1\n' > "$1"
  else printf '#!/bin/bash\necho "codex-cli %s"\n' "$2" > "$1"; fi
  chmod +x "$1"
}

# --- 6. boundary arithmetic ---------------------------------------------------------
codex_ver_ge "0.145.0" "0.144.1" && ok "0.145.0 >= 0.144.1" || bad "0.145.0 >= 0.144.1 misjudged"
codex_ver_ge "0.144.1" "0.144.1" && ok "0.144.1 >= 0.144.1 (equal)" || bad "equal version misjudged"
codex_ver_ge "0.144.0" "0.144.1" && bad "0.144.0 wrongly passes the floor" || ok "0.144.0 < 0.144.1"
codex_ver_ge "0.133.0" "0.144.1" && bad "0.133.0 wrongly passes the floor" || ok "0.133.0 < 0.144.1"
codex_ver_ge "1.0.0"   "0.144.1" && ok "1.0.0 >= 0.144.1 (major bump)" || bad "major bump misjudged"

# --- version parsing ----------------------------------------------------------------
mkstub "$tmp/parse/codex" "0.145.0"
got=$(codex_ver "$tmp/parse/codex")
[ "$got" = "0.145.0" ] && ok "codex_ver parses 'codex-cli 0.145.0' -> 0.145.0" \
                       || bad "codex_ver returned '$got', expected 0.145.0"

# --- 3 + 4. SELF-HEAL past an under-floor PATH, SKIPPING the ENOENT corpse ----------
export HOME="$tmp/home"
mkstub "$tmp/pathbin/codex" "0.133.0"          # what a wrong-shell restart sees
mkstub "$HOME/.nvm/versions/node/v22.0.0/bin/codex" ""        # corpse, sorts FIRST
mkstub "$HOME/.nvm/versions/node/v23.11.1/bin/codex" "0.145.0" # the good client
export PATH="$tmp/pathbin:$PATH"
if got=$(resolve_codex_bin); then
  if [ "$got" = "$HOME/.nvm/versions/node/v23.11.1/bin/codex" ]; then
    ok "self-heals past a 0.133.0 PATH to the nvm 0.145.0 client"
  else
    bad "resolved '$got', expected the nvm v23.11.1 client"
  fi
else
  bad "resolve_codex_bin refused while a 0.145.0 client existed"
fi

# --- a healthy PATH is preferred (no behaviour change when the shell is right) ------
mkstub "$tmp/pathbin/codex" "0.145.0"
got=$(resolve_codex_bin)
[ "$got" = "$tmp/pathbin/codex" ] && ok "prefers a floor-meeting PATH client (no-op when healthy)" \
                                  || bad "did not prefer the healthy PATH client (got '$got')"

# --- 5. MANUFACTURE THE RED: nothing meets the floor -> rc 1 ------------------------
export HOME="$tmp/empty-home"
mkdir -p "$HOME"
mkstub "$tmp/pathbin/codex" "0.133.0"
if resolve_codex_bin >/dev/null 2>&1; then
  bad "resolve_codex_bin returned success with only an under-floor client"
else
  ok "refuses (rc 1) when no client meets the floor"
fi

echo "RESULT: $fails failure(s)"
[ "$fails" -eq 0 ] || exit 1
