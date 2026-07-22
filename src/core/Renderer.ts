import * as THREE from 'three';

type ResizeState = {
  clientWidth: number;
  clientHeight: number;
  dpr: number;
  bufferWidth: number;
  bufferHeight: number;
};

const resizeState = new WeakMap<THREE.WebGLRenderer, ResizeState>();
const rendererContexts = new WeakMap<HTMLCanvasElement, WebGL2RenderingContext>();

export function createRenderer(canvas: HTMLCanvasElement): THREE.WebGLRenderer {
  const context = rendererContexts.get(canvas);
  if (context && !context.isContextLost()) {
    context.pixelStorei(context.UNPACK_FLIP_Y_WEBGL, false);
    context.pixelStorei(context.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
  }
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance',
  });
  rendererContexts.set(canvas, renderer.getContext() as WebGL2RenderingContext);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.info.autoReset = false;
  return renderer;
}

export function resizeRenderer(
  renderer: THREE.WebGLRenderer,
  camera: THREE.PerspectiveCamera,
  maxDpr = 2,
): boolean {
  const canvas = renderer.domElement;
  const width = Math.max(1, Math.floor(canvas.clientWidth));
  const height = Math.max(1, Math.floor(canvas.clientHeight));
  const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
  const bufferWidth = Math.floor(width * dpr);
  const bufferHeight = Math.floor(height * dpr);
  const cssAspect = width / height;
  const previous = resizeState.get(renderer);
  if (
    previous &&
    previous.clientWidth === width &&
    previous.clientHeight === height &&
    previous.dpr === dpr &&
    previous.bufferWidth === bufferWidth &&
    previous.bufferHeight === bufferHeight
  ) {
    return false;
  }

  const needsResize =
    canvas.width !== bufferWidth ||
    canvas.height !== bufferHeight ||
    !previous ||
    previous.clientWidth !== width ||
    previous.clientHeight !== height ||
    previous.dpr !== dpr;
  resizeState.set(renderer, {
    clientWidth: width,
    clientHeight: height,
    dpr,
    bufferWidth,
    bufferHeight,
  });

  if (needsResize) {
    renderer.setPixelRatio(dpr);
    renderer.setSize(width, height, false);
    camera.aspect = cssAspect;
    camera.updateProjectionMatrix();
  }

  canvas.dataset.cameraAspect = String(camera.aspect);
  canvas.dataset.cssAspect = String(cssAspect);

  return needsResize;
}
