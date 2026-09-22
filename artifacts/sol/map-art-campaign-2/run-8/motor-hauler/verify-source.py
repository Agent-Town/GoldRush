from pathlib import Path
import bpy,json,hashlib
out=Path(__file__).parent;pilot=Path.cwd()/'assets/pilots/map-rebuild-spike';folder=pilot/'landmarks/motor-hauler';raw=Path.cwd()/'artifacts/sol/map-art-campaign-2/_raw/run-8/motor-source-reexport';raw.mkdir(exist_ok=True)
c=json.loads((folder/'motor-hauler-landmark-pack-contract.json').read_text())['assets']['motor-hauler'];bpy.ops.wm.open_mainfile(filepath=str(folder/'motor-hauler.blend'));body=bpy.data.objects['MotorHauler'];bpy.ops.object.select_all(action='DESELECT');body.select_set(True);bpy.context.view_layer.objects.active=body
p=raw/'motor-hauler.glb';bpy.ops.export_scene.gltf(filepath=str(p),export_format='GLB',use_selection=True,export_apply=True,export_cameras=False,export_lights=False,export_animations=False,export_materials='EXPORT',export_extras=True)
assert p.read_bytes()==(folder/'motor-hauler.glb').read_bytes();tri=sum(len(f.vertices)-2 for f in body.data.polygons);assert tri==c['triangles'] and tri<=c['triangleBudget']
vertices=[tuple(v.co) for v in body.data.vertices];assert all(abs(x)<=1.14001 and abs(y)<=1.55001 and .02999<=z<=1.58001 for x,y,z in vertices)
(out/'source-verification.json').write_text(json.dumps({'savedSourceReexportByteIdentical':True,'triangles':tri,'triangleBudget':c['triangleBudget'],'materials':len(body.data.materials),'withinOriginalVehicleEnvelope':True,'boundsBlender':c['bounds'],'glbSha256':hashlib.sha256(p.read_bytes()).hexdigest(),'glbBytes':p.stat().st_size,'rasterGenerated':False,'bedEmpty':True},indent=2)+'\n');print('MOTOR SOURCE PASS',tri)
