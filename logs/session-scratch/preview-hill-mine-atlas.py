# Preview ONLY the hill-mine atlas paint, without the mesh, the four Cycles verdict renders or the
# GLB export — ~5 s against the full builder's ~15-40 s, which is what makes an iterate-and-look loop
# possible on a texture.
#
# TRAP (learned on the e1-baron shift): `make_atlas()` writes the SHIPPED atlas as a side effect,
# before it returns the image. So this script ALWAYS dirties
# assets/pilots/map-rebuild-spike/hill-mine-terrain-atlas.png. It copies the result to the scratch
# path given on the command line and then restores the shipped file from git, so the tree is clean
# again and nothing downstream is measured against a preview.
#
# Usage:
#   /Applications/Blender.app/Contents/MacOS/Blender --background --python \
#     logs/session-scratch/preview-hill-mine-atlas.py -- <out.png>
import importlib.util
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BUILDER = ROOT / "assets/pilots/map-rebuild-spike/build_e2_contract_terrains.py"
SHIPPED = ROOT / "assets/pilots/map-rebuild-spike/hill-mine-terrain-atlas.png"

args = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
out = Path(args[0]) if args else ROOT / "logs/session-scratch/hill-mine-atlas-preview.png"

spec = importlib.util.spec_from_file_location("e2builder", BUILDER)
builder = importlib.util.module_from_spec(spec)
sys.modules["e2builder"] = builder
spec.loader.exec_module(builder)

profile = builder.PROFILES["hill-mine"]
factory = builder.authored_contract(profile["contractId"])
mask_document = builder.authored_mask("hill-mine", factory)
builder.claim.reset_scene()
_, path = builder.make_atlas("hill-mine", profile, factory, mask_document)
out.parent.mkdir(parents=True, exist_ok=True)
shutil.copyfile(path, out)
# Restore the shipped atlas: a preview must never leave the tree dirty.
subprocess.run(["git", "-C", str(ROOT), "checkout", "--", str(SHIPPED.relative_to(ROOT))], check=False)
print(f"preview written to {out}")
