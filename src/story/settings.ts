export const STORY_TALES_STORAGE_KEY = 'gr.story.tales.v1';

export type StorySettingsControlIds = {
  tales: string;
};

const listeners = new Set<() => void>();

export function readStoryTalesEnabled(): boolean {
  try {
    return globalThis.localStorage?.getItem(STORY_TALES_STORAGE_KEY) !== '0';
  } catch {
    return true;
  }
}

export function setStoryTalesEnabled(enabled: boolean): boolean {
  try {
    globalThis.localStorage?.setItem(STORY_TALES_STORAGE_KEY, enabled ? '1' : '0');
  } catch {}
  notifyStorySettings();
  return enabled;
}

export function subscribeStorySettings(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function renderStorySettingsControl(ids: StorySettingsControlIds): string {
  return `
    <label>
      <span>Tales</span>
      <input data-testid="${ids.tales}" type="checkbox" ${readStoryTalesEnabled() ? 'checked' : ''} />
    </label>
  `;
}

export function bindStorySettingsControl(root: ParentNode, ids: StorySettingsControlIds): () => void {
  const tales = root.querySelector<HTMLInputElement>(`[data-testid="${ids.tales}"]`);
  if (!tales) return () => undefined;

  const sync = () => {
    tales.checked = readStoryTalesEnabled();
  };
  const onChange = () => setStoryTalesEnabled(tales.checked);
  tales.addEventListener('change', onChange);
  const unsubscribe = subscribeStorySettings(sync);
  sync();

  return () => {
    tales.removeEventListener('change', onChange);
    unsubscribe();
  };
}

function notifyStorySettings(): void {
  for (const listener of listeners) listener();
}
