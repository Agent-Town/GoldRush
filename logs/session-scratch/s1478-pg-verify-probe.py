# s1478 — F-PG-5 probe. Runs ONLY verify_terrain('pressure-garden', ...) from
# verify_e2_contract_terrains.py, deliberately bypassing main() so that NO tracked
# artifact under artifacts/ is written (main() rewrites e2-mask-availability.json,
# e2-asset-contract.json and e2-reexport-evidence.md before it ever reaches the
# terrain loop — running it would churn retained evidence to answer a one-line question).
#
# Usage (from repo root):
#   /Applications/Blender.app/Contents/MacOS/Blender --background \
#     --python logs/session-scratch/s1478-pg-verify-probe.py
#
# Expected BEFORE the fix: AssertionError at the `len(landmarkMounts) == config["mounts"]`
# line (contract ships 5 mounts, MAPS declares 0).
# Expected AFTER  the fix: OK.
import importlib.util
import pathlib
import sys
import traceback

ROOT = pathlib.Path(__file__).resolve().parents[2]
SPIKE = ROOT / "assets" / "pilots" / "map-rebuild-spike"
sys.path.insert(0, str(SPIKE))

spec = importlib.util.spec_from_file_location(
    "s1478_verifier", SPIKE / "verify_e2_contract_terrains.py"
)
module = importlib.util.module_from_spec(spec)
# Guard: the module must NOT run main() on import.
try:
    spec.loader.exec_module(module)
except Exception:
    print("PROBE-RESULT: IMPORT-FAILED")
    traceback.print_exc()
    raise SystemExit(3)

key = "pressure-garden"
config = module.MAPS[key]
print(f"PROBE: declared mounts for {key} = {config['mounts']}")
try:
    result = module.verify_terrain(key, config)
    print(f"PROBE-RESULT: OK — verify_terrain('{key}') passed")
    print(f"  triangles={result['checked']['triangles']} sha256={result['checked']['sha256'][:16]}")
except AssertionError:
    print("PROBE-RESULT: ASSERTION-FAILED")
    traceback.print_exc()
    raise SystemExit(1)
except Exception:
    print("PROBE-RESULT: ERROR (not an assertion — environment or dependency)")
    traceback.print_exc()
    raise SystemExit(2)
