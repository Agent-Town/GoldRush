import { expect, test } from '@playwright/test';

for (const contract of ['e5-deepwater-claim', 'e5-regatta', 'e5-stillwater', 'e5-flotilla']) {
  test(`${contract}: sea apron preserves geometry and hull contact loads without render errors`, async ({ page }) => {
    test.setTimeout(90_000);
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    await page.goto(`/?debug&contract=${contract}&epoch=epoch-5-deepwater&nowaves&nolevel&nopause`);
    await page.waitForFunction(() => window.__GR_TEST__, null, { timeout: 60_000 });
    await page.evaluate(() => window.__GR_TEST__!.setManualSim(true));
    const count = contract === 'e5-flotilla' ? 3 : 1;
    await expect.poll(async () => page.locator('#game-canvas').evaluate(canvas => {
      const rows = JSON.parse((canvas as HTMLCanvasElement).dataset.terrain3dPilotHullWaterlines ?? '[]');
      return rows.length;
    }), { timeout: 60_000 }).toBe(count);
    const canvas = page.locator('#game-canvas');
    await expect(canvas).toHaveAttribute('data-terrain3d-pilot-sea-apron-triangles', '768');
    await expect(canvas).toHaveAttribute('data-terrain3d-pilot-panorama-triangles', '2704');
    await expect(canvas).toHaveAttribute('data-terrain3d-pilot-sculpt-water-y', '0.0000');
    const contacts = await canvas.evaluate(element => JSON.parse((element as HTMLCanvasElement).dataset.terrain3dPilotHullWaterlines!)) as Array<{ hull: string; triangles: number }>;
    expect(contacts.every(row => row.triangles > 0 && row.triangles <= 2000)).toBe(true);
    expect(contacts.map(row => row.hull).sort()).toEqual(contract === 'e5-flotilla'
      ? ['kitchen-scow', 'still-room-barge', 'turret-raft'] : ['ClaimBoatView']);
    await page.waitForTimeout(500);
    expect(errors).toEqual([]);
  });
}

test('sea panorama foreground silhouettes remain visible over the apron', async ({ page }) => {
  test.setTimeout(90_000);
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  // Expose only the production routing helper in this isolated render fixture.
  // A red mast crosses a blue apron at their shared far-plane depth; the old
  // two-material split painted its lower half blue through opaque draw sorting.
  await page.route('**/src/world/Terrain3dClaimPilot.ts*', async route => {
    const response = await route.fetch();
    const body = await response.text();
    expect(body).toContain('function routeSeaApron(');
    await route.fulfill({ response, body: body.replace('function routeSeaApron(', 'export function routeSeaApron(') });
  });
  await page.goto('/');
  const result = await page.evaluate(async () => {
    const THREE = await Function('return import("/node_modules/.vite/deps/three.js")')() as typeof import('three');
    const { routeSeaApron } = await Function('return import("/src/world/Terrain3dClaimPilot.ts")')();
    const scene = new THREE.Scene();
    const positions: number[] = [], colors: number[] = [], uvs: number[] = [], indices: number[] = [];
    const quad = (x0: number, y0: number, x1: number, y1: number, z: number, color: number[], v: number) => {
      const base = positions.length / 3;
      positions.push(x0,y0,z, x1,y0,z, x1,y1,z, x0,y1,z);
      for (let i = 0; i < 4; i++) { colors.push(...color); uvs.push(0.5,v); }
      indices.push(base,base+1,base+2, base,base+2,base+3);
    };
    quad(-4,-4,4,4,-1,[0,0,0],0.5); // sky
    quad(-4,-3,4,-0.1,0,[0,0,0],0.9); // submerged apron
    quad(-0.5,-2,0.5,2,0,[1,0,0],0.08); // appended foreground mast
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
    geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
    geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));
    geometry.setIndex(indices); geometry.computeVertexNormals();
    const panoramaMaterial = new THREE.MeshBasicMaterial({ vertexColors:true, depthWrite:false, side:THREE.DoubleSide });
    panoramaMaterial.onBeforeCompile = shader => {
      shader.vertexShader = shader.vertexShader.replace('#include <project_vertex>',
        '#include <project_vertex>\ngl_Position.z = gl_Position.w * 0.999999;');
    };
    const panorama = new THREE.Mesh(geometry,panoramaMaterial);
    panorama.renderOrder = -100; scene.add(panorama);
    const map = new THREE.DataTexture(new Uint8Array([0,0,255,255]),1,1);
    map.needsUpdate = true;
    const terrainMaterial = new THREE.MeshStandardMaterial({map,emissive:0x0000ff,emissiveIntensity:1,side:THREE.DoubleSide});
    const terrain = new THREE.Mesh(new THREE.PlaneGeometry(8,8),terrainMaterial);
    const apronTriangles = routeSeaApron(terrain,panorama,new THREE.Box3(new THREE.Vector3(-4,-4,-4),new THREE.Vector3(4,4,4)));
    const camera = new THREE.OrthographicCamera(-4,4,4,-4,0.1,20);
    camera.position.set(0,0,10); camera.lookAt(0,0,0);
    const renderer = new THREE.WebGLRenderer({antialias:false,preserveDrawingBuffer:true});
    renderer.setSize(128,128); document.body.append(renderer.domElement); renderer.render(scene,camera);
    const gl = renderer.getContext(), pixel = new Uint8Array(4), apron = new Uint8Array(4);
    gl.readPixels(64,48,1,1,gl.RGBA,gl.UNSIGNED_BYTE,pixel); // mast at world y = -1
    gl.readPixels(32,48,1,1,gl.RGBA,gl.UNSIGNED_BYTE,apron); // uncovered apron
    const answer = {apronTriangles,pixel:Array.from(pixel),apron:Array.from(apron)};
    scene.traverse(object => { const mesh=object as import('three').Mesh; mesh.geometry?.dispose(); });
    panoramaMaterial.dispose(); terrain.geometry.dispose(); terrainMaterial.dispose(); map.dispose(); renderer.dispose();
    return answer;
  });
  console.log('sea-panorama-order', JSON.stringify(result));
  expect(result.apronTriangles).toBe(2);
  expect(result.apron[2]).toBeGreaterThan(100);
  expect(result.pixel[0]).toBeGreaterThan(200);
  expect(result.pixel[2]).toBeLessThan(20);
  expect(errors).toEqual([]);
});
