export const PROSPECTOR_SKIN_STORAGE_KEY = 'gr.prospector.skin.v1';
export const PROSPECTOR_SKINS_OWNED_STORAGE_KEY = 'gr.prospector.skins-owned.v1';

export const PROSPECTOR_SKINS = ['stock', 'complainant', 'gilded'] as const;
export type ProspectorSkin = (typeof PROSPECTOR_SKINS)[number];

const LABELS: Record<ProspectorSkin, string> = {
  stock: 'Stock Coat',
  complainant: "The Complainant's Coat",
  gilded: 'The Gilded Coat',
};

export function readProspectorSkin(storage = browserStorage()): ProspectorSkin {
  const selected = normalizeSkin(read(storage, PROSPECTOR_SKIN_STORAGE_KEY));
  return selected && ownedProspectorSkins(storage).includes(selected) ? selected : 'stock';
}

export function ownedProspectorSkins(storage = browserStorage()): ProspectorSkin[] {
  try {
    const saved = JSON.parse(read(storage, PROSPECTOR_SKINS_OWNED_STORAGE_KEY) ?? '[]') as unknown;
    const owned = Array.isArray(saved) ? saved.map(normalizeSkin).filter((skin): skin is ProspectorSkin => !!skin) : [];
    return PROSPECTOR_SKINS.filter((skin) => skin === 'stock' || owned.includes(skin));
  } catch {
    return ['stock'];
  }
}

export function grantProspectorSkin(skin: ProspectorSkin, storage = browserStorage()): boolean {
  const owned = ownedProspectorSkins(storage);
  if (owned.includes(skin)) return false;
  const previousOwned = read(storage, PROSPECTOR_SKINS_OWNED_STORAGE_KEY);
  const previousSkin = read(storage, PROSPECTOR_SKIN_STORAGE_KEY);
  if (
    write(storage, PROSPECTOR_SKINS_OWNED_STORAGE_KEY, JSON.stringify([...owned, skin])) &&
    write(storage, PROSPECTOR_SKIN_STORAGE_KEY, skin)
  ) return true;
  restore(storage, PROSPECTOR_SKINS_OWNED_STORAGE_KEY, previousOwned);
  restore(storage, PROSPECTOR_SKIN_STORAGE_KEY, previousSkin);
  return false;
}

export function setProspectorSkin(skin: ProspectorSkin, storage = browserStorage()): boolean {
  if (!ownedProspectorSkins(storage).includes(skin)) return false;
  return write(storage, PROSPECTOR_SKIN_STORAGE_KEY, skin);
}

export function canPersistProspectorSkin(storage = browserStorage()): boolean {
  const previous = read(storage, PROSPECTOR_SKIN_STORAGE_KEY);
  const probe = previous ?? 'stock';
  const stored = write(storage, PROSPECTOR_SKIN_STORAGE_KEY, probe);
  restore(storage, PROSPECTOR_SKIN_STORAGE_KEY, previous);
  return stored;
}

export function renderProspectorSkinControl(id: string): string {
  const selected = readProspectorSkin();
  return `
    <label>
      <span>Prospector coat</span>
      <select data-testid="${id}" aria-label="Prospector coat">
        ${ownedProspectorSkins().map((skin) => `<option value="${skin}"${skin === selected ? ' selected' : ''}>${LABELS[skin]}</option>`).join('')}
      </select>
    </label>
  `;
}

export function bindProspectorSkinControl(root: ParentNode, id: string): () => void {
  const select = root.querySelector<HTMLSelectElement>(`[data-testid="${id}"]`);
  if (!select) return () => undefined;
  const onChange = () => {
    const skin = normalizeSkin(select.value);
    if (skin) setProspectorSkin(skin);
  };
  select.addEventListener('change', onChange);
  return () => select.removeEventListener('change', onChange);
}

export function prospectorSkinSheetFile(file: string, skin: ProspectorSkin): string {
  return skin === 'stock' ? file : file.replace('char-prospector-', `char-prospector-${skin}-`);
}

function normalizeSkin(value: unknown): ProspectorSkin | null {
  return typeof value === 'string' && PROSPECTOR_SKINS.includes(value as ProspectorSkin) ? value as ProspectorSkin : null;
}

type SkinStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

function browserStorage(): SkinStorage | undefined {
  try {
    return globalThis.localStorage ?? undefined;
  } catch {
    return undefined;
  }
}

function read(storage: Pick<Storage, 'getItem'> | undefined, key: string): string | null {
  try {
    return storage?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

function write(storage: Pick<Storage, 'getItem' | 'setItem'> | undefined, key: string, value: string): boolean {
  try {
    storage?.setItem(key, value);
    return storage?.getItem(key) === value;
  } catch {
    return false;
  }
}

function restore(storage: SkinStorage | undefined, key: string, value: string | null): void {
  try {
    if (value === null) storage?.removeItem(key);
    else storage?.setItem(key, value);
  } catch {}
}
