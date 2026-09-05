import type { AgentTapeReplaySnapshot } from '../replay/AgentTapeReplay';
import { trueReelTerrain } from './TrueReelTerrain';

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

export const TRUE_REEL_PLACEHOLDERS = ['decorative props'] as const;

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
  // Night Shift's lantern posts have no replay sprite of their own; the sentry beacon (brass
  // tripod + teal lantern) is the closest shipped visual, so the reel stops drawing a text card
  // for the county's most-watched night map (owner playtest 16, 2026-09-02).
  lantern_post: sentryUrl,
};

function reelParts(snapshot: AgentTapeReplaySnapshot, contractId: string, seed: string, heightAt?: (x: number, z: number) => number): {
  terrain: string;
  terrainPhase: string;
  dynamics: string;
  placeholderText: string;
} {
  const terrain = trueReelTerrain(contractId, seed, snapshot.wave, heightAt);
  const at = (x: number, z: number) => terrain.project(x, z);
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
  ) => {
    const position = at(x, z);
    const scaledWidth = width * terrain.spriteScale;
    const scaledHeight = height * terrain.spriteScale;
    return `<g data-replay-entity="${type}" ${attrs}>
    <title>${escapeHtml(key)}${hp ? ` · ${Math.round(hp.current)}/${Math.round(hp.max)} HP` : ''}</title>
    <ellipse cx="${position.x}" cy="${position.y}" rx="${scaledWidth * .28}" ry="${scaledWidth * .13}" fill="#2e1b0e" opacity=".28" />
    <circle cx="${position.x}" cy="${position.y}" r="${scaledWidth * .37}" fill="none" stroke="${marker}" stroke-width=".16" opacity=".82" />
    <image href="${url}" x="${position.x - scaledWidth / 2}" y="${position.y - scaledHeight * .78}" width="${scaledWidth}" height="${scaledHeight}" preserveAspectRatio="xMidYMid meet" style="${style}" data-x="${x}" data-z="${z}" data-visual="${escapeHtml(key)}" />
    ${hp ? `<rect x="${position.x - scaledWidth * .34}" y="${position.y - scaledHeight * .88}" width="${scaledWidth * .68}" height=".32" fill="#2e1b0e" /><rect x="${position.x - scaledWidth * .32}" y="${position.y - scaledHeight * .86}" width="${scaledWidth * .64 * Math.max(0, hp.max > 0 ? hp.current / hp.max : 0)}" height=".18" fill="#6bb36b" />` : ''}
  </g>`;
  };

  const placeholder = (type: string, key: string, x: number, z: number, attrs: string) => {
    const position = at(x, z);
    return `<g data-replay-entity="${type}" ${attrs} data-placeholder="true">
    <title>${escapeHtml(key)} · visual placeholder</title>
    <rect x="${position.x - 2}" y="${position.y - 4}" width="4" height="4" rx=".4" fill="#f5e6c8" stroke="#a0522d" stroke-width=".28" data-x="${x}" data-z="${z}" data-visual="placeholder:${escapeHtml(key)}" />
    <text x="${position.x}" y="${position.y - 1.6}" text-anchor="middle" fill="#7f2633" font-size=".9">${escapeHtml(key)}</text>
  </g>`;
  };

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
    const position = at(work.x, work.z);
    return `${rendered}${work.wrecked ? `<path d="M ${position.x - 1.6} ${position.y - 1.6} l 3.2 3.2 m 0 -3.2 l -3.2 3.2" stroke="#7f2633" stroke-width=".4" />` : ''}`;
  }).join('');
  const seams = snapshot.seams.map((seam) => entity(
    'seam', seam.id, seam.x, seam.z, seamUrl, 3, 3,
    `data-id="${escapeHtml(seam.id)}" data-remaining="${seam.remaining}"`,
    '',
    '#c4883a',
  )).join('');
  const pickups = snapshot.pickups.map((pickup) => {
    const position = at(pickup.x, pickup.z);
    return `<g data-replay-entity="pickup" data-index="${pickup.index}" data-amount="${pickup.amount}">
    <circle cx="${position.x}" cy="${position.y}" r=".38" fill="#ffe4a0" stroke="#8b7d3c" stroke-width=".12" data-x="${pickup.x}" data-z="${pickup.z}" />
    <text x="${position.x}" y="${position.y - 1.1}" text-anchor="middle" fill="#fff8e8" font-size="1.15">+${Math.round(pickup.amount)}</text>
  </g>`;
  }).join('');

  const placeholders = [...TRUE_REEL_PLACEHOLDERS, ...unknownEnemyKinds.map((kind) => `enemy ${kind}`), ...unknownWorkKinds.map((kind) => `work ${kind}`)];
  return {
    terrain: terrain.svg,
    terrainPhase: terrain.phase,
    dynamics: `${seams}${works}${pickups}${enemies}
      ${entity('hero', 'Claim Keeper', snapshot.hero.x, snapshot.hero.z, heroUrl, 4.5, 5.4, `data-alive="${snapshot.hero.alive}"`, snapshot.hero.alive ? '' : 'opacity:.4;filter:grayscale(1)', '#c4883a')}
      ${snapshot.rider ? entity('rider', 'Prospector', snapshot.rider.x, snapshot.rider.z, prospectorUrl, 4.2, 4.8, '', '', '#83ded7') : ''}`,
    placeholderText: `Reel does not carry: ${placeholders.map(escapeHtml).join(' · ')}`,
  };
}

