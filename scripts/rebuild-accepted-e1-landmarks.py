"""Reproduce current E1 landmarks from pinned geometry plus documented later source updates.

python3 scripts/rebuild-accepted-e1-landmarks.py artifacts/e1-reproduction-new
The destination must not exist. Historical geometry is pinned; Baron materials and two later saved-source geometry corrections follow.
The archived recipe receives only the explicit metadata/export patch recorded in proof.json.
"""
import argparse
import hashlib
import io
import json
import os
from pathlib import Path
import subprocess
import tarfile

ROOT = Path(__file__).resolve().parents[1]
REVISION = "7c01afa588aa2d2fc3b764603fbd48f84fbd2890"
PREFIX = "assets/pilots/map-rebuild-spike/"
PACKS = ("the-claim", "dry-gulch", "night-shift", "twin-banks", "baron")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("destination", type=Path)
    args = parser.parse_args()
    destination = args.destination.resolve()
    if destination.exists():
        parser.error("destination already exists; use a new scratch directory")
    revision = subprocess.check_output(["git", "rev-parse", REVISION], cwd=ROOT, text=True).strip()
    paths = subprocess.check_output(["git", "ls-tree", "-r", "--name-only", revision, "--", PREFIX], cwd=ROOT, text=True).splitlines()
    inputs = [p for p in paths if "/" not in p[len(PREFIX):] and p.endswith(".py")]
    for pack in PACKS:
        inputs.extend([PREFIX + pack + "-terrain-contract.json", "assets/raw/plate-contract-" + pack + ".png"])
    archive = subprocess.check_output(["git", "archive", revision, "--", *inputs], cwd=ROOT)
    destination.mkdir(parents=True)
    with tarfile.open(fileobj=io.BytesIO(archive)) as source:
        source.extractall(destination, filter="data")
    input_hashes = {p: hashlib.sha256((destination / p).read_bytes()).hexdigest() for p in inputs}
    builder = destination / PREFIX / "build_landmark_packs.py"
    recipe = builder.read_text()
    metadata_anchor = '    model["landmark_id"] = asset_id\n'
    metadata_patch = (
        '    model["render_only"] = True\n'
        '    model["landmark"] = True\n'
        '    model["mount_id"] = asset_id\n'
        '    model["map_pack"] = key\n'
        '    model["era"] = 1\n'
    )
    # Append after the two original properties so the saved-source exporter has the same order.
    save_anchor = '    triangles = sum(len(polygon.vertices) - 2 for polygon in model.data.polygons)\n'
    export_anchor = 'export_animations=False, export_materials="EXPORT",'
    assert recipe.count(metadata_anchor) == recipe.count(save_anchor) == recipe.count(export_anchor) == 1
    recipe = recipe.replace(save_anchor, metadata_patch + save_anchor)
    recipe = recipe.replace(export_anchor, export_anchor + ' export_extras=True,')
    builder.write_text(recipe)
    with (destination / "build.log").open("w") as log:
        subprocess.run([os.environ.get("BLENDER", "/Applications/Blender.app/Contents/MacOS/Blender"),
                        "--background", "--python-exit-code", "1", "--python",
                        str(builder)], cwd=ROOT,
                       stdout=log, stderr=subprocess.STDOUT, check=True)
    # The archived body builder predates pack contracts; current metadata supplies source filenames.
    baron_contract = ROOT / PREFIX / "landmarks/baron/baron-landmark-pack-contract.json"
    (destination / PREFIX / "landmarks/baron/baron-landmark-pack-contract.json").write_bytes(baron_contract.read_bytes())
    # Preserve the accepted bodies, then apply the documented native material update.
    with (destination / "baron-material.log").open("w") as log:
        subprocess.run([os.environ.get("BLENDER", "/Applications/Blender.app/Contents/MacOS/Blender"),
                        "--background", "--python-exit-code", "1", "--python",
                        str(ROOT / PREFIX / "retexture_baron_landmarks.py"), "--",
                        str(destination / PREFIX / "landmarks/baron"),
                        str(ROOT / "assets/raw/baron-landmark-material-atlas-v2.png")],
                       cwd=ROOT, stdout=log, stderr=subprocess.STDOUT, check=True)
    # These later geometry corrections are authored in saved per-body Blender sources.
    saved_updates = [("dry-gulch", "isolated_spring"), ("night-shift", "seven_lantern_terraces")]
    saved_sources = [ROOT / PREFIX / "landmarks" / pack / (identifier + ".blend") for pack, identifier in saved_updates]
    exports = [(str(source), str(destination / PREFIX / "landmarks" / pack / (identifier + ".glb")))
               for source, (pack, identifier) in zip(saved_sources, saved_updates)]
    exporter = destination / "export-current-sources.py"
    exporter.write_text("import bpy\n" + "for source, target in " + repr(exports) + ":\n"
                        " bpy.ops.wm.open_mainfile(filepath=source)\n"
                        " objects=[o for o in bpy.data.objects if o.type=='MESH']; assert len(objects)==1\n"
                        " bpy.ops.object.select_all(action='DESELECT'); objects[0].select_set(True); bpy.context.view_layer.objects.active=objects[0]\n"
                        " bpy.ops.export_scene.gltf(filepath=target, export_format='GLB', use_selection=True, export_apply=True, export_animations=False, export_extras=True)\n")
    with (destination / "saved-source-updates.log").open("w") as log:
        subprocess.run([os.environ.get("BLENDER", "/Applications/Blender.app/Contents/MacOS/Blender"),
                        "--background", "--python-exit-code", "1", "--python", str(exporter)],
                       cwd=ROOT, stdout=log, stderr=subprocess.STDOUT, check=True)
    records = []
    for pack in PACKS:
        contract = json.loads((ROOT / PREFIX / "landmarks" / pack / (pack + "-landmark-pack-contract.json")).read_text())
        for identifier, record in contract["assets"].items():
            path = Path(PREFIX) / record["asset"]
            generated = (destination / path).read_bytes()
            records.append({"pack": pack, "id": identifier, "asset": str(path),
                            "sha256": hashlib.sha256(generated).hexdigest(),
                            "byteIdentical": generated == (ROOT / path).read_bytes()})
    proof = {"sourceRevision": revision, "inputHashes": input_hashes,
             "savedSourceUpdates": {str(p.relative_to(ROOT)): hashlib.sha256(p.read_bytes()).hexdigest() for p in saved_sources},
             "baronMaterialInputs": {str(p.relative_to(ROOT)): hashlib.sha256(p.read_bytes()).hexdigest() for p in [
                 baron_contract, ROOT / PREFIX / "retexture_baron_landmarks.py",
                 ROOT / "assets/raw/baron-landmark-material-atlas-v2.png"]},
             "metadataPatch": {"properties": metadata_patch, "exportExtras": True,
                               "patchedBuilderSha256": hashlib.sha256(builder.read_bytes()).hexdigest()},
             "assets": records}
    (destination / "proof.json").write_text(json.dumps(proof, indent=2) + "\n")
    assert len(records) == 25 and all(row["byteIdentical"] for row in records), "accepted runtime differs: inspect proof.json"
    print("PASS: all 25 current E1 landmarks regenerated byte-identically")


if __name__ == "__main__":
    main()
