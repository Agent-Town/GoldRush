"""Measure each combat disk's overlap with its component's actual XZ triangles."""
from pathlib import Path
import json, math, struct
import numpy as np
ROOT = Path(__file__).resolve().parents[3]
OUT = Path(__file__).resolve().parent / 'after'
raw = (ROOT / 'assets/pilots/crawler-3d/crawler.glb').read_bytes()
length = struct.unpack_from('<I', raw, 12)[0]
doc = json.loads(raw[20:20+length]); binary = 28 + length

def accessor(index):
    a = doc['accessors'][index]
    kinds={5120:'b',5121:'B',5122:'h',5123:'H',5125:'I',5126:'f'}
    kind=kinds[a['componentType']]; count={'SCALAR':1,'VEC3':3}[a['type']]
    def read(view_id, byte_offset, n, item_kind, item_count):
        view=doc['bufferViews'][view_id]
        offset=binary+view.get('byteOffset',0)+byte_offset
        stride=view.get('byteStride',struct.calcsize(item_kind)*item_count)
        return np.array([struct.unpack_from('<'+item_kind*item_count,raw,offset+i*stride) for i in range(n)])
    values=read(a['bufferView'],a.get('byteOffset',0),a['count'],kind,count) if 'bufferView' in a else np.zeros((a['count'],count))
    if 'sparse' in a:
        sparse=a['sparse']; indices=sparse['indices']; changes=sparse['values']
        ids=read(indices['bufferView'],indices.get('byteOffset',0),sparse['count'],kinds[indices['componentType']],1).flatten().astype(int)
        values[ids]=read(changes['bufferView'],changes.get('byteOffset',0),sparse['count'],kind,count)
    return values

geometries = {}
for node in doc['nodes']:
    if 'mesh' not in node: continue
    primitive = doc['meshes'][node['mesh']]['primitives'][0]
    geometries[node['name']] = (accessor(primitive['attributes']['POSITION']), accessor(primitive['targets'][0]['POSITION']), accessor(primitive['indices']).flatten().reshape(-1,3))
def matrix_for(pose):
    x,y,z = pose['model']['rotation'][:3]
    cx,sx,cy,sy,cz,sz = math.cos(x),math.sin(x),math.cos(y),math.sin(y),math.cos(z),math.sin(z)
    rx=np.array([[1,0,0],[0,cx,-sx],[0,sx,cx]])
    ry=np.array([[cy,0,sy],[0,1,0],[-sy,0,cy]])
    rz=np.array([[cz,-sz,0],[sz,cz,0],[0,0,1]])
    return rx@ry@rz

def overlap(pose, part):
    vertices, morph, faces = geometries[part]
    state = next(m for m in pose['meshes'] if m['name']==part)['influence'][0]
    points = ((vertices + morph*state) * np.array(pose['model']['scale'])) @ matrix_for(pose).T + np.array(pose['model']['position'])
    triangles = points[:,[0,2]][faces]
    enemy = next(e for e in pose['components'] if e['bossComponentId']==part); radius = enemy['hitRadius']; target = np.array([enemy['x'],enemy['z']])
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

import copy
j=json.loads((Path(__file__).resolve().parent/'lifecycle/lifecycle-report.json').read_text())
results=[]
for i,p in enumerate(j['route']):
    parts={e['id']:e for e in p['parts']};center=np.array(p['model']['position'])+np.array([math.cos(math.atan2(80,34)),0,-math.sin(math.atan2(80,34))])*.6
    for id,offset in [('drain_mast',-4),('tracks',0),('capacitor_bank',4)]: parts[id]['position']=(center+np.array([math.cos(math.atan2(80,34)),0,-math.sin(math.atan2(80,34))])*offset).tolist()
    mast,cap=parts['drain_mast']['position'],parts['capacitor_bank']['position']
    span=math.hypot(cap[0]-mast[0],cap[2]-mast[2]);yaw=math.atan2(mast[2]-cap[2],cap[0]-mast[0]);axis=np.array([math.cos(yaw),0,-math.sin(yaw)])
    pose={'model':p['model'],'meshes':[{'name':k,'influence':[v]} for k,v in p['morphs'].items()],'components':[{'bossComponentId':e['id'],'x':e['position'][0],'z':e['position'][2],'hitRadius':e['hitRadius']} for e in p['parts']]}
    rows=[]
    for pivot in [1.1]:
      q=copy.deepcopy(pose)
      up=matrix_for(pose)@np.array([0,1,0]);delta=axis*.15-up*3.1*pivot;delta[1]=0
      q['model']['position']=(np.array(pose['model']['position'])+delta).tolist()
      coverage={e['id']:overlap(q,e['id']) for e in p['parts']}
      rows.append({'pivotLocalY':pivot,'worldCorrectionXZ':delta[[0,2]].tolist(),'coverage':coverage,'min':min(coverage.values())})
    rows.sort(key=lambda row:-row['min']);results.append({'route':i,'span':span,'rows':rows})
    print('route',i,'span',span,'best',rows[:4],flush=True)
(Path(__file__).resolve().parent/'runtime-fit/tilt-pivot-selected.json').write_text(json.dumps({'method':'Diagnostic only:41x41 disk samples; observed rotation held fixed, nominal8wu formation reconstructed around observed root center before -.6 shift. Constant3.1scale, base shift-.45; raising local tilt pivot to0.9-1.2 while retaining actual fittedrotation. Terrain not refitted in offline isolation.','results':results},indent=2)+'\n')
