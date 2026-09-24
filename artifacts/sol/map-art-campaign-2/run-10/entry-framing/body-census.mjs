import * as THREE from 'three';

// Evidence only: count a unique body colour, not every scene pixel that changes
// between two renders (water and other animated shaders can change independently).
export function bodyPixels(model, scene, renderer, camera, width, height) {
  scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);
  const target=new THREE.WebGLRenderTarget(width,height),before=new Uint8Array(width*height*4),after=new Uint8Array(before.length);
  const savedTarget=renderer.getRenderTarget(),savedAuto=renderer.autoClear,savedShadows=renderer.shadowMap.autoUpdate,saved=[];
  model.traverse(mesh=>{
    if(!mesh.isMesh)return;
    const material=mesh.material,masks=(Array.isArray(material)?material:[material]).map(m=>new THREE.MeshBasicMaterial({color:0,side:m.side,depthTest:m.depthTest,depthWrite:m.depthWrite,toneMapped:false,fog:false}));
    saved.push({mesh,material,masks});mesh.material=Array.isArray(material)?masks:masks[0];
  });
  try{
    renderer.autoClear=true;renderer.shadowMap.autoUpdate=false;renderer.setRenderTarget(target);
    renderer.render(scene,camera);renderer.readRenderTargetPixels(target,0,0,width,height,before);
    for(const {masks} of saved)for(const mask of masks)mask.color.setHex(0xff00ff);
    renderer.render(scene,camera);renderer.readRenderTargetPixels(target,0,0,width,height,after);
    const pink=(a,i)=>a[i]>240&&a[i+1]<15&&a[i+2]>240;
    let pixels=0;
    for(let i=0;i<after.length;i+=4)if(pink(after,i)&&!pink(before,i))pixels++;
    return pixels;
  }finally{
    for(const {mesh,material,masks} of saved){mesh.material=material;for(const mask of masks)mask.dispose();}
    renderer.setRenderTarget(savedTarget);renderer.autoClear=savedAuto;renderer.shadowMap.autoUpdate=savedShadows;target.dispose();
  }
}
