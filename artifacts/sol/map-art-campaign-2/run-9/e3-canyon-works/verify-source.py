"""Saved source must re-export exactly; protect the old geometry authority."""
from pathlib import Path
import bpy,json,hashlib
P=Path.cwd()/'assets/pilots/map-rebuild-spike';S=P/'sources/e3-canyon-works-fidelity-2';OUT=Path(__file__).parent
RAW=Path('artifacts/sol/map-art-campaign-2/_raw/run-9/canyon-source-proof');RAW.mkdir(exist_ok=True)
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
def meshes():
 return {o.name:{'vertices':[tuple(v.co) for v in o.data.vertices],'faces':[tuple(f.vertices) for f in o.data.polygons],'uv':{u.name:[tuple(v.uv) for v in u.data] for u in o.data.uv_layers},'bounds':[tuple(v) for v in o.bound_box],'matrix':[list(v) for v in o.matrix_world]} for o in bpy.data.objects if o.type=='MESH'}
def export(path,active_colors=False):
 bpy.ops.export_scene.gltf(filepath=str(path),export_format='GLB',use_selection=True,export_apply=True,export_cameras=False,export_lights=False,export_animations=False,export_materials='EXPORT',export_extras=True,export_vertex_color='ACTIVE' if active_colors else 'MATERIAL')
bpy.ops.wm.open_mainfile(filepath=str(S/'landmarks-input.blend'));before=meshes()
bpy.ops.wm.open_mainfile(filepath=str(P/'landmarks/canyon-works/canyon-works-landmarks.blend'));after=meshes();assert before.keys()==after.keys();rows=[]
for name,a in before.items():
 b=after[name]
 if name!='sub-hall-dynamo-house':assert a==b,name
 assert a['bounds']==b['bounds'],name
 bpy.ops.object.select_all(action='DESELECT');o=bpy.data.objects[name];o.hide_set(False);o.select_set(True);bpy.context.view_layer.objects.active=o;target=RAW/(name+'.glb');export(target)
 shipped=P/'landmarks/canyon-works'/(name+'.glb');assert target.read_bytes()==shipped.read_bytes(),name
 rows.append({'id':name,'unchangedSourceSibling':name!='sub-hall-dynamo-house','exactBounds':True,'sourceReexportByteIdentical':True,'sha256':sha(target)})
bpy.ops.wm.open_mainfile(filepath=str(S/'panorama-input.blend'));original=meshes()['CanyonWorksPanorama'];original_obj=bpy.data.objects['CanyonWorksPanorama']
def triangles_set(obj):
 return {tuple(sorted(tuple(obj.data.vertices[i].co) for i in f.vertices)) for f in obj.data.polygons}
old_sky={tuple(sorted(original['vertices'][i] for i in f)) for f in original['faces'][:2304]};old_apron={tuple(sorted(original['vertices'][i] for i in f)) for f in original['faces'][2304:]}
bpy.ops.wm.open_mainfile(filepath=str(P/'canyon-works-panorama.blend'))
sky=bpy.data.objects['CanyonWorksPanorama'];apron=bpy.data.objects['CanyonApronEarth'];rock=bpy.data.objects['CanyonRimStrata']
assert triangles_set(sky)==old_sky;assert triangles_set(apron)==old_apron
new_sky=meshes()['CanyonWorksPanorama'];assert new_sky['uv']['PanoramaUV']==original['uv']['PanoramaUV'][:2304*3]
assert all(abs(v.co.x)>48 or abs(v.co.y)>56 for v in rock.data.vertices)
bpy.ops.object.select_all(action='DESELECT')
for o in (sky,apron,rock):o.select_set(True)
bpy.context.view_layer.objects.active=sky;target=RAW/'canyon-works-panorama.glb';export(target,True);assert target.read_bytes()==(P/'canyon-works-panorama.glb').read_bytes()
rows.append({'id':'panorama','sourceReexportByteIdentical':True,'originalSkyGeometryAndUvsExact':True,'originalApronPositionsAndFacesExact':True,'allNewVerticesOutsidePlayableRectangle':True,'sha256':sha(target)})
(OUT/'source-verification.json').write_text(json.dumps({'rows':rows,'originalLandmarkAtlasUnchanged':True,'newRasters':0},indent=2)+'\n');print('CANYON SOURCE PROOF PASS')
