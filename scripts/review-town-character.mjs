// Render the actual town actor and texture loader in a labeled diagnostic scene.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import {chromium} from 'playwright';
const id=process.argv[2]??'assay_clerk',sheets=JSON.parse(fs.readFileSync('src/town/town-actor-sheets.json'));
assert.ok(sheets[id]&&id!=='prospector','Choose a walking town actor');
const frameCount=id==='newsie'?4:JSON.parse(fs.readFileSync(`assets/processed/${sheets[id]}.frames.json`)).grid.cols;
const out=`artifacts/sol/sprite-roster-fixes-20260908/${id}-runtime`;fs.mkdirSync(out,{recursive:true});
const file='src/town/TownScene.ts',ast=ts.createSourceFile(file,fs.readFileSync(file,'utf8'),ts.ScriptTarget.Latest,true),imports={};
for(const node of ast.statements)if(ts.isImportDeclaration(node)&&node.moduleSpecifier.text.endsWith('.frames.json'))imports[node.importClause.name.text]=JSON.parse(fs.readFileSync(path.resolve(path.dirname(file),node.moduleSpecifier.text)));
const names=['TownActorRuntime','directionRow','loopPoint','actorPhase','townCastWalkFrames'];
const declarations=ast.statements.filter(n=>names.includes(n.name?.text)||ts.isVariableStatement(n)&&n.declarationList.declarations.some(d=>names.includes(d.name.text))).map(n=>n.getText(ast)).join('\n');
const source=ts.transpileModule(fs.readFileSync('src/assets/OrientationResolver.ts','utf8').replace(/\bexport /g,'')+'\n'+declarations,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;
const browser=await chromium.launch({channel:'chromium'}),results=[];
try{for(const width of [390,1280]){
 const page=await browser.newPage({viewport:{width,height:844},deviceScaleFactor:2}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
 await page.goto('http://127.0.0.1:5319/?debug');
 await page.evaluate(async({source,imports,id,stem})=>{
  const THREE=await import('/node_modules/three/build/three.module.js'),generated=await import('/src/assets/generated.ts');
  const {TOWN_ACTORS,TOWN_CAST_METROLOGY}=await import('/src/town/townsfolk.ts');
  const {RenderLayers}=await import('/src/core/RenderLayers.ts');
  const definition=TOWN_ACTORS.find(actor=>actor.id===id);
  const scope={THREE,...imports,...generated,RenderLayers,TOWN_CAST_METROLOGY,FEET_CONTACT_Y:.02,tagPlaceholder:()=>{}};
  const {TownActorRuntime}=new Function(...Object.keys(scope),source+'\nreturn {TownActorRuntime};')(...Object.values(scope));
  const meta=Object.values(imports).find(m=>m.source===stem+'.png');await Promise.all(meta.cells.map(c=>generated.loadProcessedCharacterTexture(c.file)));
  const actor=new TownActorRuntime({...definition,position:{x:0,z:0},facing:'s',loop:undefined});
  document.body.innerHTML='<p style="position:absolute;top:0;color:#222">Actual TownActorRuntime — diagnostic framing</p>';
  const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(devicePixelRatio);document.body.append(renderer.domElement);
  const scene=new THREE.Scene();scene.background=new THREE.Color('#ddd5b7');scene.add(actor.group);
  const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-10,0,0),new THREE.Vector3(10,0,0)]),new THREE.LineBasicMaterial({color:'#97896b'}));scene.add(line);
  const aspect=innerWidth/innerHeight,camera=new THREE.OrthographicCamera(-1.4*aspect,1.4*aspect,1.4,-1.4,.01,100);
  window.townReview={actor,renderer,scene,camera,elapsed:0};
 },{source,imports,id,stem:sheets[id]});
 const samples=[];
 for(const [dir,dx,dz,row]of [['s',0,1,0],['w',-1,0,1],['e',1,0,2],['n',0,-1,3]])for(let step=0;step<frameCount;step++){
  const sample=await page.evaluate(async({dir,dx,dz,row,stem})=>{
   const f=window.townReview,a=f.actor;const delta=1/(a.definition.fullBody.fps??8);f.elapsed+=delta;a.update(delta,f.elapsed,{x:a.position.x+dx*.01,z:a.position.z+dz*.01});
   const deadline=performance.now()+15000;while(!a.frameKey.includes(`-r${row}c`)||a.frameKey!==a.requestedFrameKey){if(performance.now()>deadline)throw Error('frame load timeout');await new Promise(requestAnimationFrame)}
   a.update(0,f.elapsed);f.camera.position.set(a.position.x,.8,a.position.z+5);f.camera.lookAt(a.position.x,.8,a.position.z);f.renderer.render(f.scene,f.camera);
   return {dir,frameKey:a.frameKey,footY:a.footY,worldFootY:a.group.position.y+a.footY,height:a.spriteHeight,motion:a.motion};
  },{dir,dx,dz,row,stem:sheets[id]});
  assert.ok(sample.frameKey.includes(`-r${row}c`));assert.ok(Math.abs(sample.worldFootY-.02)<1e-6);samples.push(sample);
  await page.screenshot({path:`${out}/${width}-${dir}-${step}.png`});
 }
 for(const dir of ['s','w','e','n'])assert.equal(new Set(samples.filter(s=>s.dir===dir).map(s=>s.frameKey)).size,frameCount);
 assert.deepEqual(errors,[]);results.push({width,id,samples,errors});console.log(id,width,`${4*frameCount} direction/frame samples loaded and anchored`);
 await page.evaluate(()=>{window.townReview.actor.dispose();window.townReview.renderer.dispose()});await page.close();
}}finally{await browser.close()}
fs.writeFileSync(out+'/results.json',JSON.stringify(results,null,2)+'\n');
