#!/usr/bin/env bash
set -euo pipefail

# Bootstrap (or reuse) the venv for env/goldrush-verifiers/ and run its suite.
# Prints the interpreter it actually used before doing anything else -- that is
# the whole point of the script (F-1298-3: this package once shipped a green
# nobody else could reproduce, on an interpreter the report never named).

ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
PACKAGE="$ROOT/env/goldrush-verifiers"
VENV="$PACKAGE/.venv"

# THE USABLE WINDOW IS NOT THIS PACKAGE'S OWN FLOOR.
# pyproject declares `requires-python = ">=3.10"`, but the dependency
# `verifiers` publishes no distribution outside >=3.10,<3.14. An interpreter
# that clears our floor alone can therefore still make the install
# unsatisfiable -- which is exactly what F-1300-1 measured: the fire shell has
# only Python 3.14, the first draft selected it on the floor check, and pip
# died with "No matching distribution found for verifiers>=0.1.8".
# Widen MAX_EXCLUSIVE only after checking what `verifiers` actually publishes.
PY_MIN_MAJOR=3; PY_MIN_MINOR=10
PY_MAX_EXCL_MAJOR=3; PY_MAX_EXCL_MINOR=14
WINDOW=">=${PY_MIN_MAJOR}.${PY_MIN_MINOR},<${PY_MAX_EXCL_MAJOR}.${PY_MAX_EXCL_MINOR}"

in_window() {
  "$1" -c "import sys; raise SystemExit(not ((${PY_MIN_MAJOR}, ${PY_MIN_MINOR}) <= sys.version_info[:2] < (${PY_MAX_EXCL_MAJOR}, ${PY_MAX_EXCL_MINOR})))" 2>/dev/null
}

PROBED=()
PYTHON=""
SELECTED_VERSION=""
REUSED=no

# Reuse ONLY a venv that finished its install AND still sits in the window.
# Keying reuse on bin/python alone made a bad choice PERMANENT: `venv` creation
# succeeds before the install fails, so the half-built venv was re-selected by
# every later run and the probe never ran again. Measured twice in s1300 --
# identical rc=1 both times, recoverable only by deleting .venv by hand.
if [[ -x "$VENV/bin/python" && -f "$VENV/.goldrush-installed" ]] && in_window "$VENV/bin/python"; then
  PYTHON="$VENV/bin/python"
  SELECTED_VERSION=$("$PYTHON" --version 2>&1)
  PROBED+=("$PYTHON ($SELECTED_VERSION) reused")
  REUSED=yes
else
  CANDIDATES=()
  for name in python3.13 python3.12 python3.11 python3.10 python3 python; do
    if command -v "$name" >/dev/null 2>&1; then
      CANDIDATES+=("$(command -v "$name")")
    else
      PROBED+=("$name (not on PATH)")
    fi
  done
  # PATH IS NOT THE WHOLE MACHINE. A headless shell routinely lacks the pyenv
  # shims an interactive one has: the fire shell saw only 3.14 on PATH while
  # pyenv 3.11.13 sat installed on the same disk, unreachable by name (F-1300-1).
  for extra in "$HOME"/.pyenv/versions/*/bin/python3 /opt/homebrew/opt/python@3.1[0-3]/bin/python3 /usr/local/opt/python@3.1[0-3]/bin/python3; do
    [[ -x "$extra" ]] && CANDIDATES+=("$extra")
  done

  if [[ ${#CANDIDATES[@]} -gt 0 ]]; then
    for cand in "${CANDIDATES[@]}"; do
      real=$("$cand" -c 'import os, sys; print(os.path.realpath(sys.executable))' 2>/dev/null) || continue
      ver=$("$cand" --version 2>&1)
      if in_window "$cand"; then
        PROBED+=("$real ($ver) IN WINDOW")
        PYTHON="$real"
        SELECTED_VERSION="$ver"
        break
      fi
      PROBED+=("$real ($ver) outside $WINDOW")
    done
  fi
fi

if [[ -z "$PYTHON" ]]; then
  printf 'ERROR: no interpreter satisfying %s (the `verifiers` dependency window,\n' "$WINDOW" >&2
  printf '       not merely this package'"'"'s own >=3.10 floor). Probed:\n' >&2
  if [[ ${#PROBED[@]} -gt 0 ]]; then
    for p in "${PROBED[@]}"; do printf '  - %s\n' "$p" >&2; done
  else
    printf '  - (no interpreters found at all)\n' >&2
  fi
  exit 1
fi

# Report the interpreter that was SELECTED, not the path we hope to create.
# The first draft printed "$VENV/bin/python" next to the probed interpreter's
# version -- on a first run that path does not exist yet, so the label named
# one subject and the version another.
printf 'Interpreter: %s\n' "$PYTHON"
printf 'Version: %s\n' "$SELECTED_VERSION"
printf 'Window: %s (reused venv: %s)\n' "$WINDOW" "$REUSED"

if [[ "$REUSED" != yes ]]; then
  # --clear rather than rm -rf: recreates in place, scoped to a gitignored dir,
  # and safely replaces a half-built venv left by an earlier failed install.
  "$PYTHON" -m venv --clear "$VENV"
fi

if [[ ! -f "$VENV/.goldrush-installed" ]]; then
  # Marker is written only AFTER a successful install, so a failed run leaves
  # the venv un-reusable and the next run re-probes instead of re-selecting it.
  "$VENV/bin/python" -m pip install -e "$PACKAGE"
  touch "$VENV/.goldrush-installed"
fi

exec "$VENV/bin/python" -m unittest discover -s "$PACKAGE/tests"
