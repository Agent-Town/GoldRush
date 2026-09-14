import assert from 'node:assert/strict';
import fs from 'node:fs';import os from 'node:os';import path from 'node:path';
import {execFileSync} from 'node:child_process';import {fileURLToPath} from 'node:url';import {PNG} from 'pngjs';
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'goldrush-key-shadow-'));
try{
 const p=new PNG({width:32,height:32});for(let i=0;i<p.data.length;i+=4)p.data.set([255,0,255,255],i);
 const put=(x,y,c)=>p.data.set([...c,255],(y*32+x)*4);
 for(let y=5;y<25;y++)for(let x=8;x<24;x++)put(x,y,[100,60,30]);
 for(let y=25;y<28;y++)for(let x=9;x<29;x++)put(x,y,[100,0,70]);
 // Exposed neutral gray, blue and black art must not be interpreted as shadows.
 for(const [x,c] of [[8,[110,110,110]],[9,[30,80,100]],[10,[10,8,10]],[11,[30,0,180]]])put(x,5,c);
 for(let y=12;y<17;y++)for(let x=13;x<19;x++)put(x,y,[100,0,70]);
 const input=path.join(dir,'plate.png');fs.writeFileSync(input,PNG.sync.write(p));
 const run=(extra,out)=>{execFileSync(process.execPath,['scripts/extract-alpha.mjs','--key','ff00ff','--size','0','--out',path.join(dir,out),...extra,input]);return PNG.sync.read(fs.readFileSync(path.join(dir,out,'plate.png')))};
 const before=run([],'before'),after=run(['--deshadow'],'after');const alpha=(p,x,y)=>p.data[(y*32+x)*4+3];
 assert.equal(alpha(before,20,26),255);assert.equal(alpha(after,20,26),0);
 for(const [x,y] of [[8,5],[9,5],[10,5],[11,5],[16,14],[10,20]])assert.equal(alpha(after,x,y),255,`foreground erased ${x},${y}`);
 // No alpha changes anywhere except the authored external shadow.
 for(let y=0;y<32;y++)for(let x=0;x<32;x++)if(!(y>=25&&y<28&&x>=9&&x<29))assert.equal(alpha(after,x,y),alpha(before,x,y));


 for(const [key,bg,fg]of [['ff80ff',[255,128,255],[160,160,160]],['640064',[100,0,100],[8,8,8]]]){
  const plate=new PNG({width:8,height:8});for(let i=0;i<plate.data.length;i+=4)plate.data.set([...bg,255],i);
  for(let y=2;y<6;y++)for(let x=2;x<6;x++)plate.data.set([...fg,255],(y*8+x)*4);
  const file=path.join(dir,key+'.png');fs.writeFileSync(file,PNG.sync.write(plate));
  execFileSync(process.execPath,['scripts/extract-alpha.mjs','--key',key,'--deshadow','--size','0','--out',path.join(dir,key),file]);
  const result=PNG.sync.read(fs.readFileSync(path.join(dir,key,key+'.png')));execFileSync(process.execPath,['scripts/extract-alpha.mjs','--key',key,'--size','0','--out',path.join(dir,key+'-baseline'),file]);const baseline=PNG.sync.read(fs.readFileSync(path.join(dir,key+'-baseline',key+'.png')));assert.equal(result.data[(2*8+2)*4+3],baseline.data[(2*8+2)*4+3],'empty key channel group erased foreground');
 }
 fs.mkdirSync(path.join(dir,'assets/raw'),{recursive:true});fs.copyFileSync(input,path.join(dir,'assets/raw/plate.png'));
 fs.symlinkSync(fileURLToPath(new URL('.',import.meta.url)),path.join(dir,'scripts'));
 execFileSync(process.execPath,['scripts/extract-alpha.mjs','--key','ff00ff','--deshadow','--grid','1x1','--cell','32','--scale','1','--grid-centres','[[16,16]]','assets/raw/plate.png'],{cwd:dir});
 const proc=path.join(dir,'assets/processed'),files=fs.readdirSync(proc).map(f=>[f,fs.readFileSync(path.join(proc,f))]);
 assert.equal(JSON.parse(fs.readFileSync(path.join(proc,'plate.frames.json'))).deshadow,true);
 execFileSync(process.execPath,['scripts/anim-pass-reextract.mjs','plate'],{cwd:dir});
 for(const[f,bytes]of files)assert.deepEqual(fs.readFileSync(path.join(proc,f)),bytes,'deshadow re-extraction changed '+f);
 console.log('Saturated-key deshadow removes connected dark key paint; preserves neutral/blue/black edges, enclosed purple and warm boots; default unchanged.');
}finally{fs.rmSync(dir,{recursive:true,force:true})}
