export const MEGAPROJECT_STATE_KEY = 'gr.megaprojects.v1';

export type MegaprojectMaterials = Record<string, number>;

export type MegaprojectStageManifest = {
  materials: MegaprojectMaterials;
  buildTicks: number;
  defenseWaves: number[];
  hp?: number;
};

export type MegaprojectManifest = {
  id: string;
  name: string;
  siteFootprint: { x: number; z: number; w: number; d: number };
  stages: MegaprojectStageManifest[];
  unlockCondition: { science: number };
  debugParam?: string;
};

export type MegaprojectProjectState = {
  stage: number;
  funded: boolean;
  ticksRemaining: number;
  hp: number;
  delayTicks: number;
  defenseWave: number;
};

export type MegaprojectState = {
  version: 1;
  projects: Record<string, MegaprojectProjectState>;
};

export type MegaprojectDiagnostics = {
  active: boolean;
  id: string | null;
  name: string | null;
  unlocked: boolean;
  complete: boolean;
  stage: number;
  totalStages: number;
  funded: boolean;
  hp: number;
  maxHp: number;
  ticksRemaining: number;
  delayTicks: number;
  materials: MegaprojectMaterials;
  siteFootprint: MegaprojectManifest['siteFootprint'] | null;
};

export type MegaprojectBuildResult =
  | { type: 'idle' }
  | { type: 'delayed'; delayTicks: number }
  | { type: 'waiting'; defenseWave: number }
  | { type: 'progress'; ticksRemaining: number }
  | { type: 'stage_complete'; stage: number; complete: boolean };

export type MegaprojectDamageResult = {
  applied: boolean;
  hp: number;
  maxHp: number;
  delayed: boolean;
};

export type MegaprojectStorage = Pick<Storage, 'getItem' | 'setItem'>;

export function activeMegaprojectManifest(
  epoch: { megaprojects?: readonly MegaprojectManifest[] },
  search = currentSearch(),
): MegaprojectManifest | null {
  const params = new URLSearchParams(search);
  const debug = params.has('debug');
  const requested = params.get('megaproject');
  return (
    epoch.megaprojects?.find((manifest) =>
      manifest.debugParam ? debug && requested === manifest.debugParam : true,
    ) ?? null
  );
}

export function loadMegaprojectState(storage?: MegaprojectStorage): MegaprojectState {
  let raw: unknown = null;
  try {
    const saved = storage?.getItem(MEGAPROJECT_STATE_KEY);
    raw = saved ? JSON.parse(saved) : null;
  } catch {
    raw = null;
  }
  return migrateMegaprojectState(raw);
}

export function saveMegaprojectState(storage: MegaprojectStorage | undefined, state: MegaprojectState): MegaprojectState {
  const next = migrateMegaprojectState(state);
  try {
    storage?.setItem(MEGAPROJECT_STATE_KEY, JSON.stringify(next));
  } catch {}
  return next;
}

export function ensureMegaprojectProject(
  state: MegaprojectState,
  manifest: MegaprojectManifest,
): MegaprojectProjectState {
  const existing = migrateProjectState(state.projects[manifest.id], manifest);
  state.projects[manifest.id] = existing;
  return existing;
}

export function isMegaprojectUnlocked(manifest: MegaprojectManifest | null, scienceSteps: number): boolean {
  return !!manifest && Math.floor(Math.max(0, scienceSteps)) >= Math.max(0, Math.floor(manifest.unlockCondition.science));
}

export function megaprojectComplete(manifest: MegaprojectManifest, project: MegaprojectProjectState): boolean {
  return project.stage >= manifest.stages.length;
}

export function megaprojectStageCost(manifest: MegaprojectManifest, project: MegaprojectProjectState): number {
  const stage = currentStage(manifest, project);
  return Math.max(0, Math.floor(stage?.materials.gold ?? 0));
}

export function fundMegaprojectStage(
  manifest: MegaprojectManifest,
  project: MegaprojectProjectState,
): boolean {
  const stage = currentStage(manifest, project);
  if (!stage || project.funded || megaprojectComplete(manifest, project)) return false;
  project.funded = true;
  project.ticksRemaining = Math.max(1, Math.floor(stage.buildTicks));
  project.delayTicks = 0;
  project.defenseWave = 0;
  project.hp = stageMaxHp(manifest, project);
  return true;
}

export function advanceMegaprojectBuild(
  manifest: MegaprojectManifest,
  project: MegaprojectProjectState,
): MegaprojectBuildResult {
  if (!project.funded || megaprojectComplete(manifest, project)) return { type: 'idle' };
  const stage = currentStage(manifest, project);
  if (!stage) return { type: 'idle' };
  if (project.delayTicks > 0) {
    project.delayTicks -= 1;
    project.hp = stageMaxHp(manifest, project);
    return { type: 'delayed', delayTicks: project.delayTicks };
  }

  project.defenseWave += 1;
  const defenseWaves = normalizedDefenseWaves(stage);
  if (defenseWaves.length > 0 && !defenseWaves.includes(project.defenseWave)) {
    return { type: 'waiting', defenseWave: project.defenseWave };
  }

  project.ticksRemaining = Math.max(0, project.ticksRemaining - 1);
  if (project.ticksRemaining > 0) return { type: 'progress', ticksRemaining: project.ticksRemaining };

  project.stage += 1;
  project.funded = false;
  project.delayTicks = 0;
  project.defenseWave = 0;
  project.hp = stageMaxHp(manifest, project);
  return { type: 'stage_complete', stage: project.stage, complete: megaprojectComplete(manifest, project) };
}

