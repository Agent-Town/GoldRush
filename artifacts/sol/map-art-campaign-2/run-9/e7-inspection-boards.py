"""Unretouched station crops, using the same projected bounds in both arms."""
from pathlib import Path
import json
from PIL import Image,ImageDraw,ImageFont
p=Path('artifacts/sol/map-art-campaign-2/run-9/e7-dead-band')
rows=json.loads((p/'visual-metrics.json').read_text())['stations']
font=ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc',18)
for width in [1280,390]:
    panels=[]
    for focus in ['iron-shadow-warning-frame','north-silence-gate']:
        b=next(r['projectedBounds'] for r in rows if r['arm']=='after' and r['focus']==focus and r['station']==3 and r['width']==width)
        box=(max(0,int(b['minX'])-15),max(0,int(b['minY'])-15),min(width,int(b['maxX'])+16),int(b['maxY'])+16)
        crops=[Image.open(p/f'station-{arm}-{focus}-3-{width}-normal.png').convert('RGB').crop(box) for arm in ['before','after']]
        panel=Image.new('RGB',(crops[0].width*2,55+crops[0].height),(31,31,29));d=ImageDraw.Draw(panel)
        d.text((8,5),f'{focus} | 3 m | {width}px',font=font,fill='white')
        for i,im in enumerate(crops):panel.paste(im,(i*im.width,55));d.text((i*im.width+8,30),['BEFORE','AFTER'][i],font=font,fill='white')
        panels.append(panel)
    out=Image.new('RGB',(max(x.width for x in panels),sum(x.height for x in panels)+12),(31,31,29));y=0
    for panel in panels:out.paste(panel,(0,y));y+=panel.height+12
    out.save(p/f'inspection-board-{width}.png')
