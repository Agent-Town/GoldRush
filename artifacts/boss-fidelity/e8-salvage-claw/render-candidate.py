from pathlib import Path
import importlib.util,sys
root=Path.cwd();path=root/'assets/pilots/salvage-claw-3d/render_salvage_claw_detail_opus5.py'
spec=importlib.util.spec_from_file_location('claw_render',path);m=importlib.util.module_from_spec(spec);sys.modules[spec.name]=m;spec.loader.exec_module(m)
from mathutils import Vector
aim=m.shared.aim
m.shared.aim=lambda camera,location,target: aim(camera,Vector((0,-16,9)),Vector((0,0,5.7)))
out=root/'artifacts/boss-fidelity/e8-salvage-claw/candidate-v10'
for label,glb in [('before',m.GLB),('candidate',out/'salvage-claw.glb')]:
 for state,morphs in [('intact',set()),('landed',set(m.COMPONENTS))]:m.render_single(glb,out/f'{label}-{state}.png',morphs,resolution=(940,760),ortho=18.5)
m.shared.aim=lambda camera,location,target: aim(camera,Vector((-14,-14,10)),Vector((0,0,5.7)))
for state,morphs in [('intact',set()),('landed',set(m.COMPONENTS))]:
 m.render_single(out/'salvage-claw.glb',out/f'candidate-three-quarter-{state}.png',morphs,resolution=(940,760),ortho=19)
