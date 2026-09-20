"""Read-only Blender proof that the old body, atlas, terrain and gameplay bytes survive."""
from pathlib import Path
import bpy, hashlib, json, subprocess
root=Path.cwd();base='43a73b54a'
rel='assets/pilots/map-rebuild-spike/landmarks/twin-banks/floodplain_dressing_pack.blend'
old=root/'artifacts/sol/map-art-campaign-2/_raw/run-3/twin-banks-before'/rel
def read_body(path):
    bpy.ops.wm.open_mainfile(filepath=str(path))
    mesh=bpy.data.objects['floodplain_dressing_pack'].data
    return ([tuple(v.co) for v in mesh.vertices], [tuple(p.vertices) for p in mesh.polygons],
            [tuple(loop.uv) for loop in mesh.uv_layers.active.data])
before=read_body(old);after=read_body(root/rel)
for original,now in zip(before,after):assert now[:len(original)]==original
unchanged={}
for path in ['assets/pilots/map-rebuild-spike/twin-banks-terrain.glb',
             'assets/pilots/map-rebuild-spike/twin-banks-panorama.glb',
             'assets/pilots/map-rebuild-spike/landmarks/twin-banks/twin-banks-landmarks-atlas.png',
             'assets/pilots/map-rebuild-spike/landmark-collision-contract.json']:
    data=(root/path).read_bytes();assert data==subprocess.check_output(['git','show',f'{base}:{path}'])
    unchanged[path]=hashlib.sha256(data).hexdigest()
subprocess.run(['git','diff','--exit-code',base,'--','assets/contracts','src/sim','src/game','src/world/Terrain.ts','src/world/LightRig.ts'],check=True)
report={'base':base,'originalBodyVerticesPreserved':len(before[0]),'originalBodyFacesPreserved':len(before[1]),
        'originalUvLoopsPreserved':len(before[2]),'newVertices':len(after[0])-len(before[0]),
        'newFaces':len(after[1])-len(before[1]),'unchangedBytes':unchanged,'gameplayDiffEmpty':True}
Path('artifacts/sol/map-art-campaign-2/run-3/e1-twin-banks/geometry-invariants.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report,indent=2))
