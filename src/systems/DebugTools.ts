import GUI from 'lil-gui';

export type DebugTuning = {
  exposure: number;
  maxDpr: number;
  cameraLag: number;
  cameraLookAhead: number;
  cameraOffsetY: number;
  cameraOffsetZ: number;
  cameraDownScreenLookOffset: number;
};

export class DebugTools {
  private gui: GUI | null = null;

  constructor(tuning: DebugTuning, onChange: () => void) {
    const enabled = new URLSearchParams(window.location.search).has('debug');
    if (!enabled) return;

    this.gui = new GUI({ title: 'Game tuning' });
    this.gui.add(tuning, 'maxDpr', 1, 2, 0.25).onChange(onChange);
    this.gui.add(tuning, 'exposure', 0.6, 1.8, 0.01).onChange(onChange);
    const camera = this.gui.addFolder('Camera');
    camera.add(tuning, 'cameraLag', 0.02, 0.2, 0.005).onChange(onChange);
    camera.add(tuning, 'cameraLookAhead', 0, 3, 0.05).onChange(onChange);
    camera.add(tuning, 'cameraOffsetY', 12, 30, 0.1).onChange(onChange);
    camera.add(tuning, 'cameraOffsetZ', 6, 22, 0.1).onChange(onChange);
    camera.add(tuning, 'cameraDownScreenLookOffset', 0, 5, 0.05).onChange(onChange);
  }

  dispose(): void {
    this.gui?.destroy();
    this.gui = null;
  }
}
