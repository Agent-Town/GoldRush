import { readAudioMuted, readAudioVolume, setAudioMuted, setAudioVolume, subscribeAudioPreferences } from './settings';

export type AudioSettingsControlIds = {
  volume: string;
  volumeValue: string;
  mute: string;
};

export function renderAudioSettingsControls(ids: AudioSettingsControlIds): string {
  const volume = Math.round(readAudioVolume() * 100);
  const muted = readAudioMuted();
  return `
    <label>
      <span>Volume</span>
      <input data-testid="${ids.volume}" type="range" min="0" max="100" step="5" value="${volume}" />
      <output data-testid="${ids.volumeValue}">${volume}%</output>
    </label>
    <label>
      <span>Mute</span>
      <input data-testid="${ids.mute}" type="checkbox" ${muted ? 'checked' : ''} />
    </label>
  `;
}

export function bindAudioSettingsControls(root: ParentNode, ids: AudioSettingsControlIds): () => void {
  const volume = root.querySelector<HTMLInputElement>(`[data-testid="${ids.volume}"]`);
  const output = root.querySelector<HTMLOutputElement>(`[data-testid="${ids.volumeValue}"]`);
  const mute = root.querySelector<HTMLInputElement>(`[data-testid="${ids.mute}"]`);
  if (!volume || !output || !mute) return () => undefined;

  const sync = () => {
    const value = Math.round(readAudioVolume() * 100);
    volume.value = String(value);
    output.textContent = `${value}%`;
    mute.checked = readAudioMuted();
  };
  const onVolumeInput = () => setAudioVolume(Number(volume.value) / 100);
  const onMuteInput = () => setAudioMuted(mute.checked);
  volume.addEventListener('input', onVolumeInput);
  mute.addEventListener('change', onMuteInput);
  const unsubscribe = subscribeAudioPreferences(sync);
  sync();

  return () => {
    volume.removeEventListener('input', onVolumeInput);
    mute.removeEventListener('change', onMuteInput);
    unsubscribe();
  };
}
