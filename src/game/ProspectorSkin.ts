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

type WardrobePreview = {
  src: string;
  state: 'ready' | 'at-tailors';
  placeholder?: boolean;
};

const stockHeroPreviewUrl = new URL('../../assets/processed/char-hero-sheet-walk4-a-f-r0c0.png', import.meta.url).href;
const PROSPECTOR_PREVIEWS: Record<ProspectorSkin, WardrobePreview> = {
  stock: {
    src: new URL('../../assets/processed/char-prospector-sheet-hover8-r0c0.png', import.meta.url).href,
    state: 'ready',
  },
  complainant: {
    src: new URL('../../assets/processed/char-prospector-complainant-sheet-hover8-r0c0.png', import.meta.url).href,
    state: 'at-tailors',
  },
  gilded: {
    src: new URL('../../assets/processed/char-prospector-gilded-sheet-hover8-r0c0.png', import.meta.url).href,
    state: 'at-tailors',
  },
};
const HERO_PREVIEWS: Record<HeroSkin, WardrobePreview> = {
  stock: { src: stockHeroPreviewUrl, state: 'ready' },
  'claim-day': { src: stockHeroPreviewUrl, state: 'at-tailors', placeholder: true },
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
  const prospector = readProspectorSkin();
  const hero = readHeroSkin();
  return `
    <div class="town-ui__wardrobe-racks">
      <section class="town-ui__wardrobe-rack" data-testid="wardrobe-prospector-rack">
        <p class="town-ui__board-eyebrow">The Prospector</p>
        ${renderProspectorSkinControl(prospectorId)}
        ${renderWardrobePreview('wardrobe-prospector-preview', prospector, PROSPECTOR_LABELS[prospector], PROSPECTOR_PREVIEWS[prospector])}
      </section>
      <section class="town-ui__wardrobe-rack" data-testid="wardrobe-partner-rack">
        <p class="town-ui__board-eyebrow">The Partner · ${escapeHtml(partnerName)}</p>
        <label>
          <span>Partner neckerchief</span>
          <select data-testid="${heroId}" aria-label="Partner neckerchief">
            ${ownedHeroSkins().map((skin) => `<option value="${skin}"${skin === hero ? ' selected' : ''}>${HERO_PREVIEWS[skin].state === 'at-tailors' ? "Claim-Day · at the tailor's" : HERO_LABELS[skin]}</option>`).join('')}
          </select>
        </label>
        ${renderWardrobePreview('wardrobe-partner-preview', hero, HERO_LABELS[hero], HERO_PREVIEWS[hero])}
      </section>
    </div>
  `;
}

export function bindWardrobe(root: ParentNode, prospectorId: string, heroId: string): () => void {
  const disposeProspector = bindProspectorSkinControl(root, prospectorId);
  const prospector = root.querySelector<HTMLSelectElement>(`[data-testid="${prospectorId}"]`);
  const hero = root.querySelector<HTMLSelectElement>(`[data-testid="${heroId}"]`);
  const onProspectorPreview = () => {
    const skin = normalizeSkin(prospector?.value);
    if (skin) updateWardrobePreview(root, 'wardrobe-prospector-preview', skin, PROSPECTOR_LABELS[skin], PROSPECTOR_PREVIEWS[skin]);
  };
  const onHeroChange = () => {
    const skin = normalizeHeroSkin(hero?.value);
    if (skin) {
      setHeroSkin(skin);
      updateWardrobePreview(root, 'wardrobe-partner-preview', skin, HERO_LABELS[skin], HERO_PREVIEWS[skin]);
    }
  };
  prospector?.addEventListener('change', onProspectorPreview);
  hero?.addEventListener('change', onHeroChange);
  return () => {
    disposeProspector();
    prospector?.removeEventListener('change', onProspectorPreview);
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

function renderWardrobePreview(testId: string, skin: string, label: string, preview: WardrobePreview): string {
  return `
    <figure class="town-ui__wardrobe-preview" data-testid="${testId}" data-preview-skin="${skin}" data-preview-state="${preview.state}" data-preview-placeholder="${preview.placeholder ? 'true' : 'false'}">
      <img src="${preview.src}" alt="${wardrobePreviewAlt(label, preview)}" data-wardrobe-preview-image>
      <figcaption role="status" aria-live="polite" aria-atomic="true">
        <strong data-wardrobe-preview-name>${label}</strong>
        <span data-wardrobe-preview-status>${wardrobePreviewStatus(preview)}</span>
      </figcaption>
    </figure>
  `;
}

function updateWardrobePreview(root: ParentNode, testId: string, skin: string, label: string, preview: WardrobePreview): void {
  const figure = root.querySelector<HTMLElement>(`[data-testid="${testId}"]`);
  const image = figure?.querySelector<HTMLImageElement>('[data-wardrobe-preview-image]');
  const name = figure?.querySelector<HTMLElement>('[data-wardrobe-preview-name]');
  const status = figure?.querySelector<HTMLElement>('[data-wardrobe-preview-status]');
  if (!figure || !image || !name || !status) return;
  figure.dataset.previewSkin = skin;
  figure.dataset.previewState = preview.state;
  figure.dataset.previewPlaceholder = preview.placeholder ? 'true' : 'false';
  image.src = preview.src;
  image.alt = wardrobePreviewAlt(label, preview);
  name.textContent = label;
  status.textContent = wardrobePreviewStatus(preview);
}

function wardrobePreviewAlt(label: string, preview: WardrobePreview): string {
  if (preview.state === 'ready') return `${label} preview`;
  return preview.placeholder
    ? `${label} is at the tailor's; stock fit shown`
    : `${label} preview; full outfit is at the tailor's`;
}

function wardrobePreviewStatus(preview: WardrobePreview): string {
  if (preview.state === 'ready') return 'Ready to wear';
  return preview.placeholder ? "At the tailor's · Stock fit shown" : "At the tailor's · Preview only";
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
