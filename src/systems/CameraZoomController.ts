import * as THREE from 'three';
import { Balance } from '../game/Balance';
import {
  readCameraDistanceScale,
  saveCameraDistanceScale,
  type CameraZoomScene,
} from '../game/CameraZoomSettings';
import { CameraRig } from './CameraRig';

export type CameraZoomDiagnostics = {
  scene: CameraZoomScene;
  distanceScale: number;
  targetDistanceScale: number;
  minDistanceScale: number;
  maxDistanceScale: number;
  baseDistance: number;
  targetDistance: number;
  actualDistance: number;
};

export class CameraZoomController {
  private distanceScale: number;
  private targetDistanceScale: number;
  private readonly touches = new Map<number, THREE.Vector2>();
  private pinchDistance = 0;
  private pinching = false;
  private lastPinchAt = 0;
  private lastTapAt = 0;
  private lastTap = new THREE.Vector2();

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly scene: CameraZoomScene,
    private readonly rig: CameraRig,
  ) {
    this.distanceScale = this.targetDistanceScale = this.clamp(readCameraDistanceScale(scene));
    this.rig.setDistanceScale(this.distanceScale);
    canvas.addEventListener('wheel', this.onWheel, { passive: false });
    canvas.addEventListener('pointerdown', this.onPointerDown);
    canvas.addEventListener('pointermove', this.onPointerMove);
    canvas.addEventListener('pointerup', this.onPointerUp);
    canvas.addEventListener('pointercancel', this.onPointerCancel);
    window.addEventListener('keydown', this.onKeyDown);
  }

  update(delta: number): void {
    const factor = 1 - Math.exp(-Math.max(0, delta) * Balance.camera.zoom.smoothing);
    this.distanceScale = THREE.MathUtils.lerp(this.distanceScale, this.targetDistanceScale, factor);
    if (Math.abs(this.distanceScale - this.targetDistanceScale) < 0.0001) {
      this.distanceScale = this.targetDistanceScale;
    }
    this.rig.setDistanceScale(this.distanceScale);
  }

  diagnostics(): CameraZoomDiagnostics {
    const rig = this.rig.diagnostics();
    return {
      scene: this.scene,
      distanceScale: this.distanceScale,
      targetDistanceScale: this.targetDistanceScale,
      minDistanceScale: Balance.camera.zoom.minDistanceScale,
      maxDistanceScale: Balance.camera.zoom.maxDistanceScale,
      baseDistance: rig.baseDistance,
      targetDistance: rig.baseDistance * this.targetDistanceScale,
      actualDistance: rig.actualDistance,
    };
  }

  dispose(): void {
    this.canvas.removeEventListener('wheel', this.onWheel);
    this.canvas.removeEventListener('pointerdown', this.onPointerDown);
    this.canvas.removeEventListener('pointermove', this.onPointerMove);
    this.canvas.removeEventListener('pointerup', this.onPointerUp);
    this.canvas.removeEventListener('pointercancel', this.onPointerCancel);
    window.removeEventListener('keydown', this.onKeyDown);
  }

  private readonly onWheel = (event: WheelEvent): void => {
    event.preventDefault();
    const unit =
      event.deltaMode === WheelEvent.DOM_DELTA_LINE
        ? 16
        : event.deltaMode === WheelEvent.DOM_DELTA_PAGE
          ? this.canvas.clientHeight
          : 1;
    this.setTarget(this.targetDistanceScale * Math.exp(event.deltaY * unit * Balance.camera.zoom.wheelSensitivity));
  };

  private readonly onPointerDown = (event: PointerEvent): void => {
    if (event.pointerType !== 'touch') return;
    this.touches.set(event.pointerId, new THREE.Vector2(event.clientX, event.clientY));
    if (this.touches.size === 2) {
      this.pinchDistance = this.touchDistance();
      this.pinching = true;
    }
  };

  private readonly onPointerMove = (event: PointerEvent): void => {
    const point = this.touches.get(event.pointerId);
    if (!point) return;
    point.set(event.clientX, event.clientY);
    if (this.touches.size < 2) return;
    event.preventDefault();
    const distance = this.touchDistance();
    if (this.pinchDistance > 0 && distance > 0) {
      this.setTarget(this.targetDistanceScale * this.pinchDistance / distance);
    }
    this.pinchDistance = distance;
    this.lastPinchAt = performance.now();
  };

  private readonly onPointerUp = (event: PointerEvent): void => {
    this.endPointer(event, true);
  };

  private readonly onPointerCancel = (event: PointerEvent): void => {
    this.endPointer(event, false);
  };

  private readonly onKeyDown = (event: KeyboardEvent): void => {
    if (event.code !== 'KeyZ' || event.repeat || isTyping(event.target)) return;
    this.reset();
  };

  private endPointer(event: PointerEvent, mayTap: boolean): void {
    if (!this.touches.has(event.pointerId)) return;
    const wasPinching = this.pinching;
    this.touches.delete(event.pointerId);
    if (this.touches.size < 2) {
      this.pinchDistance = 0;
      this.pinching = false;
    }
    const now = performance.now();
    if (wasPinching) this.lastPinchAt = now;
    if (!mayTap || wasPinching || now - this.lastPinchAt < Balance.camera.zoom.doubleTapMs) return;
    const point = new THREE.Vector2(event.clientX, event.clientY);
    if (
      now - this.lastTapAt <= Balance.camera.zoom.doubleTapMs &&
      point.distanceTo(this.lastTap) <= Balance.camera.zoom.doubleTapRadius
    ) {
      this.lastTapAt = 0;
      this.reset();
      return;
    }
    this.lastTapAt = now;
    this.lastTap.copy(point);
  }

  private reset(): void {
    this.setTarget(1);
  }

  private setTarget(value: number): void {
    const next = Math.round(this.clamp(value) * 1_000) / 1_000;
    if (next === this.targetDistanceScale) return;
    this.targetDistanceScale = next;
    saveCameraDistanceScale(this.scene, next);
  }

  private clamp(value: number): number {
    return THREE.MathUtils.clamp(
      Number.isFinite(value) ? value : 1,
      Balance.camera.zoom.minDistanceScale,
      Balance.camera.zoom.maxDistanceScale,
    );
  }

  private touchDistance(): number {
    const [a, b] = [...this.touches.values()];
    return a && b ? a.distanceTo(b) : 0;
  }
}

function isTyping(target: EventTarget | null): boolean {
  return target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|SELECT|TEXTAREA)$/.test(target.tagName));
}
