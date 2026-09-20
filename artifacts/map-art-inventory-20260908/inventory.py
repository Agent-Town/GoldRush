"""Read-only asset reconciliation. Run from repository root; writes only beside this script."""
import collections, hashlib, json, pathlib, re, subprocess
ROOT=pathlib.Path.cwd(); OUT=pathlib.Path(__file__).resolve().parent
P=pathlib.Path('assets/pilots/map-rebuild-spike')
load=lambda p:json.loads(p.read_text())
source=pathlib.Path('src/world/Terrain3dClaimPilot.ts').read_text()
routes=dict(re.findall(r"'([^']+)': entry\(new URL\('../../assets/pilots/map-rebuild-spike/([^']+)-terrain.glb'",source))
terrains={p.name.removesuffix('-terrain-contract.json'):load(p) for p in P.glob('*-terrain-contract.json')}
packs={p.parent.name:load(p) for p in P.glob('landmarks/*/*-landmark-pack-contract.json')}
issues=[]; objects=[]; maps=[]
def source_paths(v):
 if isinstance(v,str): return [v] if v.startswith('assets/') and '\n' not in v and len(v)<300 else []
 if isinstance(v,dict): return sum((source_paths(x) for x in v.values()),[])
 if isinstance(v,list): return sum((source_paths(x) for x in v),[])
 return []
def locate(p):
 if not p: return None
 for f in [pathlib.Path(p),P/p]:
  if f.is_file():return f
 return None
for name,pack in sorted(packs.items()):
 for id,a in pack['assets'].items():
  file=locate(a['asset']); refs=sorted(set(source_paths(a.get('sources',[]))))
  mounted_by=[k for k,s in routes.items() if any(m.get('asset')==a['asset'] for m in terrains[s].get('landmarkMounts',[]))]
  row={'pack':name,'id':id,'path':str(file) if file else a['asset'],'exists':bool(file),'sourceTier':a.get('sourceTier'),'sources':refs,'missingSources':[r for r in refs if not pathlib.Path(r).is_file()],'declaredTriangles':a.get('triangles'),'mountedBy':mounted_by,'sha256Matches':hashlib.sha256(file.read_bytes()).hexdigest()==a['sha256'] if file and a.get('sha256') else None}
  objects.append(row)
  if row['missingSources'] or row['sha256Matches'] is False or not file:issues.append({'kind':'landmark-record','pack':name,'id':id,**{k:row[k] for k in ['exists','missingSources','sha256Matches']}})
for name,t in sorted(terrains.items()):
 for mount in t.get('landmarkMounts',[]):
  if not locate(mount.get('asset')):issues.append({'kind':'missing-mount-file','terrain':name,'mount':mount})
 if name in packs:
  pm={m['id']:m for m in packs[name].get('mounts',[])}
  for m in t.get('landmarkMounts',[]):
   if pm.get(m['id']) != m:issues.append({'kind':'mount-record-disagreement','terrain':name,'id':m['id'],'terrainMount':m,'packMount':pm.get(m['id'])})
 for s in source_paths(t.get('sourceArt',[])):
  if not pathlib.Path(s).is_file():issues.append({'kind':'missing-terrain-source','terrain':name,'path':s})
for f in sorted(pathlib.Path('assets/contracts').glob('epoch-*/contracts.json'),key=lambda p:int(re.search(r'epoch-(\d+)',str(p))[1])):
 era=int(re.search(r'epoch-(\d+)',str(f))[1])
 for c in load(f)['contracts']:
  id=c['id'];slug=re.sub(r'^e\d+-','',id);s=routes.get(id);t=terrains.get(s,{})
  plates=[p for p in [pathlib.Path(f'assets/raw/plate-contract-{id}.png'),pathlib.Path(f'assets/raw/plate-contract-{slug}.png')] if p.is_file()]
  maps.append({'id':id,'name':c['name'],'era':era,'contract':str(f),'plate':str(plates[0]) if plates else None,'terrain':s,'terrainContract':str(P/f'{s}-terrain-contract.json') if s else None,'terrainGlb':str(P/f'{s}-terrain.glb') if s else None,'panoramaGlb':str(P/f'{s}-panorama.glb') if s else None,'alias':bool(s and s!=slug),'ownPack':slug if slug in packs else None,'ownPackCount':len(packs.get(slug,{}).get('assets',{})),'mountedCount':len(t.get('landmarkMounts',[])),'mountedAssets':[m.get('asset') for m in t.get('landmarkMounts',[])],'sourceArt':t.get('sourceArt',[]),'harvestAnchors':len(c['tileParams']['harvestAnchors']) if 'harvestAnchors' in c['tileParams'] else None,'doorRefusesBySource':c['tileParams'].get('harvestAnchors')==[] and 'harvestFreeObjective' not in c['twist'],'engineDependencies':c['tileParams'].get('engineDependencies',[]),'renderMode':c['tileParams'].get('render',{}).get('terrainMesh'),'dossierShot':str(pathlib.Path(f'reviews/shots-campaign-dossier/{id}.png')) if pathlib.Path(f'reviews/shots-campaign-dossier/{id}.png').exists() else None})
