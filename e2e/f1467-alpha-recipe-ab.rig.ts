import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page, type TestInfo } from '@playwright/test';

const ARM_DIR = path.resolve('artifacts/f1467-alpha-recipe-ab/arms');
const SHOT_DIR = path.resolve('reviews/shots-f1467-alpha-recipe-ab');
const SUBJECTS = [
  {
    id: 'baron-banner',
    file: 'prop-baron-banner.png',
    // E1 contract visualScale 4 through applyBannerSprite (0.86 scale, 1.85 y).
    scale: [3.44, 3.44] as const,
    y: 7.4,
  },
  {
    id: 'assay-table',
    file: 'prop-drill-faucet-station.png',
    scale: [3.4, 3.4] as const,
    y: 1.7,
  },
  {
    id: 'signal-turret',
    file: 'bld-signal-turret.png',
    scale: [0.78, 0.52] as const,
    y: 0.47,
  },
] as const;
const TIERS = [0.35, 0.04] as const;

type ErrorBucket = { console: string[]; page: string[] };
type RenderMeasure = { foregroundPixels: number; bbox: [number, number, number, number] | null };

test('extraction recipes at play scale under both alphaTest tiers', async ({ page }, testInfo: TestInfo) => {
  test.setTimeout(180_000);
  const errors = collectErrors(page);
  const rows: Array<Record<string, unknown>> = [];
  await mkdir(SHOT_DIR, { recursive: true });
  await page.goto('/');

  for (const subject of SUBJECTS) {
    const oneStep = await pngDataUrl(path.join(ARM_DIR, subject.id, 'one-step', subject.file));
    const twoStep = await pngDataUrl(path.join(ARM_DIR, subject.id, 'two-step.png'));
    for (const tier of TIERS) {
      const result = await renderPair(page, { subject: subject.id, scale: subject.scale, y: subject.y, tier, oneStep, twoStep });
      const file = `${testInfo.project.name}-${subject.id}-alpha-${String(tier).replace('.', '-')}.png`;
      await page.screenshot({ path: path.join(SHOT_DIR, file) });
      rows.push({
        subject: subject.id,
        tier,
        scale: subject.scale,
        screenshot: file,
        oneStep: result.oneStep,
        twoStep: result.twoStep,
        foregroundDelta: result.twoStep.foregroundPixels - result.oneStep.foregroundPixels,
        comparison: result.comparison,
      });
      expect(result.oneStep.foregroundPixels).toBeGreaterThan(0);
      expect(result.twoStep.foregroundPixels).toBeGreaterThan(0);
    }
  }

  await writeFile(
    path.join(SHOT_DIR, `render-report-${testInfo.project.name}.json`),
    `${JSON.stringify({ project: testInfo.project.name, camera: { fov: 42, offset: [0, 26.2, 18.3], lookAt: [0, 0.45, -3.35] }, rows, errors }, null, 2)}\n`,
  );
  expect(errors).toEqual({ console: [], page: [] });
});

async function pngDataUrl(file: string): Promise<string> {
  return `data:image/png;base64,${(await readFile(file)).toString('base64')}`;
}

function collectErrors(page: Page): ErrorBucket {
  const errors: ErrorBucket = { console: [], page: [] };
  page.on('console', (message) => { if (message.type() === 'error') errors.console.push(message.text()); });
  page.on('pageerror', (error) => errors.page.push(error.message));
  return errors;
}

