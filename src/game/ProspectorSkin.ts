export const PROSPECTOR_SKIN_STORAGE_KEY = 'gr.prospector.skin.v1';
export const PROSPECTOR_SKINS_OWNED_STORAGE_KEY = 'gr.prospector.skins-owned.v1';
export const HERO_SKIN_STORAGE_KEY = 'gr.hero.skin.v1';
export const HERO_SKINS_OWNED_STORAGE_KEY = 'gr.hero.skins-owned.v1';

export const PROSPECTOR_SKINS = ['stock', 'complainant', 'gilded'] as const;
export type ProspectorSkin = (typeof PROSPECTOR_SKINS)[number];
export const HERO_SKINS = ['stock', 'claim-day'] as const;
export type HeroSkin = (typeof HERO_SKINS)[number];

const PROSPECTOR_LABELS: Record<ProspectorSkin, string> = {
  stock: 'Stock Coat',
  complainant: "The Complainant's Coat",
  gilded: 'The Gilded Coat',
};
const HERO_LABELS: Record<HeroSkin, string> = {
  stock: 'Stock Neckerchief',
  'claim-day': 'Claim-Day Neckerchief',
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

export function readHeroSkin(storage = browserStorage()): HeroSkin {
  const selected = normalizeHeroSkin(read(storage, HERO_SKIN_STORAGE_KEY));
  return selected && ownedHeroSkins(storage).includes(selected) ? selected : 'stock';
}

export function ownedHeroSkins(storage = browserStorage()): HeroSkin[] {
  try {
    const saved = JSON.parse(read(storage, HERO_SKINS_OWNED_STORAGE_KEY) ?? '[]') as unknown;
    const owned = Array.isArray(saved) ? saved.map(normalizeHeroSkin).filter((skin): skin is HeroSkin => !!skin) : [];
    return HERO_SKINS.filter((skin) => skin === 'stock' || owned.includes(skin));
  } catch {
    return ['stock'];
  }
}

export function grantHeroSkin(skin: HeroSkin, storage = browserStorage()): boolean {
  const owned = ownedHeroSkins(storage);
  if (owned.includes(skin)) return false;
  const previousOwned = read(storage, HERO_SKINS_OWNED_STORAGE_KEY);
  const previousSkin = read(storage, HERO_SKIN_STORAGE_KEY);
  if (
    write(storage, HERO_SKINS_OWNED_STORAGE_KEY, JSON.stringify([...owned, skin])) &&
    write(storage, HERO_SKIN_STORAGE_KEY, skin)
  ) return true;
  restore(storage, HERO_SKINS_OWNED_STORAGE_KEY, previousOwned);
  restore(storage, HERO_SKIN_STORAGE_KEY, previousSkin);
  return false;
}

export function setHeroSkin(skin: HeroSkin, storage = browserStorage()): boolean {
  if (!ownedHeroSkins(storage).includes(skin)) return false;
  return write(storage, HERO_SKIN_STORAGE_KEY, skin);
}

export function grantReporterSet(storage = browserStorage()): boolean {
  const owned = ownedProspectorSkins(storage).includes('complainant') && ownedHeroSkins(storage).includes('claim-day');
  grantProspectorSkin('complainant', storage);
  grantHeroSkin('claim-day', storage);
  return !owned && ownedProspectorSkins(storage).includes('complainant') && ownedHeroSkins(storage).includes('claim-day');
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
        ${ownedProspectorSkins().map((skin) => `<option value="${skin}"${skin === selected ? ' selected' : ''}>${PROSPECTOR_LABELS[skin]}</option>`).join('')}
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

export function renderWardrobe(prospectorId: string, heroId: string, partnerName: string): string {
  const hero = readHeroSkin();
  return `
    <div class="town-ui__wardrobe-racks">
      <section class="town-ui__wardrobe-rack" data-testid="wardrobe-prospector-rack">
        <p class="town-ui__board-eyebrow">The Prospector</p>
        ${renderProspectorSkinControl(prospectorId)}
      </section>
      <section class="town-ui__wardrobe-rack" data-testid="wardrobe-partner-rack">
        <p class="town-ui__board-eyebrow">The Partner · ${escapeHtml(partnerName)}</p>
        <label>
          <span>Partner neckerchief</span>
          <select data-testid="${heroId}" aria-label="Partner neckerchief">
            ${ownedHeroSkins().map((skin) => `<option value="${skin}"${skin === hero ? ' selected' : ''}>${HERO_LABELS[skin]}</option>`).join('')}
          </select>
        </label>
      </section>
    </div>
  `;
}

export function bindWardrobe(root: ParentNode, prospectorId: string, heroId: string): () => void {
  const disposeProspector = bindProspectorSkinControl(root, prospectorId);
  const hero = root.querySelector<HTMLSelectElement>(`[data-testid="${heroId}"]`);
  const onHeroChange = () => {
    const skin = normalizeHeroSkin(hero?.value);
    if (skin) setHeroSkin(skin);
  };
  hero?.addEventListener('change', onHeroChange);
  return () => {
    disposeProspector();
    hero?.removeEventListener('change', onHeroChange);
  };
}

export function prospectorSkinSheetFile(file: string, skin: ProspectorSkin): string {
  return skin === 'stock' ? file : file.replace('char-prospector-', `char-prospector-${skin}-`);
}

function normalizeSkin(value: unknown): ProspectorSkin | null {
  return typeof value === 'string' && PROSPECTOR_SKINS.includes(value as ProspectorSkin) ? value as ProspectorSkin : null;
}

function normalizeHeroSkin(value: unknown): HeroSkin | null {
  return typeof value === 'string' && HERO_SKINS.includes(value as HeroSkin) ? value as HeroSkin : null;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]!);
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