assert len(maps)==len({m['id'] for m in maps})
assert set(routes)<=set(m['id'] for m in maps)
assert all(m['plate'] for m in maps)
raw=list(pathlib.Path('assets/raw').glob('*.png'))
groups={'map concept plates':lambda n:n.startswith('plate-contract-'),'era and valley kits':lambda n:n.startswith(('kit-era-','kit-valley-')),'building art':lambda n:n.startswith(('bld-','facade-')),'terrain art':lambda n:n.startswith(('ter-','terrain-')),'prop and landmark art':lambda n:n.startswith(('prop-','landmark-','node-')),'era building plates':lambda n:bool(re.match(r'plate-e\d+-bld-',n)),'E10 place and object plates':lambda n:n in ['plate-e10-worlds.png','plate-e10-long-table.png','plate-e10-charter-press-hall.png','plate-e10-starlight-pan.png','plate-e10-pan-shrine.png'],'town concepts and kits':lambda n:n.startswith(('concept-town-','kit-town-','tavern-interior-'))}
art={k:[str(p) for p in sorted(raw) if test(p.name)] for k,test in groups.items()}
folders={}
for name in ['assets/raw','assets/processed','assets/processed-full','assets/pilots','assets/reference','assets/layer-contracts']:
 files=[p for p in pathlib.Path(name).rglob('*') if p.is_file()]; folders[name]={'files':len(files),'extensions':dict(collections.Counter(p.suffix for p in files)),'bytes':sum(p.stat().st_size for p in files)}
glb=load(OUT/'glb-audit.json');selected={r['path']:r['family'] for r in glb['rows']}
all_models=[]
for p in sorted(pathlib.Path('assets/pilots').rglob('*.glb')):
 all_models.append({'path':str(p),'family':selected.get(str(p),'outside asset-diet manifest'),'bytes':p.stat().st_size,'sameStemBlend':p.with_suffix('.blend').exists()})
data={'revision':subprocess.check_output(['git','rev-parse','HEAD'],text=True).strip(),'maps':maps,'landmarks':objects,'issues':issues,'artGroups':art,'folders':folders,'models':all_models,'counts':{'maps':len(maps),'plates':len(set(m['plate'] for m in maps)),'routes':len(routes),'terrainContracts':len(terrains),'terrainGlbs':len(list(P.glob('*-terrain.glb'))),'panoramas':len(list(P.glob('*-panorama.glb'))),'packs':len(packs),'landmarkRecords':len(objects),'landmarkGlbs':len(list(P.glob('landmarks/**/*.glb'))),'referencedMountFiles':len(set(a for m in maps for a in m['mountedAssets'])),'selectedLandmarkPackBodies':sum(bool(o['mountedBy']) for o in objects),'sourceTiers':dict(collections.Counter(o['sourceTier'] for o in objects))}}
(OUT/'inventory.json').write_text(json.dumps(data,indent=2)+'\n')
print(json.dumps(data['counts'],indent=2));print('Art groups',{k:len(v) for k,v in art.items()});print('Issues',len(issues),collections.Counter(i['kind'] for i in issues));print('Unselected landmark bodies',[(o['pack'],o['id']) for o in objects if not o['mountedBy']]);print('Door refusals',[m['id'] for m in maps if m['doorRefusesBySource']])
