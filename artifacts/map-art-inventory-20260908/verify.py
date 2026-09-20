"""Fail if this inventory omits a map, a selected body, evidence image, or a local catalog target."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import unquote,urlsplit
import json
out=Path(__file__).resolve().parent
load=lambda n:json.loads((out/n).read_text())
inv=load('inventory.json');maps={m['id']:m for m in inv['maps']}
assert len(maps)==42
for filename in ['browser.json','browser-mobile.json']:
 rows=load(filename)
 assert len(rows)==42 and {r['id'] for r in rows}==set(maps)
 for r in rows:
  assert r['door']['game']==r['id']==r['door']['diagnostics']['activeId']
  assert not r['errors'] and (out/r['shot']).is_file()
  if maps[r['id']]['terrain']:
   d=r['dataset'];assert d['terrain3dPilotState']=='ready'
   assert int(d['terrain3dPilotLandmarks'])+int(d['terrain3dPilotLandmarkSkipped'])==maps[r['id']]['mountedCount']
rows=load('browser-stations.json');assert len(rows)==32
assert sum(len(r.get('stations',[])) for r in rows)==171
for r in rows:
 assert not r['errors']
 assert {s['id'] for s in r['stations']}=={s['id'] for s in json.loads(r['dataset'].get('terrain3dPilotLandmarkMounts','[]'))}
 for s in r['stations']:assert (out/s['shot']).is_file()
glb=load('glb-audit.json');assert len(glb['rows'])==412 and not glb['live'] and not glb['stale']
assert len(inv['landmarks'])==196 and all(o['exists'] and not o['missingSources'] for o in inv['landmarks'])
assert len(load('models.json'))==444
class Links(HTMLParser):
 def handle_starttag(self,tag,attrs):
  for key,value in attrs:
   if key not in ['src','href'] or value.startswith('#'):continue
   url=urlsplit(value)
   if not url.scheme:assert (out/unquote(url.path)).is_file(),value
Links().feed((out/'index.html').read_text())
print('PASS: 84 map boots, 32 sculpt sessions, 171 body views, 196 source records, 444 model rows, 412 guard assets, all catalog targets.')
