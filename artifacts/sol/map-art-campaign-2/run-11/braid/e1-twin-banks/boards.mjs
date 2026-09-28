import sharp from 'sharp';
import {writeFileSync} from 'node:fs';
const out='artifacts/sol/map-art-campaign-2/run-11/braid/e1-twin-banks';
const metrics=[];
for(const width of [1280,390])for(const view of ['entry-glance','plain','braid','source-pool']){
 const w=width===1280?640:390,h=width===1280?400:844;
 const sources=[`${out}/before-${view}-${width}.png`,`${out}/after-${view}-${width}.png`,'assets/raw/plate-contract-twin-banks.png'];
 const labels=[`Before: ${view} / ${width}px`,`After: ${view} / ${width}px`,'Reference plate (not a pixel target)'];
 const layers=[];
 for(let i=0;i<sources.length;i++){
  layers.push({input:await sharp(sources[i]).resize(w,h,{fit:'contain',background:'#e8dcc3'}).png().toBuffer(),left:i*w,top:38});
  layers.push({input:Buffer.from(`<svg width="${w}" height="38"><rect width="100%" height="100%" fill="#e8dcc3"/><text x="12" y="25" font-size="16" font-family="sans-serif" fill="#332719">${labels[i]}</text></svg>`),left:i*w,top:0});
 }
 await sharp({create:{width:w*3,height:h+38,channels:3,background:'#e8dcc3'}}).composite(layers).png().toFile(`${out}/board-${view}-${width}.png`);
 const a=await sharp(sources[0]).greyscale().raw().toBuffer(),b=await sharp(sources[1]).greyscale().raw().toBuffer();let abs=0,sq=0,over32=0;
 for(let i=0;i<a.length;i++){const d=Math.abs(a[i]-b[i]);abs+=d;sq+=d*d;if(d>32)over32++}
 metrics.push({width,view,mae:abs/a.length,rmse:Math.sqrt(sq/a.length),diffRatio32:over32/a.length,note:'Unfrozen plain frames retain HUD/story timing and animation; distance is diagnostic, not acceptance.'});
}
writeFileSync(`${out}/visual-comparison.json`,JSON.stringify(metrics,null,2));
