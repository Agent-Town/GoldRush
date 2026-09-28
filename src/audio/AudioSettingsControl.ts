import { readAudioMuted, readAudioVolume, readMusicVolume, readMusicOff, setMusicOff, setAudioMuted, setAudioVolume, setMusicVolume, subscribeAudioPreferences } from './settings';

export type AudioSettingsControlIds = {
  volume: string;
  volumeValue: string;
  mute: string;
  music: string;
  musicValue: string;
};

export function renderAudioSettingsControls(ids: AudioSettingsControlIds): string {
  const volume = Math.round(readAudioVolume() * 100);
  const muted = readAudioMuted();
  const music = Math.round(readMusicVolume() * 100);
  return `
    <label>
      <span>Volume</span>
      <input data-testid="${ids.volume}" type="range" min="0" max="100" step="5" value="${volume}" />
      <output data-testid="${ids.volumeValue}">${volume}%</output>
    </label>
    <label>
      <span>Music Volume</span>
      <input data-testid="${ids.music}" type="range" min="0" max="100" step="5" value="${music}" />
      <output data-testid="${ids.musicValue}">${music}%</output>
    </label>
    <label>
      <span>Music</span>
      <input data-testid="${ids.music}-enabled" type="checkbox" ${readMusicOff() ? '' : 'checked'} />
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
  const music = root.querySelector<HTMLInputElement>(`[data-testid="${ids.music}"]`);
  const musicOutput = root.querySelector<HTMLOutputElement>(`[data-testid="${ids.musicValue}"]`);
  const musicEnabled = root.querySelector<HTMLInputElement>(`[data-testid="${ids.music}-enabled"]`);
  if (!musicEnabled || !volume || !output || !mute || !music || !musicOutput) return () => undefined;

  const sync = () => {
    const value = Math.round(readAudioVolume() * 100);
    volume.value = String(value);
    output.textContent = `${value}%`;
    mute.checked = readAudioMuted();
    musicEnabled.checked = !readMusicOff();
    const musicValue = Math.round(readMusicVolume() * 100);
    music.value = String(musicValue);
    musicOutput.textContent = `${musicValue}%`;
  };
  const onVolumeInput = () => setAudioVolume(Number(volume.value) / 100);
  const onMuteInput = () => setAudioMuted(mute.checked);
  const onMusicInput = () => setMusicVolume(Number(music.value) / 100);
  const onMusicEnabled = () => setMusicOff(!musicEnabled.checked);
  musicEnabled.addEventListener('change', onMusicEnabled);
  volume.addEventListener('input', onVolumeInput);
  mute.addEventListener('change', onMuteInput);
  music.addEventListener('input', onMusicInput);
  const unsubscribe = subscribeAudioPreferences(sync);
  sync();

  return () => {
    musicEnabled.removeEventListener('change', onMusicEnabled);
    volume.removeEventListener('input', onVolumeInput);
    mute.removeEventListener('change', onMuteInput);
    music.removeEventListener('input', onMusicInput);
    unsubscribe();
  };
}

export function renderMusicToggle(className = ''): string {
  const on = !readMusicOff();
  return `<button type="button" class="music-toggle ${className}" data-testid="music-toggle" aria-pressed="${on}">Music ${on ? 'on' : 'off'}</button>`;
}

export function bindMusicToggle(root: ParentNode): () => void {
  const button = root.querySelector<HTMLButtonElement>('[data-testid="music-toggle"]');
  if (!button) return () => undefined;
  const sync = () => {
    const on = !readMusicOff();
    button.textContent = `Music ${on ? 'on' : 'off'}`;
    button.setAttribute('aria-pressed', String(on));
  };
  const toggle = () => setMusicOff(!readMusicOff());
  button.addEventListener('click', toggle);
  const unsubscribe = subscribeAudioPreferences(sync);
  sync();
  return () => {
    button.removeEventListener('click', toggle);
    unsubscribe();
  };
}
