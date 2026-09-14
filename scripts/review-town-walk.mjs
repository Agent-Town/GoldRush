// Exercise the actual town actor class without booting menus or a WebGL context.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import * as THREE from 'three';
import { PNG } from 'pngjs';
const file='src/town/TownScene.ts',source=fs.readFileSync(file,'utf8');
const ast=ts.createSourceFile(file,source,ts.ScriptTarget.Latest,true);
const names=['TownActorRuntime','directionRow','loopPoint','actorPhase','townCastWalkFrames','createPortraitPost'];
const imports={};
for(const node of ast.statements){
 if(ts.isImportDeclaration(node)&&node.moduleSpecifier.text.endsWith('.frames.json')){
  imports[node.importClause.name.text]=JSON.parse(fs.readFileSync(path.resolve(path.dirname(file),node.moduleSpecifier.text)));
 }
}
const declarations=ast.statements.filter(node=>names.includes(node.name?.text)||ts.isVariableStatement(node)&&node.declarationList.declarations.some(d=>names.includes(d.name.text))).map(node=>node.getText(ast)).join('\n');
const orientation=fs.readFileSync('src/assets/OrientationResolver.ts','utf8').replace(/\bexport /g,'');
const renderLayers=fs.readFileSync('src/core/RenderLayers.ts','utf8').replace(/\bexport /g,'');
const module=ts.transpileModule(renderLayers+'\n'+orientation+'\n'+declarations,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;
let unavailableFrame = '';
const scope={THREE,...imports,TOWN_CAST_METROLOGY:{worldUnitsPerHero:1.85},FEET_CONTACT_Y:0.02,tagPlaceholder:()=>{},loadGeneratedTexture:async()=>new THREE.Texture(),loadProcessedCharacterTexture:async key=>{
 assert.ok(fs.existsSync(`assets/processed/${key}`),`town requested missing frame ${key}`);
 if(key===unavailableFrame)return null;
 return new THREE.Texture({width:512,height:512});
}};
scope.SpriteAnimator=class {update(){} reset(){} dispose(){}};
const {TownActorRuntime,RenderLayers,townCastWalkFrames}=new Function(...Object.keys(scope),module+'\nreturn {TownActorRuntime,RenderLayers,townCastWalkFrames};')(...Object.values(scope));
const sheets=JSON.parse(fs.readFileSync('src/town/town-actor-sheets.json'));
let samples=0;
const alphaBottoms=new Map();
for(const [id,stem]of Object.entries(sheets)){
 if(id==='prospector')continue;
 const meta=JSON.parse(fs.readFileSync(`assets/processed/${stem}.frames.json`));
 const frameMap=id==='newsie'?[0,1,6,7]:undefined;
 const actor=new TownActorRuntime({id,assetSlot:'char.test',position:{x:0,z:0},facing:'s',scale:1,fullBody:{sheet:stem,animated:true,frameMap}});
 assert.equal(actor.group.getObjectByName(`TownActorSprite:${id}`).renderOrder,RenderLayers.gameplay,`${id}: walker must depth-sort with the hero`);
 await Promise.resolve();assert.ok(Math.abs(actor.footY-0.02)<1e-6,`${id}: unanchored foot`);
 for(const [dx,dz] of [[0,1],[-1,0],[1,0],[0,-1]]) {
 const seen=new Set();
 for(let i=0;i<16;i++){
  actor.update(.125,samples*.125,{x:actor.position.x+dx*100,z:actor.position.z+dz*100});await Promise.resolve();
  seen.add(Number(/c(\d+)\.png/.exec(actor.frameKey)[1]));
  assert.ok(Math.abs(actor.footY-0.02)<1e-6,`${id}: moving frame lost footline`);samples++;
  assert.ok(Math.abs(actor.group.position.y+actor.footY-0.02)<1e-6,`${id}: grounded body inherited hover`);
  assert.equal(actor.group.getObjectByName(`TownActorSprite:${id}`).material.rotation,0,`${id}: footline rotated off the ground`);
  const sprite=actor.group.getObjectByName(`TownActorSprite:${id}`),cell=meta.cells.find(c=>c.file===actor.frameKey);
  const footUvY=1-(meta.cell/2+(cell.bbox[3]-cell.bbox[1]+1)*meta.scale/2)/meta.cell;
  if(!alphaBottoms.has(actor.frameKey)) {
   const png=PNG.sync.read(fs.readFileSync(`assets/processed/${actor.frameKey}`));let bottom=0;
   for(let y=0;y<png.height;y++)for(let x=0;x<png.width;x++)if(png.data[(y*png.width+x)*4+3]>8)bottom=y+1;
   alphaBottoms.set(actor.frameKey,1-bottom/png.height);
  }
  assert.ok(Math.abs(footUvY-alphaBottoms.get(actor.frameKey))<=.5/meta.cell+1e-9,`${id}: metadata misses actual alpha bottom`);
  actor.group.updateMatrixWorld(true);
  for(const pitch of [25,45,65]) {
   const angle=THREE.MathUtils.degToRad(pitch),camera=new THREE.OrthographicCamera(-2,2,2,-2,.01,100);
   camera.position.set(Math.cos(angle)*14,Math.sin(angle)*20,Math.cos(angle)*14);camera.lookAt(0,0,0);camera.updateMatrixWorld(true);
   // Match three.js sprite vertex projection: UV offsets expand in camera space.
   const foot=sprite.getWorldPosition(new THREE.Vector3()).applyMatrix4(camera.matrixWorldInverse);
   foot.x+=(.5-sprite.center.x)*sprite.scale.x;foot.y+=(footUvY-sprite.center.y)*sprite.scale.y;
   foot.applyMatrix4(camera.projectionMatrix);
   const ground=new THREE.Vector3(actor.position.x,.02,actor.position.z).project(camera);
   assert.ok(Math.hypot(foot.x-ground.x,foot.y-ground.y)<1e-6,`${id}: drawn foot misses ground at camera pitch ${pitch}`);
  }
 }
 assert.deepEqual([...seen].sort((a,b)=>a-b),frameMap??Array.from({length:meta.grid.cols},(_,i)=>i),`${id}: wrong frame cycle`);
 }
 actor.dispose();
}
// One-row post idles stay fixed; cardinal idles retain the final movement heading.
let idleChecks=0;
for(const [id,metadata] of Object.entries(townCastWalkFrames)) {
 if(!metadata.idle)continue;
 const actor=new TownActorRuntime({id,assetSlot:'char.test',position:{x:0,z:0},facing:'s',scale:1,fullBody:{sheet:sheets[id],animated:true,frameMap:id==='newsie'?[0,1,6,7]:undefined}});
 await Promise.resolve();
 for(const [dx,dz,row] of [[0,1,0],[1,1,2],[1,0,2],[1,-1,2],[0,-1,3],[-1,-1,1],[-1,0,1],[-1,1,1]]) {
  actor.update(.125,0,{x:actor.position.x+dx,z:actor.position.z+dz});await Promise.resolve();
  assert.ok(actor.frameKey.startsWith(sheets[id]+'-r'+row+'c'),`${id}: failed to resume walking`);
  actor.update(.2,0,{x:actor.position.x,z:actor.position.z});await Promise.resolve();
  const idleRow=metadata.idle.grid.rows===1?0:row;
  const cell=metadata.idle.cells.find(c=>c.row===idleRow&&c.col===0);
  assert.equal(actor.frameKey,cell.file,`${id}: wrong stopped facing`);
  const png=PNG.sync.read(fs.readFileSync('assets/processed/'+cell.file));let bottom=0;
  for(let y=0;y<png.height;y++)for(let x=0;x<png.width;x++)if(png.data[(y*png.width+x)*4+3]>89)bottom=y+1;
  const support=metadata.idle.cell/2+(cell.bbox[3]-cell.bbox[1]+1)*metadata.idle.scale/2;
  assert.ok(Math.abs(bottom-support)<=1,`${id}: idle metadata misses drawn sole`);
  assert.equal(actor.footY,.02);idleChecks++;
 }
 actor.dispose();
}
// Missing new artwork must retain the matching walk fallback, including at boot.
for(const [direction,row] of [['s',0],['w',1],['e',2],['n',3]]) {
 unavailableFrame=`char-newsie-mei-idle-r${row}c0.png`;
 const actor=new TownActorRuntime({id:'newsie',assetSlot:'char.test',position:{x:0,z:0},facing:direction,scale:1,fullBody:{sheet:sheets.newsie,animated:true,frameMap:[0,1,6,7]}});
 await Promise.resolve();await Promise.resolve();
 assert.equal(actor.frameKey,`${sheets.newsie}-r${row}c0.png`);assert.equal(actor.footY,.02);actor.dispose();
}
unavailableFrame='';
console.log(`${idleChecks} stop/resume checks preserve fixed and directional idles; four missing-idle fallbacks remain visible and grounded`);
const companion=new TownActorRuntime({id:'prospector',assetSlot:'char.test',position:{x:0,z:0},facing:'s',scale:1,fullBody:{sheet:'char-prospector-sheet-hover8',animated:true}});
companion.update(.125,.125);
assert.equal(companion.group.getObjectByName('TownActorSprite:prospector').renderOrder,RenderLayers.companion);
assert.notEqual(companion.group.position.y,0,'hovering companion lost its vertical motion');
assert.notEqual(companion.group.getObjectByName('TownActorSprite:prospector').material.rotation,0,'hovering companion lost its sway');
companion.dispose();
const portrait=new TownActorRuntime({id:'schoolteacher',assetSlot:'char.test',position:{x:0,z:0},facing:'s',scale:1});
assert.equal(portrait.group.getObjectByName('TownActorSprite:schoolteacher').renderOrder,RenderLayers.companion);
assert.equal(portrait.group.getObjectByName('TownPortraitPostCard').renderOrder,RenderLayers.companion-.01);
portrait.dispose();
for (const fps of [8, 26]) for (const hz of [20, 40, 100]) {
 const actor=new TownActorRuntime({id:'youngster_a',assetSlot:'char.test',position:{x:0,z:0},facing:'e',scale:1,fullBody:{sheet:sheets.youngster_a,animated:true,fps}});
 await Promise.resolve();let previous=0,advances=0;
 for(let tick=1;tick<=hz*.8;tick++) {
  actor.update(1/hz,tick/hz,{x:actor.position.x+1/hz,z:0});await Promise.resolve();
  const frame=Number(/c(\d+)\.png/.exec(actor.frameKey)[1]);
  advances+=(frame-previous+8)%8;previous=frame;
 }
 assert.equal(advances,Math.floor(.8*fps),`${fps}fps animation lost frames at ${hz}Hz`);
 actor.dispose();
}
console.log(`${samples} frame samples across nine town actors and four directions: complete cycles, world grounding and projected foot contact at three camera pitches pass; companion hover retained`);
console.log('Town animation cadence: 8/26fps retain elapsed frames at legal 20/40/100Hz update rates');
