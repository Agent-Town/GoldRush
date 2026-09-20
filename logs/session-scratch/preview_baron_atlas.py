"""Atlas-only preview for the e1-baron beauty shift.

The full builder rebuilds the mesh, the county surround, four Cycles previews and
the GLB — minutes per look. This runs ONLY make_atlas() and writes the PNG to a
scratch path, so a paint change can be judged in ~40 s. It never touches the
shipped atlas/GLB/contract; the real re-export is still
`blender -b --python build_unique_contract_terrains.py -- baron`.

Usage: /Applications/Blender.app/Contents/MacOS/Blender -b \
         --python logs/session-scratch/preview_baron_atlas.py -- <out.png> [key]
"""

from __future__ import annotations

import importlib.util
from pathlib import Path
import sys

import bpy

ARGS = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
OUT = Path(ARGS[0]) if ARGS else Path("/tmp/baron-atlas-preview.png")
KEY = ARGS[1] if len(ARGS) > 1 else "baron"

BUILDER = Path(__file__).resolve().parents[2] / "assets/pilots/map-rebuild-spike/build_unique_contract_terrains.py"
spec = importlib.util.spec_from_file_location("unique_terrains", BUILDER)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

module.claim.reset_scene()
image = module.make_atlas(KEY, module.PROFILES[KEY])
image.filepath_raw = str(OUT)
image.file_format = "PNG"
image.save()
print(f"[preview] wrote {OUT}")
