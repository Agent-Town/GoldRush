// Contact sheets preserve each full image; no generative edits or similarity verdicts.
import sharp from 'sharp';import{readFileSync,existsSync,mkdirSync}from'node:fs';
const out='artifacts/map-art-inventory-20260908';const data=JSON.parse(readFileSync(`${out}/inventory.json`));mkdirSync(`${out}/comparisons`,{recursive:true});
const esc=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;');
for(let era=1;era<=10;era++){
 const rows=data.maps.filter(m=>m.era===era);const overlays=[];const w=640,h=400,step=440;
 for(const [i,m] of rows.entries()){
  overlays.push({input:Buffer.from(`<svg width="1280" height="40"><rect width="1280" height="40" fill="#eee9df"/><text x="14" y="26" font-family="Arial" font-size="20">${esc(m.name)} (${m.id}) — concept / current gameplay</text></svg>`),left:0,top:i*step});
  for(const [j,p] of [m.plate,`${out}/shots/${m.id}.png`].entries())if(existsSync(p))overlays.push({input:await sharp(p).resize(w,h,{fit:'contain',background:'#292720'}).png().toBuffer(),left:j*w,top:i*step+40});
 }
 await sharp({create:{width:1280,height:rows.length*step,channels:3,background:'#292720'}}).composite(overlays).png().toFile(`${out}/comparisons/era-${era}.png`);
}
console.log('10 era sheets written');
