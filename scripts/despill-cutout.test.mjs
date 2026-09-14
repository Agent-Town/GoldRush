import assert from 'node:assert/strict';import fs from 'node:fs';import os from 'node:os';import path from 'node:path';import{execFileSync,spawnSync}from'node:child_process';import{PNG}from'pngjs';
const root=fs.mkdtempSync(path.join(os.tmpdir(),'gold-rush-despill-'));
try{
 const p=new PNG({width:28,height:28});for(let i=0;i<p.data.length;i+=4)p.data.set([255,0,255,0],i);
 for(let y=4;y<24;y++)for(let x=4;x<24;x++)p.data.set([170,110,45,255],(y*28+x)*4);
 const samples=[[4,8,[82,24,90,255]],[4,9,[82,24,90,90]],[15,15,[82,24,90,255]],[15,16,[82,24,90,80]],[13,8,[82,24,90,255]],[15,6,[255,0,255,0]],[4,10,[20,160,180,255]],[4,11,[180,80,50,255]]];
 for(const[x,y,rgba]of samples)p.data.set(rgba,(y*28+x)*4);
 const input=path.join(root,'cutout.png'),out=path.join(root,'out');fs.writeFileSync(input,PNG.sync.write(p));
 const args=['scripts/extract-alpha.mjs','--despill-only','--key','ff00ff','--out',out,input];execFileSync(process.execPath,args);
 const q=PNG.sync.read(fs.readFileSync(path.join(out,'cutout.png')));assert.equal(q.width,p.width);assert.equal(q.height,p.height);
 for(let i=3;i<p.data.length;i+=4)assert.equal(q.data[i],p.data[i],'alpha changed');
 const at=(x,y)=>[...q.data.subarray((y*28+x)*4,(y*28+x)*4+4)];
 assert.deepEqual(at(4,8),[24,24,32,255]);assert.deepEqual(at(4,9),[24,24,32,90]);assert.deepEqual(at(15,15),[82,24,90,255]);assert.deepEqual(at(15,16),[82,24,90,80]);assert.deepEqual(at(13,8),[24,24,32,255]);assert.deepEqual(at(4,10),[20,160,180,255]);assert.deepEqual(at(4,11),[180,80,50,255]);assert.deepEqual(at(0,0),[0,0,0,0]);
 // The normal factory paths must also cure dark purple after their last filter.
 for(const grid of [[],['--grid','1x1','--cell','28','--scale','1']]){const dir=path.join(root,grid.length?'grid':'normal');execFileSync(process.execPath,['scripts/extract-alpha.mjs','--key','ff00ff','--size','0','--out',dir,...grid,input]);const image=PNG.sync.read(fs.readFileSync(path.join(dir,grid.length?'cutout-r0c0.png':'cutout.png')));for(let y=0;y<image.height;y++)for(let x=0;x<image.width;x++){const i=(y*image.width+x)*4;if(!image.data[i+3])continue;let edge=false;for(let dy=-3;dy<=3;dy++)for(let dx=-3;dx<=3;dx++)if(x+dx>=0&&y+dy>=0&&x+dx<image.width&&y+dy<image.height&&image.data[((y+dy)*image.width+x+dx)*4+3]===0)edge=true;if(edge)assert.ok(image.data[i]<=image.data[i+1]||image.data[i+2]<=image.data[i+1],'factory left key chroma at the final silhouette');}}
 const once=fs.readFileSync(path.join(out,'cutout.png'));execFileSync(process.execPath,['scripts/extract-alpha.mjs','--despill-only','--key','ff00ff','--out',out,path.join(out,'cutout.png')]);assert.deepEqual(fs.readFileSync(path.join(out,'cutout.png')),once,'repair must be idempotent');
 // Explicit palette cleanup reaches enclosed trouser gaps; defaults above still preserve interior purple.
 const allOut=path.join(root,'all');const allArgs=['scripts/extract-alpha.mjs','--despill-only','--despill-all','--key','ff00ff','--out',allOut];
 execFileSync(process.execPath,[...allArgs,input]);const allFile=path.join(allOut,'cutout.png'),allBytes=fs.readFileSync(allFile),all=PNG.sync.read(allBytes);
 assert.equal(all.width,p.width);assert.equal(all.height,p.height);
 for(let i=0;i<p.data.length;i+=4){const [r,g,b,a]=p.data.subarray(i,i+4),excess=Math.max(0,Math.min(r-g,b-g));assert.deepEqual([...all.data.subarray(i,i+4)],[r-excess,g,b-excess,a]);}
 execFileSync(process.execPath,[...allArgs,allFile]);assert.deepEqual(fs.readFileSync(allFile),allBytes);
 assert.notEqual(spawnSync(process.execPath,['scripts/extract-alpha.mjs','--despill-all','--key','ff00ff','--out',out,input]).status,0);
 for(const invalid of [['--key','8a8a8a'],['--grid','2x2'],['--full-bleed']])assert.notEqual(spawnSync(process.execPath,[...args.slice(0,-1),...invalid,input]).status,0);
 console.log('Cutout despill passed: default interior preservation; explicit all-palette repair; alpha/size, brass/teal, idempotence and invalid combinations');
}finally{fs.rmSync(root,{recursive:true,force:true})}
