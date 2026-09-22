from pathlib import Path
import hashlib,json,subprocess,struct
out=Path(__file__).parent;pilot=Path('assets/pilots/map-rebuild-spike');store=Path('/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets');base=json.loads((out/'base.json').read_text())
old=lambda p:subprocess.check_output(['git','-C',str(store),'show',base['store']+':pilots/map-rebuild-spike/'+p])
paths=['ember-shore-terrain.glb','ember-shore-terrain.blend','ember-shore-terrain-contract.json','ember-shore-terrain-atlas.png','ember-shore-panorama-atlas.png','landmark-collision-contract.json','landmarks/landmark-source-ledger.json']
paths += [str(p.relative_to(pilot)) for p in (pilot/'landmarks/ember-shore').iterdir() if p.suffix in ['.json','.glb','.blend','.png']]
unchanged={}
for p in paths:
    data=(pilot/p).read_bytes();assert data==old(p),p;unchanged[p]=hashlib.sha256(data).hexdigest()
def positions(data):
    n=struct.unpack_from('<I',data,12)[0];d=json.loads(data[20:20+n]);binary=data[28+n:];result=[]
    for mesh in d['meshes']:
        for p in mesh['primitives']:
            a=d['accessors'][p['attributes']['POSITION']];v=d['bufferViews'][a['bufferView']];start=v.get('byteOffset',0)+a.get('byteOffset',0);stride=v.get('byteStride',12)
            result += [struct.unpack_from('<fff',binary,start+i*stride) for i in range(a['count'])]
    return set(result)

# The native albedo is additional; original heat-paint bytes and all geometry stay exact.
def glb(data):
    n=struct.unpack_from('<I',data,12)[0];return json.loads(data[20:20+n]),data[28+n:]
def triangles(data):
    doc,binary=glb(data)
    def values(index):
        a=doc['accessors'][index];v=doc['bufferViews'][a['bufferView']];kind={5126:'f',5125:'I',5123:'H'}[a['componentType']];count={'SCALAR':1,'VEC3':3}[a['type']];fmt='<'+kind*count;size=struct.calcsize(fmt);start=v.get('byteOffset',0)+a.get('byteOffset',0)
        return [struct.unpack_from(fmt,binary,start+i*v.get('byteStride',size)) for i in range(a['count'])]
    result=[]
    for mesh in doc['meshes']:
        for primitive in mesh['primitives']:
            verts=values(primitive['attributes']['POSITION']);idx=[v[0] for v in values(primitive['indices'])]
            result += [tuple(sorted(verts[j] for j in idx[i:i+3])) for i in range(0,len(idx),3)]
    return sorted(result)
def images(data):
    doc,binary=glb(data);result=[]
    for image in doc['images']:
        v=doc['bufferViews'][image['bufferView']];start=v.get('byteOffset',0);result.append(binary[start:start+v['byteLength']])
    return result
old_terrain=old('ember-shore-terrain.glb');new_terrain=(pilot/'ember-shore-terrain.glb').read_bytes()
assert triangles(old_terrain)==triangles(new_terrain)
assert positions(old_terrain)==positions(new_terrain)
assert all(image in images(new_terrain) for image in images(old_terrain)),'heat texture bytes changed'
prior=json.loads(old('ember-shore-terrain-contract.json'));current=json.loads((pilot/'ember-shore-terrain-contract.json').read_text())
for d in [prior,current]:
    for key in ['texture','sourceArt','files']:d.pop(key,None)
assert prior==current,'terrain bounds, masks, mounts, stations or height metadata changed'

before=positions(old('ember-shore-panorama.glb'));after=positions((pilot/'ember-shore-panorama.glb').read_bytes())
assert before.issubset(after),'existing scenery vertices moved'
added=after-before
assert not added,'panorama geometry changed'
authorities=['src/game','src/sim','assets/contracts','src/world/Terrain.ts','src/world/LandmarkCollision.ts','src/systems','e2e','assets/engine-era.json']
for path in authorities:assert not subprocess.check_output(['git','diff',base['code'],'--',path]),path
source=Path('src/world/Terrain3dClaimPilot.ts').read_text();original=subprocess.check_output(['git','show',base['code']+':src/world/Terrain3dClaimPilot.ts'],text=True)
def without_paint(text):
    i=text.index('function clarifyEmberBasalt(');start=text.rfind('/**',0,i);end=text.index('/** Dry canal',i);return text[:start]+text[end:]
added_call="      if (host.contractId === 'e10-ember-shore') clarifyEmberBasalt(nextPanorama, selected.detailTextureUrl, true);\n"
start=source.index("  if (contractId === 'e10-ember-shore') {\n    // The two surfaces");end=source.index('  geometry.computeBoundingSphere();',start)
without_normals=source[:start]+source[end:]
normalized=without_normals.replace(added_call,'')
normalized=normalized.replace('; detailTextureUrl?: string };',' };').replace(', detailTextureUrl?: string): Entry =>','): Entry =>').replace(' as PanoramaContract, detailTextureUrl };',' as PanoramaContract };')
normalized=normalized.replace("emberShorePanoramaContractText, undefined, new URL('../../assets/pilots/map-rebuild-spike/sources/ember-shore-fidelity-1/engraved-basalt.png', import.meta.url).href)","emberShorePanoramaContractText)")
normalized=normalized.replace('clarifyEmberBasalt(nextTerrain, selected.detailTextureUrl);','clarifyEmberBasalt(nextTerrain);').replace('clarifyEmberBasalt(nextSkirt, selected.detailTextureUrl);','clarifyEmberBasalt(nextSkirt);')
assert without_paint(normalized)==without_paint(original),'outside named material/call/optional atlas URL routing changed' 
for truth in ['float emberWarm = clamp((diffuseColor.r - max(diffuseColor.g, diffuseColor.b) * 1.8) * 18.0, 0.0, 1.0);','float emberPlayfield = 1.0 - smoothstep(63.8, 64.0, max(abs(vEmberBasalt.x), abs(vEmberBasalt.z)));']:
    assert truth in original and truth in source
registry=[s for s in source.splitlines() if s.lstrip().startswith(tuple("'e%d-"%i for i in range(2,11))) and ': entry(' in s];assert len(registry)==36 and all(s.rstrip().endswith('),') for s in registry)
result={'unchangedBytes':unchanged,'terrainHeightAndMaskTruthUnchanged':True,'terrainTriangleSurfacesExact':True,'heatAtlasEmbeddedBytesUnchanged':True,'boundsMountsStationsCollisionUnchanged':True,'existingPanoramaPositionsUnchanged':True,'addedSceneryUniquePositions':len(added),'minimumAddedChebyshevRadiusMeters':None,'onlyNamedRenderFunctionPanoramaCallAndSceneryNormalsChanged':True,'heatPixelsAndPlayfieldRestrictionPreserved':True,'singleLineRegistryEntries':len(registry),'protectedAuthorities':authorities}
(out/'invariants.json').write_text(json.dumps(result,indent=2)+'\n');print('EMBER INVARIANTS PASS')
