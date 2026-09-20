# s1478 — F-PG-5's actual demanded act: sweep EVERY E2 profile through the real
# verifier's verify_terrain(), under real Blender, and report per-profile verdicts.
# Bypasses main() on purpose so no tracked artifact under artifacts/ is rewritten.
#
#   /Applications/Blender.app/Contents/MacOS/Blender --background \
#     --python logs/session-scratch/s1478-e2-sweep-probe.py
import importlib.util
import json
import pathlib
import sys
import traceback

ROOT = pathlib.Path(__file__).resolve().parents[2]
SPIKE = ROOT / "assets" / "pilots" / "map-rebuild-spike"
sys.path.insert(0, str(SPIKE))

spec = importlib.util.spec_from_file_location("s1478_verifier", SPIKE / "verify_e2_contract_terrains.py")
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

rows = []
for key, config in module.MAPS.items():
    contract_path = SPIKE / f"{config['stem']}-contract.json"
    shipped = len(json.loads(contract_path.read_text(encoding="utf-8"))["landmarkMounts"])
    row = {"profile": key, "declared": config["mounts"], "shippedMounts": shipped}
    try:
        module.verify_terrain(key, config)
        row["verdict"] = "PASS"
    except AssertionError:
        row["verdict"] = "ASSERT-FAIL"
        row["where"] = traceback.format_exc().strip().splitlines()[-2].strip()
    except Exception as exc:  # environment / dependency, not a contract verdict
        row["verdict"] = f"ERROR: {type(exc).__name__}"
    rows.append(row)

print("SWEEP-BEGIN")
for row in rows:
    print("SWEEP-ROW " + json.dumps(row))
print("SWEEP-END total=%d pass=%d" % (len(rows), sum(1 for r in rows if r["verdict"] == "PASS")))
