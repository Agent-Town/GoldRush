import type { AgentTapeReplaySnapshot } from '../replay/AgentTapeReplay';

const heroUrl = new URL('../../assets/processed/hero-homesteader-f.png', import.meta.url).href;
const prospectorUrl = new URL('../../assets/processed/char-prospector-sheet-hover8-r0c0.png', import.meta.url).href;
const enemyUrl = new URL('../../assets/processed/char-bandit-base-sheet-walk8-r0c0.png', import.meta.url).href;
const thiefUrl = new URL('../../assets/processed/char-bandit-thief-sheet-walk8-r0c0.png', import.meta.url).href;
const wreckerUrl = new URL('../../assets/processed/char-steamwrecker-sheet-walk4-a-r0c0.png', import.meta.url).href;
const railToughUrl = new URL('../../assets/processed/char-railtough-sheet-walk4-a-r0c0.png', import.meta.url).href;
const coalThiefUrl = new URL('../../assets/processed/char-coalthief-sheet-walk4-a-r0c0.png', import.meta.url).href;
const baronUrl = new URL('../../assets/processed/char-baron-sheet-walk8-r0c0.png', import.meta.url).href;
const feralToasterUrl = new URL('../../assets/processed/char-e6-feral_toaster-sheet-walk8-r0c0.png', import.meta.url).href;
const lawnShepherdUrl = new URL('../../assets/processed/char-e6-lawn_shepherd-sheet-walk8-r0c0.png', import.meta.url).href;
const glowjackUrl = new URL('../../assets/processed/char-e6-glowjack-sheet-walk8-r0c0.png', import.meta.url).href;
const rogueAutomatonUrl = new URL('../../assets/processed/char-e7-rogue_automaton-sheet-walk8-r0c0.png', import.meta.url).href;
const dataRustlerUrl = new URL('../../assets/processed/char-e7-data_rustler-sheet-walk8-r0c0.png', import.meta.url).href;
const scrapCorsairUrl = new URL('../../assets/processed/char-e8-scrap_corsair-sheet-walk8-r0c0.png', import.meta.url).href;
const sunGlareShamblerUrl = new URL('../../assets/processed/char-e8-sun_glare_shambler-sheet-walk8-r0c0.png', import.meta.url).href;
const feralTerraformerUrl = new URL('../../assets/processed/char-e9-feral_terraformer-sheet-walk8-r0c0.png', import.meta.url).href;
const prospectDroneUrl = new URL('../../assets/processed/char-e9-claim_jump_prospect_drone-sheet-walk8-r0c0.png', import.meta.url).href;
const seamUrl = new URL('../../assets/processed/node-gold-seam.png', import.meta.url).href;
const sluiceUrl = new URL('../../assets/processed/bld-sluice-works.png', import.meta.url).href;
const sentryUrl = new URL('../../assets/processed/bld-sentry-beacon.png', import.meta.url).href;
const palisadeUrl = new URL('../../assets/processed/bld-palisade.png', import.meta.url).href;
const stockpileUrl = new URL('../../assets/processed/bld-stockpile-yard.png', import.meta.url).href;
const turretUrl = new URL('../../assets/processed/bld-signal-turret.png', import.meta.url).href;
const boilerUrl = new URL('../../assets/processed/bld-boiler-house.png', import.meta.url).href;

export const TRUE_REEL_PLACEHOLDERS = ['terrain layout', 'decorative props'] as const;

const enemyVisuals: Record<string, string> = {
  baron: baronUrl,
  coal_thief: coalThiefUrl,
  steam_wrecker: wreckerUrl,
  rail_tough: railToughUrl,
  thief: thiefUrl,
  wrecker: wreckerUrl,
  feral_toaster: feralToasterUrl,
  lawn_shepherd: lawnShepherdUrl,
  glowjack: glowjackUrl,
  rogue_automaton: rogueAutomatonUrl,
  data_rustler: dataRustlerUrl,
  scrap_corsair: scrapCorsairUrl,
  sun_glare_shambler: sunGlareShamblerUrl,
  feral_terraformer: feralTerraformerUrl,
  faithful_terraformer: feralTerraformerUrl,
  claim_jump_prospect_drone: prospectDroneUrl,
};

const workVisuals: Record<string, string> = {
  sluice: sluiceUrl,
  sentry: sentryUrl,
  sentry_beacon: sentryUrl,
  palisade: palisadeUrl,
  stockpile: stockpileUrl,
  turret: turretUrl,
  boiler_house: boilerUrl,
};

