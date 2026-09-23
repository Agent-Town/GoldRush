from pathlib import Path
from PIL import Image,ImageDraw
import numpy as np
p=Path('artifacts/sol/map-art-campaign-2/run-9/e4-boneyard')
for width in [1280,390]:
 for focus,station in [('half-buried-sleeper',8),('flivver-row-west-b',5),('flivver-row-east-b',5)]:
  crops=[]
  for arm in ['before','after']:
   b=p/f'station-{arm}-{focus}-{station}-{width}'
   a=np.asarray(Image.open(str(b)+'-mask.png').convert('RGB'));m=(a[:,:,0]>178)&(a[:,:,1]<62)&(a[:,:,2]>178);ys,xs=np.where(m)
   box=(max(0,int(xs.min())-15),max(0,int(ys.min())-15),min(width,int(xs.max())+16),min(a.shape[0],int(ys.max())+16))
   im=Image.open(str(b)+'-normal.png').crop(box);im=im.resize((im.width*3,im.height*3))
   board=Image.new('RGB',(im.width,im.height+32),'white');board.paste(im,(0,32));ImageDraw.Draw(board).text((12,10),arm,fill='black');crops.append(board)
  out=Image.new('RGB',(sum(i.width for i in crops),max(i.height for i in crops)),(255,255,255));x=0
  for i in crops:out.paste(i,(x,0));x+=i.width
  out.save(p/f'crop-{focus}-{width}.png')
