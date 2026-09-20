import sharp from 'sharp';import{readFileSync}from'node:fs';
const out='artifacts/map-art-inventory-20260908';const maps=JSON.parse(readFileSync(`${out}/inventory.json`)).maps;const rows=JSON.parse(readFileSync(`${out}/browser-stations.json`));
for(let era=1;era<=10;era++){
 const shots=rows.filter(r=>maps.find(m=>m.id===r.id).era===era).flatMap(r=>(r.stations??[]).map(s=>({...s,map:r.id})));
 if(!shots.length)continue;const overlays=[];
 for(const [i,s]of shots.entries()){
  const left=(i%3)*426,top=Math.floor(i/3)*296;
  overlays.push({input:Buffer.from(`<svg width="426" height="30"><rect width="426" height="30" fill="#eee9df"/><text x="8" y="19" font-family="Arial" font-size="12">${s.map}: ${s.id}</text></svg>`),left,top});
  overlays.push({input:await sharp(`${out}/${s.shot}`).resize(426,266,{fit:'contain'}).png().toBuffer(),left,top:top+30});
 }
 await sharp({create:{width:1278,height:Math.ceil(shots.length/3)*296,channels:3,background:'#292720'}}).composite(overlays).png().toFile(`${out}/comparisons/landmarks-era-${era}.png`);
}console.log('Landmark sheets written');
