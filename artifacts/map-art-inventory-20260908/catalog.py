"""Render the measured inventory as a local, linked review catalog; no product changes."""
from pathlib import Path
import html,json,collections
OUT=Path(__file__).resolve().parent;ROOT=OUT.parents[1]
x=json.loads((OUT/'inventory.json').read_text());browser={r['id']:r for r in json.loads((OUT/'browser.json').read_text())}
stations={r['id']:r for r in json.loads((OUT/'browser-stations.json').read_text())} if (OUT/'browser-stations.json').exists() else {}
esc=lambda s:html.escape(str(s),quote=True)
def link(p,label=None):return f'<a href="../../{esc(p)}">{esc(label or Path(p).name)}</a>'
def image(p,label):return f'<figure><a href="{esc(p)}"><img loading="lazy" src="{esc(p)}" alt="{esc(label)}"></a><figcaption>{esc(label)}</figcaption></figure>'
parts=['<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Gold Rush — map and object art inventory</title><style>body{font:16px/1.55 system-ui;background:#f5f1e8;color:#282820;max-width:1400px;margin:30px auto;padding:0 22px}a{color:#126060}nav{display:flex;gap:18px;flex-wrap:wrap}article{border-top:2px solid #b9ac93;padding:20px 0}h1,h2,h3{line-height:1.2}figure{margin:0}img{width:100%;height:auto;background:#292720}figcaption{font-size:13px}.pair{display:grid;grid-template-columns:1fr 1fr;gap:14px}.objects{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}summary{cursor:pointer;padding:10px 0}table{border-collapse:collapse;width:100%}td,th{text-align:left;vertical-align:top;border-bottom:1px solid #cdbfa9;padding:8px}code{overflow-wrap:anywhere}.warning{background:#ffdfb9;padding:15px}small{color:#655c4e}@media(max-width:750px){.pair,.objects{grid-template-columns:1fr}}</style><h1>Gold Rush — maps, objects, and their art</h1>',f'<p>Measured 8 September 2026 · source revision <code>{x["revision"]}</code>.</p>','<p>42 map concepts and 42 desktop + 42 mobile debug boots. 32 terrain sculpts, 32 panoramas, 196 landmark bodies. Each image opens at full size. These are inventory and visual-triage records, not owner approval or full gameplay gates.</p>','<p class="warning">Deepwater Claim, Stillwater and Flotilla skip all four declared drowned buildings. Five alias-map packs (25 bodies) are not selected. The earliest five packs (25 bodies) have stale hashes and triangle declarations. See the findings report before revising or regenerating assets.</p>','<nav><a href="../../reviews/sol-findings-map-art-inventory-20260908.md">Findings report</a><a href="landmarks.md">All 196 landmarks</a><a href="models.md">All 444 GLBs</a><a href="inventory.json">Measured data</a><a href="#art">Art reference library</a>',''.join(f'<a href="#era-{e}">E{e}</a>' for e in range(1,11)),'</nav>']
for era in range(1,11):
 parts.append(f'<h2 id="era-{era}">Era {era}</h2><p><a href="comparisons/era-{era}.png">Full concept / spawn-camera comparison sheet</a></p>')
 for m in [m for m in x['maps'] if m['era']==era]:
  r=browser[m['id']];d=r.get('dataset',{});complete=d.get('terrain3dPilotLandmarkSkipped')=='0';note=(f"{d.get('terrain3dPilotLandmarks','?')}/{m['mountedCount']} landmarks mounted" if m['terrain'] else 'Painted/procedural route; no sculpt registry entry')
  parts.append(f'<article id="{m["id"]}"><h3>{esc(m["name"])} <small>{m["id"]}</small></h3><p>{esc(note)} · {link(m["contract"],"gameplay contract")}'+(f' · {link(m["terrainContract"],"terrain contract")} · {link(m["terrainGlb"],"terrain GLB")} · {link(m["panoramaGlb"],"panorama GLB")}' if m['terrain'] else '')+f' · <a href="shots-mobile/{m["id"]}.png">390px mobile</a></p>')
  if m['alias']:parts.append(f'<p><strong>Intentional terrain reuse: {esc(m["terrain"])}</strong>. Own pack on disk: {m["ownPackCount"]} bodies; the runtime uses the host terrain’s mounts.</p>')
  if d.get('terrain3dPilotLandmarkDiagnostics'):parts.append(f'<p class="warning">{esc(d["terrain3dPilotLandmarkDiagnostics"])}</p>')
  parts.append('<div class="pair">'+image('../../'+m['plate'],'Concept plate — different vantage')+image(r['shot'],'Current desktop spawn camera — full viewport')+'</div>')
  body=[o for o in x['landmarks'] if m['id'] in o['mountedBy']]
  parts.append('<details><summary>Mounted body files and declared sources</summary><ul>')
  for o in body:parts.append(f'<li>{link(o["path"],o["id"])} — {o["sourceTier"]}; '+('; '.join(link(p) for p in o['sources']) or 'no declared image source')+('</li>'))
  if not body:parts.append('<li>No landmark-pack body selected. Inspect the terrain mount list above for non-pack references.</li>')
  parts.append('</ul></details>')
  station=stations.get(m['id']) or next((v for id,v in stations.items() if next(z for z in x['maps'] if z['id']==id)['terrain']==m['terrain']),None)
  if station and station.get('stations'):
   parts.append('<details><summary>Views beside every mounted landmark — host map, current game camera</summary><p>Debug teleport to each mount, with the player six units in front. This is a camera inspection, not a traversal or collision test. Aliases show their host’s object views.</p><div class="objects">'+''.join(image(s['shot'],s['id']) for s in station['stations'])+'</div></details>')
  parts.append('</article>')
parts.append('<h2 id="art">World-art reference library</h2><p>203 raw PNGs selected by the explicit filename families below; this is a scoped subset of 649 raw PNGs. It includes source sheets and variants, not 203 unique approved designs. Character, motion, marketing and most enemy/boss artwork are outside this subset.</p>')
for family,files in x['artGroups'].items():parts.append(f'<details><summary>{esc(family)} — {len(files)} files</summary><div class="objects">'+''.join(image('../../'+p,Path(p).name) for p in files)+'</div></details>')
parts.append('</html>');(OUT/'index.html').write_text('\n'.join(parts))
# Human-scannable matrix backed by the JSON.
lines=['# Map inventory — 2026-09-08','','Every row has an existing raw concept plate. Mounted counts below are fresh desktop readings; mobile readings are in browser-mobile.json. Aliases deliberately reuse the host sculpt. A successful boot is not a complete art verdict.','','| Era | Map / ID | Concept | Sculpt selected | Own pack bodies | Actual / expected mounts | Desktop evidence |','|---:|---|---|---|---:|---:|---|']
for m in x['maps']:
 d=browser[m['id']].get('dataset',{});lines.append(f"| {m['era']} | {m['name']} (`{m['id']}`) | [{Path(m['plate']).name}](../../{m['plate']}) | {m['terrain'] or 'painted/procedural'}{' (reuse)' if m['alias'] else ''} | {m['ownPackCount']} | {d.get('terrain3dPilotLandmarks','—')} / {m['mountedCount'] if m['terrain'] else '—'} | [frame]({browser[m['id']]['shot']}) |")
(OUT/'maps.md').write_text('\n'.join(lines)+'\n');print('Catalog and 42-row map matrix written')
