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
 if visible:
  first,last=visible[0][0],visible[-1][0];lower=samples[last]['seconds']-samples[first]['seconds'];upper=samples[min(last+1,len(samples)-1)]['seconds']-samples[max(first-1,0)]['seconds']
 else:lower=upper=0
 m={'width':width,'mountId':after['entry']['mountId'],'triggered':after['triggered'],'restPixels':before['frames']['rest']['pixels'],'peakPixels':after['frames']['peak']['pixels'],'returnPixels':after['frames']['return']['pixels'],'observedVisibleSecondsLower':round(lower,3),'observedVisibleSecondsUpper':round(upper,3),'observationSeconds':round(samples[-1]['seconds'],3),'durationCensored':bool(visible and (visible[0][0]==0 or visible[-1][0]==len(samples)-1)),'consoleErrors':len(before['errors'])+len(after['errors'])}
 metrics.append(m)
 cellw=max(width,640);cellh=800 if width==1280 else 844;pad=24;head=82
 board=Image.new('RGB',(cellw*2+pad*3,(cellh+head)*2+pad*3),(30,26,23));draw=ImageDraw.Draw(board)
 for i,(label,path) in enumerate([('Reference plate',Path(f"assets/raw/plate-contract-{name.removeprefix('e1-')}.png")),(f'Rest: {m["restPixels"]:,} body pixels',out/f'rest-{width}.png'),(f'Peak: {m["peakPixels"]:,} body pixels',out/f'peak-{width}.png'),(f'Return: {m["returnPixels"]:,} body pixels',out/f'return-{width}.png')]):
  x=pad+(i%2)*(cellw+pad);y=pad+(i//2)*(cellh+head+pad)
  draw.text((x,y),label,font=font,fill=(245,231,206));draw.text((x,y+30),f'{name} | {width}px | '+('glance' if after['triggered'] else 'already visible: no glance'),font=small,fill=(201,188,162))
  image=Image.open(path).convert('RGB');image.thumbnail((cellw,cellh));board.paste(image,(x+(cellw-image.width)//2,y+head+(cellh-image.height)//2))
 board.save(out/f'board-{width}.png')
(out/'metrics.json').write_text(json.dumps(metrics,indent=2)+'\n')
print(json.dumps(metrics,indent=2))
