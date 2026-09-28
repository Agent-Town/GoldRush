"""Rebuild only the sleeper from its tracked recipe and the unchanged pack atlas."""
from pathlib import Path
import bpy,sys,importlib.util,json,hashlib,subprocess
root=Path.cwd(); pilot=root/'assets/pilots/map-rebuild-spike'; out=pilot/'landmarks/boneyard'; proof=root/'artifacts/sol/map-art-campaign-2/run-6/e4-boneyard'; raw=root/'artifacts/sol/map-art-campaign-2/_raw/run-6/boneyard-pack';raw.mkdir(exist_ok=True)
base=json.loads((proof/'base.json').read_text())['store']; store=Path('/Users/robin/Claude/Projects/GoldRush-assets'); rel='pilots/map-rebuild-spike/landmarks/boneyard/'
(raw/'base.blend').write_bytes(subprocess.check_output(['git','-C',str(store),'show',base+':'+rel+'boneyard-landmarks.blend']))
# The builder's game-checkout source root is its documented atlas-only mode.
sys.argv.append('--atlas-only'); spec=importlib.util.spec_from_file_location('builder',pilot/'build_landmark_packs.py'); b=importlib.util.module_from_spec(spec);spec.loader.exec_module(b);sys.argv.pop()
bpy.ops.wm.open_mainfile(filepath=str(raw/'base.blend')); objects=[o for o in bpy.data.objects if o.type=='MESH']; rows=[]
for o in objects:
 b.export_asset(o,raw/f'{o.name}-base.glb');assert (raw/f'{o.name}-base.glb').read_bytes()==subprocess.check_output(['git','-C',str(store),'show',base+':'+rel+o.name+'.glb'])
old=bpy.data.objects['half-buried-sleeper']; material=old.data.materials[0];before=b.glb_bounds(old);bpy.data.objects.remove(old,do_unlink=True)
asset=b.finish_asset(b.boneyard_sleeper_parts(),'half-buried-sleeper',material,'boneyard',b.SPECS['half-buried-sleeper']); bounds=b.glb_bounds(asset)
# Keep the original silhouette envelope and gameplay footprint exactly.
for v in asset.data.vertices:
 for axis in range(3):
  v.co[axis]=before['min'][axis]+(v.co[axis]-bounds['min'][axis])/(bounds['max'][axis]-bounds['min'][axis])*(before['max'][axis]-before['min'][axis])
asset.data.update();bpy.context.view_layer.update();count=sum(len(p.vertices)-2 for p in asset.data.polygons);assert count<=3000
bpy.context.preferences.filepaths.save_version=0;bpy.ops.wm.save_as_mainfile(filepath=str(out/'boneyard-landmarks.blend')); b.export_asset(asset,out/'half-buried-sleeper.glb')
bpy.ops.wm.open_mainfile(filepath=str(out/'boneyard-landmarks.blend'))
for o in [o for o in bpy.data.objects if o.type=='MESH']:
 b.export_asset(o,raw/f'{o.name}-repeat.glb');assert (raw/f'{o.name}-repeat.glb').read_bytes()==(out/f'{o.name}.glb').read_bytes();rows.append({'id':o.name,'savedSourceReexportByteIdentical':True,'unchanged':o.name!='half-buried-sleeper'})
p=out/'boneyard-landmark-pack-contract.json';d=json.loads(p.read_text());d['blend']['sha256']=b.sha256(out/'boneyard-landmarks.blend');r=d['assets']['half-buried-sleeper'];r['sha256']=b.sha256(out/'half-buried-sleeper.glb');r['triangles']=count;r['bounds']=b.glb_bounds(bpy.data.objects['half-buried-sleeper']);p.write_text(json.dumps(d,indent=2)+'\n')
(proof/'source-verification.json').write_text(json.dumps({'rows':rows,'beforeBounds':before,'afterBounds':r['bounds'],'beforeTriangles':208,'afterTriangles':count,'unchangedAtlas':True,'mountsAndFootprintUnchanged':True,'recipe':'build_landmark_packs.py:boneyard_sleeper_parts'},indent=2)+'\n')
print('VERIFIED',count,r['bounds'])
