"""Re-export saved Blender bodies and compare protected sibling meshes/metadata."""
from pathlib import Path
import bpy,json,hashlib,sys
args=sys.argv[sys.argv.index('--')+1:];name=args[0];changed=set(args[1:])
P=Path.cwd()/'assets/pilots/map-rebuild-spike';pack=name.removeprefix('e9-')
S=P/f'sources/{name}-fidelity-2';PACK=P/f'landmarks/{pack}'
OUT=Path('artifacts/sol/map-art-campaign-2/run-9')/name
RAW=Path('artifacts/sol/map-art-campaign-2/_raw/run-9')/(name+'-source-proof');RAW.mkdir(exist_ok=True)
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
def meshes():
 return {o.name:{'vertices':[tuple(v.co) for v in o.data.vertices],'faces':[tuple(f.vertices) for f in o.data.polygons],'uv':{u.name:[tuple(v.uv) for v in u.data] for u in o.data.uv_layers},'bounds':[tuple(v) for v in o.bound_box],'matrix':[list(v) for v in o.matrix_world]} for o in bpy.data.objects if o.type=='MESH'}
bpy.ops.wm.open_mainfile(filepath=str(S/'landmarks-input.blend'));before=meshes()
bpy.ops.wm.open_mainfile(filepath=str(PACK/(pack+'-landmarks.blend')));after=meshes();assert before.keys()==after.keys()
rows=[]
for id,a in before.items():
 b=after[id]
 if id not in changed:assert a==b,id
 assert a['bounds']==b['bounds'],(id,a['bounds'],b['bounds'])
 assert a['matrix']==b['matrix'],id
 bpy.ops.object.select_all(action='DESELECT');o=bpy.data.objects[id];o.hide_set(False);o.select_set(True);bpy.context.view_layer.objects.active=o
 target=RAW/(id+'.glb')
 bpy.ops.export_scene.gltf(filepath=str(target),export_format='GLB',use_selection=True,export_apply=True,export_cameras=False,export_lights=False,export_animations=False,export_materials='EXPORT',export_extras=True)
 shipped=PACK/(id+'.glb');assert target.read_bytes()==shipped.read_bytes(),id
 rows.append({'id':id,'unchangedSourceSibling':id not in changed,'exactBounds':True,'sourceReexportByteIdentical':True,'sha256':sha(target)})
(OUT/'source-verification.json').write_text(json.dumps({'rows':rows,'sourceRasters':[{'file':x.name,'sha256':sha(x)} for x in sorted(S.glob('*.png'))]},indent=2)+'\n');print('SOURCE PROOF PASS',name)