export function renderTrueReel(snapshot: AgentTapeReplaySnapshot, contractId: string, seed: string, heightAt?: (x: number, z: number) => number): string {
  const parts = reelParts(snapshot, contractId, seed, heightAt);
  return reelShell(parts.terrain, parts.dynamics, parts.placeholderText);
}

export function renderTrueReelGround(contractId: string, seed: string, heightAt?: (x: number, z: number) => number): string {
  const terrain = trueReelTerrain(contractId, seed, 0, heightAt);
  return reelShell(terrain.svg, '', 'Reel does not carry: decorative props');
}

function reelShell(terrain: string, dynamics: string, placeholderText: string): string {
  return `<svg data-testid="lantern-true-world" viewBox="0 0 80 56" preserveAspectRatio="xMidYMid meet" style="width:100%;height:100%;background:#2e1b0e">
    <defs><pattern id="reel-cliff-hatch" width="1.5" height="1.5" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><rect width="1.5" height="1.5" fill="#574536"/><path d="M0 0V1.5" stroke="#d6b36e" stroke-width=".35"/></pattern></defs>
    <rect width="80" height="56" fill="#2e1b0e" />
    ${terrain}
    <g data-replay-dynamics>${dynamics}</g>
  </svg>
  <p data-testid="lantern-truth-placeholders" style="position:absolute;left:30px;bottom:clamp(96px,18vh,350px);margin:0;padding:5px 8px;background:rgba(46,27,14,.9);color:#fff8e8;font-size:12px">${placeholderText}</p>`;
}

export function updateTrueReel(root: HTMLElement, snapshot: AgentTapeReplaySnapshot, contractId: string, seed: string, heightAt?: (x: number, z: number) => number): boolean {
  const dynamics = root.querySelector<SVGGElement>('[data-replay-dynamics]');
  const terrain = root.querySelector<SVGGElement>(`[data-replay-terrain="${CSS.escape(contractId)}"]`);
  const legend = root.querySelector<HTMLElement>('[data-testid="lantern-truth-placeholders"]');
  if (!dynamics || !terrain || !legend) return false;
  if (dynamics.dataset.tick === String(snapshot.tick)) return true;
  const parts = reelParts(snapshot, contractId, seed, heightAt);
  if (terrain.dataset.lightPhase !== parts.terrainPhase) return false;
  dynamics.innerHTML = parts.dynamics;
  dynamics.dataset.tick = String(snapshot.tick);
  legend.innerHTML = parts.placeholderText;
  return true;
}

function enemyVisual(kind: string): string | undefined {
  const key = normalize(kind);
  return enemyVisuals[key] ?? (key.includes('baron') ? baronUrl : key === 'claim_jumper' ? enemyUrl : undefined);
}

export function workVisual(kind: string): string | undefined {
  return workVisuals[normalize(kind)];
}

function normalize(value: string): string { return value.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, ''); }

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!);
}
