from pathlib import Path
import importlib.util,sys,json,hashlib
import bpy
from mathutils import Vector
sys.dont_write_bytecode=True
HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[2]
spec=importlib.util.spec_from_file_location('e6_review',ROOT/'assets/pilots/homemaker-9000-3d/render_homemaker_9000.py');review=importlib.util.module_from_spec(spec);spec.loader.exec_module(review)
r=review.shared
OUT=HERE/'neutral-12';OUT.mkdir(exist_ok=True)
records=[]
for label,path in [('before',HERE/'before/homemaker-9000.glb'),('candidate',HERE/'candidate-model/homemaker-9000.glb')]:
 for state,damaged in [('intact',[]),('chair',['vac','rack','core'])]:
  r.reset_scene();r.GLB=path;objects=r.import_dredge_queen()
  for name in damaged:objects[name].data.shape_keys.key_blocks[1].value=1
  camera=r.setup_scene((800,720));scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.device='CPU';scene.cycles.samples=16;scene.cycles.use_denoising=True;scene.render.threads_mode='FIXED';scene.render.threads=1
  scene.world.node_tree.nodes['Background'].inputs['Color'].default_value=(.07,.07,.07,1)
  for light in [o for o in scene.objects if o.type=='LIGHT']:light.data.color=(1,1,1)
  ground=r.material('Neutral review ground',(.15,.19,.18,1),.9);r.add_box('Review-only ground',(18,18,.10),(0,0,-.10),ground)
  camera.data.type='ORTHO';camera.data.ortho_scale=10.5;r.aim(camera,Vector((-10,-13,8)),Vector((0,0,3.15)))
  out=OUT/f'{label}-{state}.png';r.render(out);records.append({'file':out.name,'asset':str(path),'sha256':hashlib.sha256(path.read_bytes()).hexdigest()})
r.aim(camera,Vector((10,13,6)),Vector((0,0,2.4)));r.render(OUT/'candidate-chair-rear.png');records.append({'file':'candidate-chair-rear.png','asset':str(path),'sha256':hashlib.sha256(path.read_bytes()).hexdigest()})
(OUT/'receipt.json').write_text(json.dumps(records,indent=2)+'\n')