export function damageMegaprojectStage(
  manifest: MegaprojectManifest,
  project: MegaprojectProjectState,
  amount: number,
): MegaprojectDamageResult {
  const maxHp = stageMaxHp(manifest, project);
  if (!project.funded || maxHp <= 0 || megaprojectComplete(manifest, project)) {
    return { applied: false, hp: project.hp, maxHp, delayed: false };
  }

  project.hp = Math.max(0, Math.min(maxHp, project.hp || maxHp) - Math.max(0, amount));
  if (project.hp > 0) return { applied: amount > 0, hp: project.hp, maxHp, delayed: false };

  if (project.funded) project.delayTicks += 1;
  project.hp = maxHp;
  return { applied: amount > 0, hp: project.hp, maxHp, delayed: project.funded };
}

export function megaprojectDiagnostics(
  manifest: MegaprojectManifest | null,
  project: MegaprojectProjectState | null,
  unlocked: boolean,
): MegaprojectDiagnostics {
  if (!manifest || !project) return emptyDiagnostics;
  const stage = currentStage(manifest, project);
  const maxHp = stageMaxHp(manifest, project);
  return {
    active: unlocked && !megaprojectComplete(manifest, project),
    id: manifest.id,
    name: manifest.name,
    unlocked,
    complete: megaprojectComplete(manifest, project),
    stage: project.stage,
    totalStages: manifest.stages.length,
    funded: project.funded,
    hp: project.hp,
    maxHp,
    ticksRemaining: project.ticksRemaining,
    delayTicks: project.delayTicks,
    materials: stage?.materials ?? {},
    siteFootprint: manifest.siteFootprint,
  };
}

export function stageMaxHp(manifest: MegaprojectManifest, project: MegaprojectProjectState): number {
  const stage = currentStage(manifest, project);
  return Math.max(1, Math.floor(stage?.hp ?? 80 + project.stage * 20));
}

function freshMegaprojectState(): MegaprojectState {
  return { version: 1, projects: {} };
}

function migrateMegaprojectState(raw: unknown): MegaprojectState {
  if (!isRecord(raw) || !isRecord(raw.projects)) return freshMegaprojectState();
  const projects: Record<string, MegaprojectProjectState> = {};
  for (const [id, project] of Object.entries(raw.projects)) {
    if (typeof id === 'string' && isRecord(project)) {
      projects[id] = {
        stage: cleanInt(project.stage),
        funded: project.funded === true,
        ticksRemaining: cleanInt(project.ticksRemaining),
        hp: cleanInt(project.hp),
        delayTicks: cleanInt(project.delayTicks),
        defenseWave: cleanInt(project.defenseWave),
      };
    }
  }
  return { version: 1, projects };
}

function migrateProjectState(raw: unknown, manifest: MegaprojectManifest): MegaprojectProjectState {
  const project = isRecord(raw)
    ? {
        stage: cleanInt(raw.stage),
        funded: raw.funded === true,
        ticksRemaining: cleanInt(raw.ticksRemaining),
        hp: cleanInt(raw.hp),
        delayTicks: cleanInt(raw.delayTicks),
        defenseWave: cleanInt(raw.defenseWave),
      }
    : { stage: 0, funded: false, ticksRemaining: 0, hp: 0, delayTicks: 0, defenseWave: 0 };
  project.stage = Math.min(project.stage, manifest.stages.length);
  project.ticksRemaining = project.funded ? Math.max(1, project.ticksRemaining) : 0;
  project.defenseWave = project.funded ? Math.max(0, project.defenseWave) : 0;
  project.hp = project.hp > 0 ? Math.min(project.hp, stageMaxHp(manifest, project)) : stageMaxHp(manifest, project);
  return project;
}

function currentStage(
  manifest: MegaprojectManifest,
  project: MegaprojectProjectState,
): MegaprojectStageManifest | undefined {
  return manifest.stages[Math.min(project.stage, Math.max(0, manifest.stages.length - 1))];
}

function normalizedDefenseWaves(stage: MegaprojectStageManifest): number[] {
  return [...new Set(stage.defenseWaves.map((wave) => Math.floor(wave)).filter((wave) => wave > 0))].sort(
    (a, b) => a - b,
  );
}

function cleanInt(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function currentSearch(): string {
  try {
    return globalThis.location?.search ?? '';
  } catch {
    return '';
  }
}

const emptyDiagnostics: MegaprojectDiagnostics = {
  active: false,
  id: null,
  name: null,
  unlocked: false,
  complete: false,
  stage: 0,
  totalStages: 0,
  funded: false,
  hp: 0,
  maxHp: 0,
  ticksRemaining: 0,
  delayTicks: 0,
  materials: {},
  siteFootprint: null,
};
