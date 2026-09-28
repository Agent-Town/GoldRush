from pathlib import Path
import hashlib,json,subprocess,struct
out=Path(__file__).parent;pilot=Path('assets/pilots/map-rebuild-spike');store=Path('/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets');base=json.loads((out/'base.json').read_text())
old=lambda p:subprocess.check_output(['git','-C',str(store),'show',base['store']+':pilots/map-rebuild-spike/'+p])
paths=['archive-world-terrain.glb','archive-world-terrain.blend','archive-world-terrain-contract.json','archive-world-terrain-atlas.png','archive-world-panorama-atlas.png','landmark-collision-contract.json','landmarks/landmark-source-ledger.json']
paths += [str(p.relative_to(pilot)) for p in (pilot/'landmarks/archive-world').iterdir() if p.suffix in ['.json','.glb','.blend','.png']]
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
old_terrain=old('archive-world-terrain.glb');new_terrain=(pilot/'archive-world-terrain.glb').read_bytes()
assert triangles(old_terrain)==triangles(new_terrain)
assert positions(old_terrain)==positions(new_terrain)
assert all(image in images(new_terrain) for image in images(old_terrain)),'original terrain atlas bytes changed'
prior=json.loads(old('archive-world-terrain-contract.json'));current=json.loads((pilot/'archive-world-terrain-contract.json').read_text())
for d in [prior,current]:
    for key in ['texture','sourceArt','files']:d.pop(key,None)
assert prior==current,'terrain bounds, masks, mounts, stations or height metadata changed'

from collections import Counter
prior_faces=Counter(triangles(old('archive-world-panorama.glb')));current_faces=Counter(triangles((pilot/'archive-world-panorama.glb').read_bytes()))
assert all(current_faces[face]>=count for face,count in prior_faces.items()),'existing panorama faces changed'
before=positions(old('archive-world-panorama.glb'));after=positions((pilot/'archive-world-panorama.glb').read_bytes())
assert before.issubset(after),'existing scenery vertices moved'
added=after-before
assert added and all(max(abs(x),abs(z))>64.01 for x,y,z in added),'new scenery enters playable square'
authorities=['src/game','src/sim','assets/contracts','src/world/Terrain.ts','src/world/LandmarkCollision.ts','src/systems','e2e','assets/engine-era.json']
for path in authorities:assert not subprocess.check_output(['git','diff',base['code'],'--',path]),path
source=Path('src/world/Terrain3dClaimPilot.ts').read_text();original=subprocess.check_output(['git','show',base['code']+':src/world/Terrain3dClaimPilot.ts'],text=True)
def without_paint(text):
    i=text.index('function clarifyArchiveTerraces(');end=text.index('/** Shared basalt',i);return text[:i]+text[end:]
normalized=source
for call in ["      if (host.contractId === 'e10-archive-world') prepareArchiveLibrary(nextPanorama, selected.detailTextureUrl);\n", "          if (host.contractId === 'e10-archive-world') lightArchiveFacade(model, host.archiveRestoration);\n"]:
    normalized=normalized.replace(call,'')
start=normalized.index("  if (contractId === 'e10-archive-world') {\n    // The floor must");end=normalized.index('  // THE ATMOSPHERICS SHIFT',start);normalized=normalized[:start]+normalized[end:]
normalized=normalized.replace("archiveWorldPanoramaContractText, undefined, new URL('../../assets/pilots/map-rebuild-spike/sources/archive-world-fidelity-1/engraved-masonry.png', import.meta.url).href)","archiveWorldPanoramaContractText)")
for object in ['nextTerrain','nextSkirt']:
    normalized=normalized.replace(f'clarifyArchiveTerraces({object}, host.archiveRestoration, selected.detailTextureUrl);',f'clarifyArchiveTerraces({object}, host.archiveRestoration);')
assert without_paint(normalized)==without_paint(original),'outside named Archive presentation blocks changed'
assert 'restored.value[index] = state?.restoredWingIds.includes(zone.id) ? 1 : 0;' in source
registry=[s for s in source.splitlines() if s.lstrip().startswith(tuple("'e%d-"%i for i in range(2,11))) and ': entry(' in s];assert len(registry)==36 and all(s.rstrip().endswith('),') for s in registry)
result={'unchangedBytes':unchanged,'terrainHeightAndMaskTruthUnchanged':True,'terrainTriangleSurfacesExact':True,'originalAtlasEmbeddedBytesUnchanged':True,'boundsMountsStationsCollisionUnchanged':True,'existingPanoramaPositionsUnchanged':True,'existingPanoramaTriangleSurfacesUnchanged':True,'addedSceneryUniquePositions':len(added),'minimumAddedChebyshevRadiusMeters':min(max(abs(x),abs(z)) for x,y,z in added),'onlyArchivePresentationChanged':True,'earnedPoolFlagPreserved':True,'singleLineRegistryEntries':len(registry),'protectedAuthorities':authorities}
(out/'invariants.json').write_text(json.dumps(result,indent=2)+'\n');print('ARCHIVE INVARIANTS PASS')
