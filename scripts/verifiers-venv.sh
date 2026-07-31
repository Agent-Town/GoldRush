#!/usr/bin/env bash
set -euo pipefail

ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
PACKAGE="$ROOT/env/goldrush-verifiers"
VENV="$PACKAGE/.venv"
PROBED=()

if [[ -x "$VENV/bin/python" ]]; then
  PYTHON="$VENV/bin/python"
  version=$("$PYTHON" --version 2>&1)
  PROBED+=("$PYTHON ($version)")
else
  for name in python3.10 python3.11 python3.12 python3.13 python3.14 python3 python; do
    if ! command -v "$name" >/dev/null 2>&1; then
      PROBED+=("$name (not found)")
      continue
    fi
    path=$("$name" -c 'import os, sys; print(os.path.realpath(sys.executable))')
    version=$("$name" --version 2>&1)
    PROBED+=("$name ($path, $version)")
    if "$name" -c 'import sys; raise SystemExit(sys.version_info < (3, 10))'; then
      PYTHON="$path"
      break
    fi
  done
fi

if [[ -z ${PYTHON:-} ]] || ! "$PYTHON" -c 'import sys; raise SystemExit(sys.version_info < (3, 10))'; then
  printf 'ERROR: Gold Rush verifiers require Python >=3.10. Probed: %s\n' "${PROBED[*]}" >&2
  exit 1
fi

printf 'Interpreter: %s\n' "$VENV/bin/python"
printf 'Version: %s\n' "$version"

if [[ ! -x "$VENV/bin/python" ]]; then
  "$PYTHON" -m venv "$VENV"
fi
if [[ ! -f "$VENV/.goldrush-installed" ]]; then
  "$VENV/bin/python" -m pip install -e "$PACKAGE"
  touch "$VENV/.goldrush-installed"
fi

exec "$VENV/bin/python" -m unittest discover -s "$PACKAGE/tests"
