import {
  CAMERA_ZOOM_STORAGE_KEY,
  activeProfile,
  profileDataKey,
  type ProfileStorage,
} from './ProfileStorage';

export { CAMERA_ZOOM_STORAGE_KEY };

export type CameraZoomScene = 'town' | 'run';

type CameraZoomSettings = {
  version: 1;
  town: number;
  run: number;
};

const DEFAULT_SETTINGS: CameraZoomSettings = { version: 1, town: 1, run: 1 };

export function readCameraDistanceScale(scene: CameraZoomScene): number {
  return readSettings()[scene];
}

export function saveCameraDistanceScale(scene: CameraZoomScene, value: number): void {
  try {
    const storage = browserStorage();
    storage?.setItem(
      cameraZoomStorageKey(storage),
      JSON.stringify({ ...readSettings(), [scene]: value }),
    );
  } catch {
    // Zoom remains usable when storage is unavailable.
  }
}

function readSettings(): CameraZoomSettings {
  try {
    const storage = browserStorage();
    const saved = JSON.parse(storage?.getItem(cameraZoomStorageKey(storage)) ?? 'null') as Partial<CameraZoomSettings> | null;
    return {
      ...DEFAULT_SETTINGS,
      town: finiteOrDefault(saved?.town),
      run: finiteOrDefault(saved?.run),
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

function finiteOrDefault(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 1;
}

function cameraZoomStorageKey(storage: ProfileStorage | undefined): string {
  return profileDataKey(storage ? activeProfile(storage).id : 'robin', CAMERA_ZOOM_STORAGE_KEY);
}

function browserStorage(): Storage | undefined {
  try {
    return globalThis.localStorage ?? undefined;
  } catch {
    return undefined;
  }
}
