"""Labelled, unretouched before/after crops for independent visual review."""
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
import json,sys
name=sys.argv[1];p=Path(__file__).parent/name;font=ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc',20)
rows=([{'file':'water-bank-crop-2x.png','source':'{arm}-frozen-1280.png','box':[210,135,795,390],'scale':2,'layout':'vertical'}] if name=='e2-pressure-garden' else [{'file':f'cable-house-comparison-{w}.png','source':f'station-{{arm}}-upper-ore-cable-house-new5-{w}-normal.png','box':box,'scale':scale,'layout':'horizontal'} for w,box,scale in [(1280,[475,215,795,460],3),(390,[20,220,355,485],2)]])
for r in rows:
 a,b=[Image.open(p/r['source'].format(arm=arm)).convert('RGB').crop(r['box']) for arm in ['before','after']];w,h=a.width*r['scale'],a.height*r['scale'];vertical=r['layout']=='vertical';board=Image.new('RGB',(w if vertical else w*2,(h+28)*2 if vertical else h+28),'#20201e');d=ImageDraw.Draw(board)
 for i,im in enumerate([a,b]):
  x,y=(0,i*(h+28)) if vertical else (i*w,0);board.paste(im.resize((w,h)),(x,y+28));d.text((x+8,y+3),['BEFORE','AFTER'][i],fill='white',font=font)
 board.save(p/r['file'])
(p/'crop-method.json').write_text(json.dumps(rows,indent=2)+'\n')
