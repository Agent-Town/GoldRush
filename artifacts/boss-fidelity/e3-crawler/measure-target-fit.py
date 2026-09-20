"""Measure each combat disk's overlap with its component's actual XZ triangles."""
from pathlib import Path
import json, math, struct
import numpy as np
ROOT = Path(__file__).resolve().parents[3]
OUT = Path(__file__).resolve().parent / 'runtime-fit'
raw = (ROOT / 'assets/pilots/crawler-3d/crawler.glb').read_bytes()
length = struct.unpack_from('<I', raw, 12)[0]
doc = json.loads(raw[20:20+length]); binary = 28 + length

def accessor(index):
    a = doc['accessors'][index]; view = doc['bufferViews'][a['bufferView']]
    kind = {5126:'f', 5123:'H', 5125:'I'}[a['componentType']]
    count = {'SCALAR':1, 'VEC3':3}[a['type']]
    offset = binary + view.get('byteOffset',0) + a.get('byteOffset',0)
    stride = view.get('byteStride', struct.calcsize(kind)*count)
    return np.array([struct.unpack_from('<'+kind*count, raw, offset+i*stride) for i in range(a['count'])])

geometries = {}
for node in doc['nodes']:
    if 'mesh' not in node: continue
    primitive = doc['meshes'][node['mesh']]['primitives'][0]
    geometries[node['name']] = (accessor(primitive['attributes']['POSITION'])[:,[0,2]], accessor(primitive['indices']).flatten().reshape(-1,3))
pose = json.loads((OUT / 'early-ui/desktop.json').read_text())['poses']['scale-2.8']
enemies = {e['bossComponentId']:e for e in pose['components']}
axis = np.array([math.cos(pose['model']['rotation'][1]),-math.sin(pose['model']['rotation'][1])])
yaw = pose['model']['rotation'][1]
rotation = np.array([[math.cos(yaw), -math.sin(yaw)], [math.sin(yaw), math.cos(yaw)]])
center = np.array(pose['model']['position'])[[0,2]]

def overlap(scale, shift, part):
    vertices, faces = geometries[part]
    triangles = (vertices @ rotation * scale + center + axis*shift)[faces]
    enemy = enemies[part]; radius = enemy['hitRadius']; target = np.array([enemy['x'],enemy['z']])
    # 81x81 deterministic samples; retain only centers inside the actual target disk.
    ticks = np.linspace(-radius,radius,81); samples = np.array([(x,z) for x in ticks for z in ticks if x*x+z*z<=radius*radius]) + target
    covered = np.zeros(len(samples),dtype=bool)
    for tri in triangles:
        lo, hi = tri.min(axis=0), tri.max(axis=0)
        if np.any(lo>target+radius) or np.any(hi<target-radius): continue
        ids = np.nonzero(~covered & np.all(samples>=lo-1e-9,axis=1) & np.all(samples<=hi+1e-9,axis=1))[0]
        if not len(ids): continue
        edges = np.roll(tri,-1,axis=0)-tri
        if abs(edges[0,0]*(-edges[2,1])-edges[0,1]*(-edges[2,0]))<1e-9: continue
        delta = samples[ids,None,:]-tri
        signs = edges[None,:,0]*delta[:,:,1]-edges[None,:,1]*delta[:,:,0]
        covered[ids] |= np.all(signs>=-1e-9,axis=1) | np.all(signs<=1e-9,axis=1)
    return round(float(covered.mean()*100),2)

rows=[]
for scale in [2.8,3.0,3.1,3.28]:
    for shift in [-.6,-.4,-.2,0,.2]:
        fractions={part:overlap(scale,shift,part) for part in enemies}
        rows.append({'scale':scale,'shiftAlongLocalX':shift,'coveragePercent':fractions,'minimumPercent':min(fractions.values())})
rows.sort(key=lambda row:(row['scale'],-row['minimumPercent']))
result={'method':'Deterministic 81x81 grid clipped to actual0.72-radius combat disks; union of each own component actual GLB triangles projected into world XZ. Rendering-only uniform scale/yaw/translation. Does not claim projectile-collision parity in screen space.','samplesPerDisk':5025,'rows':rows}
(OUT/'target-disk-coverage.json').write_text(json.dumps(result,indent=2)+'\n')
for scale in [2.8,3.0,3.1,3.28]: print(next(row for row in rows if row['scale']==scale))