async function renderPair(
  page: Page,
  input: {
    subject: string;
    scale: readonly [number, number];
    y: number;
    tier: number;
    oneStep: string;
    twoStep: string;
  },
): Promise<{
  oneStep: RenderMeasure;
  twoStep: RenderMeasure;
  comparison: { changedPixels: number; changedShareOfLargerArm: number; meanChannelDelta: number };
}> {
  return page.evaluate(async ({ subject, scale, y, tier, oneStep, twoStep }) => {
    const load = new Function('url', 'return import(url)') as (url: string) => Promise<any>;
    const THREE = await load('/@id/three');
    const { createRenderer } = await load('/src/core/Renderer.ts');
    document.body.innerHTML = `
      <main>
        <h1>${subject} · alphaTest ${tier}</h1>
        <span class="label left">one-step</span>
        <span class="label right">two-step</span>
        <canvas id="f1467-canvas"></canvas>
      </main>`;
    document.head.querySelector('#f1467-style')?.remove();
    const style = document.createElement('style');
    style.id = 'f1467-style';
    style.textContent = `
      html, body, main { width: 100%; height: 100%; margin: 0; overflow: hidden; background: #17130f; }
      h1, .label { position: fixed; z-index: 2; color: #f1d39a; font: 600 16px/1.2 ui-monospace, monospace; text-shadow: 0 2px 3px #000; }
      h1 { top: 18px; left: 50%; margin: 0; transform: translateX(-50%); white-space: nowrap; }
      .label { top: 18%; transform: translateX(-50%); }
      .left { left: 35%; } .right { left: 65%; }
      canvas { display: block; width: 100%; height: 100%; }
    `;
    document.head.append(style);

    const canvas = document.querySelector<HTMLCanvasElement>('#f1467-canvas')!;
    const renderer = createRenderer(canvas);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(innerWidth, innerHeight, false);
    renderer.setClearColor(0x17130f, 1);
    const camera = new THREE.PerspectiveCamera(42, innerWidth / innerHeight, 0.1, 100);
    camera.position.set(0, 26.2, 18.3);
    camera.lookAt(0, 0.45, -3.35);
    camera.updateProjectionMatrix();
    const scene = new THREE.Scene();
    const loader = new THREE.TextureLoader();
    const [oneTexture, twoTexture] = await Promise.all([loader.loadAsync(oneStep), loader.loadAsync(twoStep)]);
    for (const texture of [oneTexture, twoTexture]) {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = 4;
    }

    const makeSprite = (texture: any) => {
      const material = new THREE.SpriteMaterial({ map: texture, transparent: true, alphaTest: tier, depthWrite: false });
      const sprite = new THREE.Sprite(material);
      sprite.scale.set(scale[0], scale[1], 1);
      sprite.position.y = y;
      return sprite;
    };
    const oneSprite = makeSprite(oneTexture);
    const twoSprite = makeSprite(twoTexture);

    const gl = renderer.getContext();
    const pixels = () => {
      const width = gl.drawingBufferWidth;
      const height = gl.drawingBufferHeight;
      const data = new Uint8Array(width * height * 4);
      gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, data);
      return { data, width, height };
    };
    renderer.render(scene, camera);
    const baseline = pixels();
    const measure = (sprite: any) => {
      scene.add(sprite);
      renderer.render(scene, camera);
      const current = pixels();
      scene.remove(sprite);
      let foregroundPixels = 0;
      let x0 = current.width;
      let y0 = current.height;
      let x1 = -1;
      let y1 = -1;
      for (let index = 0; index < current.width * current.height; index += 1) {
        const offset = index << 2;
        const delta = Math.max(
          Math.abs(current.data[offset] - baseline.data[offset]),
          Math.abs(current.data[offset + 1] - baseline.data[offset + 1]),
          Math.abs(current.data[offset + 2] - baseline.data[offset + 2]),
        );
        if (delta <= 3) continue;
        foregroundPixels += 1;
        const x = index % current.width;
        const py = Math.floor(index / current.width);
        x0 = Math.min(x0, x); y0 = Math.min(y0, py);
        x1 = Math.max(x1, x); y1 = Math.max(y1, py);
      }
      return {
        data: current.data,
        stats: { foregroundPixels, bbox: x1 < 0 ? null : [x0, y0, x1, y1] as [number, number, number, number] },
      };
    };
    const oneMeasured = measure(oneSprite);
    const twoMeasured = measure(twoSprite);
    let changedPixels = 0;
    let totalDelta = 0;
    for (let offset = 0; offset < oneMeasured.data.length; offset += 4) {
      const red = Math.abs(oneMeasured.data[offset] - twoMeasured.data[offset]);
      const green = Math.abs(oneMeasured.data[offset + 1] - twoMeasured.data[offset + 1]);
      const blue = Math.abs(oneMeasured.data[offset + 2] - twoMeasured.data[offset + 2]);
      totalDelta += red + green + blue;
      if (Math.max(red, green, blue) > 4) changedPixels += 1;
    }
    const measured = {
      oneStep: oneMeasured.stats,
      twoStep: twoMeasured.stats,
      comparison: {
        changedPixels,
        changedShareOfLargerArm: changedPixels / Math.max(oneMeasured.stats.foregroundPixels, twoMeasured.stats.foregroundPixels),
        meanChannelDelta: totalDelta / (oneMeasured.data.length / 4 * 3),
      },
    };

    const separation = Math.max(0.72, scale[0] * 0.68);
    oneSprite.position.x = -separation;
    twoSprite.position.x = separation;
    scene.add(oneSprite, twoSprite);
    renderer.render(scene, camera);
    return measured;
  }, input);
}
