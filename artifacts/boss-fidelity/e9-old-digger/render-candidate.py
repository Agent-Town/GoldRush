from pathlib import Path
import importlib.util,sys,os
sys.dont_write_bytecode=True
root=Path.cwd();p=root/'assets/pilots/old-digger-3d/render_old_digger.py'
spec=importlib.util.spec_from_file_location('digger_render',p);m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
from mathutils import Vector
import bpy
folder=root/os.environ.get('DIGGER_CANDIDATE','artifacts/boss-fidelity/e9-old-digger/candidate-v1');m.GLB=folder/'old-digger.glb'
for state in ('working','gentle'):
 for view,pos in [('front',(0,-18,7)),('three-quarter',(-13,-13,9))]:
  m.shared.reset_scene();objects=m.import_model();m.set_state(objects,set(m.COMPONENTS) if state=='gentle' else set())
  camera=m.setup_scene((1000,760));camera.data.type='ORTHO';camera.data.ortho_scale=15;camera.location=Vector(pos);camera.rotation_euler=(Vector((0,0,3))-camera.location).to_track_quat('-Z','Y').to_euler();bpy.context.scene.render.filepath=str(folder/f'{state}-{view}.png');bpy.ops.render.render(write_still=True)
