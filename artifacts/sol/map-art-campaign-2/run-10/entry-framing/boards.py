from pathlib import Path
import json, sys
from PIL import Image, ImageDraw, ImageFont
root=Path('artifacts/sol/map-art-campaign-2/run-10/entry-framing');name=sys.argv[1];out=root/name
if len(sys.argv)>2:out=out/sys.argv[2]
rows=json.loads((out/'captures.json').read_text())
font=ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial.ttf',22)
small=ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial.ttf',17)
metrics=[]
for width in [1280,390]:
 before=next(r for r in rows if r['width']==width and r['arm']=='before');after=next(r for r in rows if r['width']==width and r['arm']=='after')
 duration=out/'duration.json'
 timing=next(r for r in json.loads(duration.read_text()) if r['width']==width) if duration.exists() else after
 samples=timing['census']['samples']; visible=[(i,s) for i,s in enumerate(samples) if s['pixels']>0]
 # Sum disjoint visible intervals: an already-visible secondary can disappear
 # during the other stop and return later. First-to-last would count the gap.
 lower=sum(b['seconds']-a['seconds'] for a,b in zip(samples,samples[1:]) if a['pixels']>0 and b['pixels']>0)
 upper=sum(b['seconds']-a['seconds'] for a,b in zip(samples,samples[1:]) if a['pixels']>0 or b['pixels']>0)
 m={'width':width,'mountId':after['entry']['mountId'],'triggered':after['triggered'],'landmarkTargeted':after.get('targeted',after['triggered']),'restPixels':before['frames']['rest']['pixels'],'peakPixels':after['frames']['peak']['pixels'],'returnPixels':after['frames']['return']['pixels'],'observedVisibleSecondsLower':round(lower,3),'observedVisibleSecondsUpper':round(upper,3),'observationSeconds':round(samples[-1]['seconds'],3),'durationCensored':bool(visible and (visible[0][0]==0 or visible[-1][0]==len(samples)-1)),'consoleErrors':len(before['errors'])+len(after['errors'])}
 metrics.append(m)
 cellw=max(width,640);cellh=800 if width==1280 else 844;pad=24;head=82
 board=Image.new('RGB',(cellw*2+pad*3,(cellh+head)*2+pad*3),(30,26,23));draw=ImageDraw.Draw(board)
 for i,(label,path) in enumerate([('Reference plate',Path(f"assets/raw/plate-contract-{name.removeprefix('e1-')}.png")),(f'Rest: {m["restPixels"]:,} body pixels',out/f'rest-{width}.png'),(f'Peak: {m["peakPixels"]:,} body pixels',out/f'peak-{width}.png'),(f'Return: {m["returnPixels"]:,} body pixels',out/f'return-{width}.png')]):
  x=pad+(i%2)*(cellw+pad);y=pad+(i//2)*(cellh+head+pad)
  draw.text((x,y),label,font=font,fill=(245,231,206));draw.text((x,y+30),f'{name} | {width}px | '+('other landmark glances; this body skipped' if after.get('targeted') is False and after['triggered'] else 'glance' if after['triggered'] else 'already visible: no glance'),font=small,fill=(201,188,162))
  image=Image.open(path).convert('RGB');image.thumbnail((cellw,cellh));board.paste(image,(x+(cellw-image.width)//2,y+head+(cellh-image.height)//2))
 board.save(out/f'board-{width}.png')
(out/'metrics.json').write_text(json.dumps(metrics,indent=2)+'\n')
print(json.dumps(metrics,indent=2))