export function renderTrueReel(snapshot: AgentTapeReplaySnapshot): string {
  const entity = (
    type: string,
    key: string,
    x: number,
    z: number,
    url: string,
    width: number,
    height: number,
    attrs = '',
    style = '',
    marker = '#2e1b0e',
    hp?: { current: number; max: number },
  ) => `<g data-replay-entity="${type}" ${attrs}>
    <title>${escapeHtml(key)}${hp ? ` · ${Math.round(hp.current)}/${Math.round(hp.max)} HP` : ''}</title>
    <ellipse cx="${x + 40}" cy="${z + 28}" rx="${width * 0.28}" ry="${width * 0.13}" fill="#2e1b0e" opacity=".28" />
    <circle cx="${x + 40}" cy="${z + 28}" r="${width * 0.37}" fill="none" stroke="${marker}" stroke-width=".16" opacity=".82" />
    <image href="${url}" x="${x + 40 - width / 2}" y="${z + 28 - height * 0.78}" width="${width}" height="${height}" preserveAspectRatio="xMidYMid meet" style="${style}" data-x="${x}" data-z="${z}" data-visual="${escapeHtml(key)}" />
    ${hp ? `<rect x="${x + 40 - width * .34}" y="${z + 28 - height * .88}" width="${width * .68}" height=".32" fill="#2e1b0e" /><rect x="${x + 40 - width * .32}" y="${z + 28 - height * .86}" width="${width * .64 * Math.max(0, hp.max > 0 ? hp.current / hp.max : 0)}" height=".18" fill="#6bb36b" />` : ''}
  </g>`;

  const placeholder = (type: string, key: string, x: number, z: number, attrs: string) => `<g data-replay-entity="${type}" ${attrs} data-placeholder="true">
    <title>${escapeHtml(key)} · visual placeholder</title>
    <rect x="${x + 38}" y="${z + 24}" width="4" height="4" rx=".4" fill="#f5e6c8" stroke="#a0522d" stroke-width=".28" data-x="${x}" data-z="${z}" data-visual="placeholder:${escapeHtml(key)}" />
    <text x="${x + 40}" y="${z + 26.4}" text-anchor="middle" fill="#7f2633" font-size=".9">${escapeHtml(key)}</text>
  </g>`;

  const unknownEnemyKinds = [...new Set(snapshot.enemies.map(({ kind }) => kind).filter((kind) => !enemyVisual(kind)))];
  const unknownWorkKinds = [...new Set(snapshot.works.map(({ id }) => id).filter((kind) => !workVisual(kind)))];

  const enemies = snapshot.enemies.map((enemy) => {
    const visual = enemyVisual(enemy.kind);
    const attrs = `data-id="${enemy.id}" data-kind="${escapeHtml(enemy.kind)}" data-alive="${enemy.alive}"`;
    return visual ? entity('enemy', enemy.kind, enemy.x, enemy.z, visual, 3.8, 4.6, attrs,
      enemy.alive ? '' : 'opacity:.38;filter:grayscale(1)', '#a0522d', { current: enemy.hp, max: enemy.maxHp })
      : placeholder('enemy', enemy.kind, enemy.x, enemy.z, attrs);
  }).join('');
  const works = snapshot.works.map((work) => {
    const visual = workVisual(work.id);
    const attrs = `data-index="${work.index}" data-kind="${escapeHtml(work.id)}" data-wrecked="${work.wrecked}"`;
    const rendered = visual ? entity('work', work.id, work.x, work.z, visual, 4.8, 4.8, attrs,
      work.wrecked ? 'opacity:.55;filter:grayscale(.8) sepia(.5)' : '', '#8b7d3c', { current: work.hp, max: work.maxHp })
      : placeholder('work', work.id, work.x, work.z, attrs);
    return `${rendered}${work.wrecked ? `<path d="M ${work.x + 38.4} ${work.z + 26.4} l 3.2 3.2 m 0 -3.2 l -3.2 3.2" stroke="#7f2633" stroke-width=".4" />` : ''}`;
  }).join('');
  const seams = snapshot.seams.map((seam) => entity(
    'seam', seam.id, seam.x, seam.z, seamUrl, 3, 3,
    `data-id="${escapeHtml(seam.id)}" data-remaining="${seam.remaining}"`,
    '',
    '#c4883a',
  )).join('');
  const pickups = snapshot.pickups.map((pickup) => `<g data-replay-entity="pickup" data-index="${pickup.index}" data-amount="${pickup.amount}">
    <circle cx="${pickup.x + 40}" cy="${pickup.z + 28}" r=".38" fill="#ffe4a0" stroke="#8b7d3c" stroke-width=".12" data-x="${pickup.x}" data-z="${pickup.z}" />
    <text x="${pickup.x + 40}" y="${pickup.z + 26.9}" text-anchor="middle" fill="#fff8e8" font-size="1.15">+${Math.round(pickup.amount)}</text>
  </g>`).join('');

  const placeholders = [...TRUE_REEL_PLACEHOLDERS, ...unknownEnemyKinds.map((kind) => `enemy ${kind}`), ...unknownWorkKinds.map((kind) => `work ${kind}`)];
  return `<svg data-testid="lantern-true-world" viewBox="0 0 80 56" preserveAspectRatio="xMidYMid meet" style="width:100%;height:100%;background:#2e1b0e">
    <rect width="80" height="56" fill="#6f5835" />
    <path d="M0 8H80M0 18H80M0 28H80M0 38H80M0 48H80M10 0V56M20 0V56M30 0V56M40 0V56M50 0V56M60 0V56M70 0V56" stroke="#f5e6c8" stroke-width=".08" opacity=".16" />
    ${seams}${works}${pickups}${enemies}
    ${entity('hero', 'Claim Keeper', snapshot.hero.x, snapshot.hero.z, heroUrl, 4.5, 5.4, `data-alive="${snapshot.hero.alive}"`, snapshot.hero.alive ? '' : 'opacity:.4;filter:grayscale(1)', '#c4883a')}
    ${snapshot.rider ? entity('rider', 'Prospector', snapshot.rider.x, snapshot.rider.z, prospectorUrl, 4.2, 4.8, '', '', '#83ded7') : ''}
  </svg>
  <p data-testid="lantern-truth-placeholders" style="position:absolute;left:30px;bottom:clamp(96px,18vh,350px);margin:0;padding:5px 8px;background:rgba(46,27,14,.9);color:#fff8e8;font-size:12px">Snapshot does not carry: ${placeholders.map(escapeHtml).join(' · ')}</p>`;
}

function enemyVisual(kind: string): string | undefined {
  const key = normalize(kind);
  return enemyVisuals[key] ?? (key.includes('baron') ? baronUrl : key === 'claim_jumper' ? enemyUrl : undefined);
}

function workVisual(kind: string): string | undefined {
  return workVisuals[normalize(kind)];
}

function normalize(value: string): string { return value.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, ''); }

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!);
}
