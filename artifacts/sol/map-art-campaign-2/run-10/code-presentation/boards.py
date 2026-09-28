from PIL import Image, ImageDraw, ImageFont
from pathlib import Path
root=Path(__file__).parent
maps={'e1-twin-banks':['plain','entry','homestead','river'],'e2-trestle':['plain','entry','crossing','join','end'],'e7-relay-rush':['plain','entry','r2','active','muted','restored'],'e2-hill-mine':['entry','end','bend'],'e2-incline':['entry','end'],'e3-canyon-works':['entry','end','join','turnaround']}
font=ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial.ttf',20)
for mid,stations in maps.items():
 for width in [1280,390]:
  stations=[s for s in stations if (root/mid/f'before-{s}-{width}.png').exists() and (root/mid/f'after-{s}-{width}.png').exists()]
  if not stations: continue
  thumbw=640 if width==1280 else 390
  thumbh=round((800 if width==1280 else 844)*thumbw/width)
  board=Image.new('RGB',(thumbw*2,(thumbh+32)*len(stations)+36),'#182127');d=ImageDraw.Draw(board);d.text((10,6),f'{mid} | {width}px | BEFORE / AFTER',font=font,fill='white')
  for row,station in enumerate(stations):
   y=36+row*(thumbh+32);d.text((10,y+3),station,font=font,fill='white')
   for col,arm in enumerate(['before','after']):
    im=Image.open(root/mid/f'{arm}-{station}-{width}.png').convert('RGB').resize((thumbw,thumbh),Image.Resampling.LANCZOS)
    board.paste(im,(col*thumbw,y+32))
  board.save(root/mid/f'board-{width}.png')
