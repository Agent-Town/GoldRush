import type { ContractAuthoredTerrainLayer, ContractEdge, ContractManifest } from '../meta/ContractFamilies';

export type TerrainBrushTool = 'raise' | 'lower' | 'smooth' | 'zone' | 'water' | 'lane';
type SurveyTool = TerrainBrushTool | 'select';

export type TerrainBrushAction = {
  tool: TerrainBrushTool;
  points: readonly TerrainBrushPoint[];
  radiusCells: number;
  strength: number;
  bank: 'north' | 'south';
};

export type TerrainBrushPoint = { x: number; z: number };
export type TerrainBrushResult = { changed: boolean; message: string };
export type TerrainGizmoRef =
  | { kind: 'zone'; index: number }
  | { kind: 'pond'; index: number }
  | { kind: 'spawnGate'; rosterIndex: number; gateIndex: number }
  | { kind: 'fixture'; index: number };
export type TerrainGizmoHandle = 'move' | 'zone-nw' | 'zone-ne' | 'zone-se' | 'zone-sw' | 'pond-radius' | 'fixture-rotate';
export type TerrainGizmoHit = { ref: TerrainGizmoRef; handle: TerrainGizmoHandle };
export type TerrainGizmoAction = {
  ref: TerrainGizmoRef;
  handle: TerrainGizmoHandle;
  from: TerrainBrushPoint;
  to: TerrainBrushPoint;
};

type TerrainBrushPanelOptions = {
  contract: ContractManifest;
  canUndo: boolean;
  canRedo: boolean;
  onCommit: (next: ContractManifest, message: string) => boolean;
  onUndo: () => void;
  onRedo: () => void;
};

type TerrainBrushUiState = {
  version: 1;
  tool: SurveyTool;
  radiusCells: number;
  strength: number;
  bank: 'north' | 'south';
  cursor: TerrainBrushPoint;
};

const GRID_DIMENSION = 41;
const MAX_DELTA = 16;
const MAX_PAINT_SHAPES = 32;
const CANVAS_SIZE = 360;
const GIZMO_HIT_RADIUS_CSS = 22;
const MIN_ZONE_EXTENT = 0.1;
const BRUSH_STATE_KEY = 'gr.editor.brush.v1';
const TERRAIN_TOOLS: readonly TerrainBrushTool[] = ['raise', 'lower', 'smooth'];
const TOOLS: ReadonlyArray<{ id: SurveyTool; label: string }> = [
  { id: 'raise', label: 'Raise' },
  { id: 'lower', label: 'Lower' },
  { id: 'smooth', label: 'Smooth' },
  { id: 'zone', label: 'Build zone' },
  { id: 'water', label: 'Spring pond' },
  { id: 'lane', label: 'Spawn edge' },
  { id: 'select', label: 'Select & move' },
];

export function applyTerrainBrush(contract: ContractManifest, action: TerrainBrushAction): TerrainBrushResult {
  if (action.points.length === 0) return { changed: false, message: 'No survey mark was made.' };
  const size = contract.tileParams.size ?? 64;
  if (!Number.isFinite(size) || size <= 0) return { changed: false, message: 'The claim needs a positive size before it can be painted.' };
  if (TERRAIN_TOOLS.includes(action.tool)) return applyTerrainStroke(contract, action);
  if (action.tool === 'zone') return paintBuildZone(contract, action);
  if (action.tool === 'water') return paintWater(contract, action);
  return paintSpawnEdge(contract, action);
}

export function applyTerrainGizmo(
  draft: ContractManifest,
  source: ContractManifest,
  action: TerrainGizmoAction,
): TerrainBrushResult {
  const half = claimSize(source) / 2;
  const dx = action.to.x - action.from.x;
  const dz = action.to.z - action.from.z;

  if (action.ref.kind === 'zone') {
    const before = source.tileParams.buildZones?.[action.ref.index];
    const next = draft.tileParams.buildZones?.[action.ref.index];
    if (!before || !next) return unchangedGizmo();
    if (action.handle === 'move') {
      const moveX = clamp(dx, -half - before.minX, half - before.maxX);
      const moveZ = clamp(dz, -half - before.minZ, half - before.maxZ);
      next.minX = quantize(before.minX + moveX);
      next.maxX = quantize(before.maxX + moveX);
      next.minZ = quantize(before.minZ + moveZ);
      next.maxZ = quantize(before.maxZ + moveZ);
    } else if (action.handle.startsWith('zone-')) {
      const corner = action.handle.slice(-2);
      if (corner.endsWith('w')) next.minX = quantize(clamp(before.minX + dx, -half, before.maxX - MIN_ZONE_EXTENT));
      if (corner.endsWith('e')) next.maxX = quantize(clamp(before.maxX + dx, before.minX + MIN_ZONE_EXTENT, half));
      if (corner.startsWith('n')) next.maxZ = quantize(clamp(before.maxZ + dz, before.minZ + MIN_ZONE_EXTENT, half));
      if (corner.startsWith('s')) next.minZ = quantize(clamp(before.minZ + dz, -half, before.maxZ - MIN_ZONE_EXTENT));
    } else {
      return unchangedGizmo();
    }
    return changedFields(before, next)
      ? { changed: true, message: action.handle === 'move' ? 'Build zone moved on the descriptor.' : 'Build zone resized on the descriptor.' }
      : unchangedGizmo();
  }

  if (action.ref.kind === 'pond') {
    const before = source.tileParams.waterSources[action.ref.index];
    const next = draft.tileParams.waterSources[action.ref.index];
    if (!before || !next) return unchangedGizmo();
    if (action.handle === 'move') {
      next.x = quantize(clamp(before.x + dx, -half + before.radius, half - before.radius));
      next.z = quantize(clamp(before.z + dz, -half + before.radius, half - before.radius));
    } else if (action.handle === 'pond-radius') {
      const maxRadius = Math.max(0.01, Math.min(128, half - Math.abs(before.x), half - Math.abs(before.z)));
      const radiusDelta = pointDistance(action.to, before) - pointDistance(action.from, before);
      next.radius = quantize(clamp(before.radius + radiusDelta, 0.01, maxRadius));
    } else {
      return unchangedGizmo();
    }
    return changedFields(before, next)
      ? { changed: true, message: action.handle === 'move' ? 'Spring pond moved on the descriptor.' : 'Spring pond resized on the descriptor.' }
      : unchangedGizmo();
  }

  if (action.ref.kind === 'spawnGate') {
    const before = source.twist.enemyRoster?.[action.ref.rosterIndex]?.spawnGates?.[action.ref.gateIndex];
    const next = draft.twist.enemyRoster?.[action.ref.rosterIndex]?.spawnGates?.[action.ref.gateIndex];
    if (!before || !next || action.handle !== 'move') return unchangedGizmo();
    if (before.edge === 'north' || before.edge === 'south') next.x = quantize(clamp(before.x + dx, -half, half));
    else next.z = quantize(clamp(before.z + dz, -half, half));
    return changedFields(before, next) ? { changed: true, message: 'Spawn gate moved along its claim edge.' } : unchangedGizmo();
  }

  const before = source.tileParams.prePlacedBuildables?.[action.ref.index];
  const next = draft.tileParams.prePlacedBuildables?.[action.ref.index];
  if (!before || !next) return unchangedGizmo();
  if (action.handle === 'fixture-rotate') {
    if (!fixtureCanRotate(before)) return unchangedGizmo();
    next.rotationSteps = normalizedRotationSteps((before.rotationSteps ?? 0) + 1);
    return changedFields(before, next) ? { changed: true, message: 'Fixture turned a quarter-step on the descriptor.' } : unchangedGizmo();
  }
  if (action.handle !== 'move') return unchangedGizmo();
  if (Math.abs(dx) > 1e-9) next.x = Math.round(clamp(before.x + dx, -half, half));
  if (Math.abs(dz) > 1e-9) next.z = Math.round(clamp(before.z + dz, -half, half));
  return changedFields(before, next) ? { changed: true, message: 'Fixture moved on the descriptor.' } : unchangedGizmo();
}

export function terrainGizmoHitRadiusWorld(contract: ContractManifest, canvasCssWidth: number): number {
  return canvasCssWidth > 0 ? (GIZMO_HIT_RADIUS_CSS / canvasCssWidth) * claimSize(contract) : 0;
}

export function hitTerrainGizmo(
  contract: ContractManifest,
  point: TerrainBrushPoint,
  hitRadius: number,
  selected: TerrainGizmoRef | null = null,
): TerrainGizmoHit | null {
  if (selected?.kind === 'zone') {
    const zone = contract.tileParams.buildZones?.[selected.index];
    if (zone) {
      const handles: Array<[TerrainGizmoHandle, TerrainBrushPoint]> = [
        ['zone-nw', { x: zone.minX, z: zone.maxZ }],
        ['zone-ne', { x: zone.maxX, z: zone.maxZ }],
        ['zone-se', { x: zone.maxX, z: zone.minZ }],
        ['zone-sw', { x: zone.minX, z: zone.minZ }],
      ];
      const handle = handles
        .map(([name, position]) => [name, pointDistance(point, position)] as const)
        .filter(([, distance]) => distance <= hitRadius)
        .sort((left, right) => left[1] - right[1])[0];
      if (handle) return { ref: selected, handle: handle[0] };
    }
  } else if (selected?.kind === 'pond') {
    const pond = contract.tileParams.waterSources[selected.index];
    const handleOffset = pond ? Math.max(pond.radius, hitRadius * 1.25) : 0;
    if (pond && pointDistance(point, { x: pond.x + handleOffset, z: pond.z }) <= hitRadius) {
      return { ref: selected, handle: 'pond-radius' };
    }
  } else if (selected?.kind === 'fixture') {
    const fixture = contract.tileParams.prePlacedBuildables?.[selected.index];
    if (fixture && fixtureCanRotate(fixture) && pointDistance(point, fixtureRotateHandle(fixture, hitRadius, claimSize(contract) / 2)) <= hitRadius) {
      return { ref: selected, handle: 'fixture-rotate' };
    }
  }

  const gates = contract.twist.enemyRoster?.flatMap((variant, rosterIndex) =>
    (variant.spawnGates ?? []).map((gate, gateIndex) => ({ gate, ref: { kind: 'spawnGate', rosterIndex, gateIndex } as TerrainGizmoRef })),
  ) ?? [];
  for (const { gate, ref } of gates.reverse()) {
    if (pointDistance(point, gate) <= hitRadius) return { ref, handle: 'move' };
  }
  const fixtures = contract.tileParams.prePlacedBuildables ?? [];
  for (let index = fixtures.length - 1; index >= 0; index -= 1) {
    if (pointDistance(point, fixtures[index]!) <= hitRadius) return { ref: { kind: 'fixture', index }, handle: 'move' };
  }
  for (let index = contract.tileParams.waterSources.length - 1; index >= 0; index -= 1) {
    const pond = contract.tileParams.waterSources[index]!;
    if (pointDistance(point, pond) <= pond.radius + hitRadius) return { ref: { kind: 'pond', index }, handle: 'move' };
  }
  const zones = contract.tileParams.buildZones ?? [];
  for (let index = zones.length - 1; index >= 0; index -= 1) {
    const zone = zones[index]!;
    if (
      point.x >= zone.minX - hitRadius && point.x <= zone.maxX + hitRadius &&
      point.z >= zone.minZ - hitRadius && point.z <= zone.maxZ + hitRadius
    ) {
      return { ref: { kind: 'zone', index }, handle: 'move' };
    }
  }
  return null;
}

export function createTerrainBrushPanel(options: TerrainBrushPanelOptions): HTMLElement {
  const savedState = readBrushState(options.contract);
  const panel = document.createElement('section');
  panel.className = 'terrain-brush';
  panel.setAttribute('aria-labelledby', 'terrain-brush-title');
  panel.innerHTML = `
    <div class="terrain-brush__heading">
      <div>
        <p>Survey table</p>
        <h2 id="terrain-brush-title">Terrain brush</h2>
      </div>
      <div class="terrain-brush__history">
        <button type="button" data-testid="terrain-brush-undo" ${options.canUndo ? '' : 'disabled'}>Undo</button>
        <button type="button" data-testid="terrain-brush-redo" ${options.canRedo ? '' : 'disabled'}>Redo</button>
      </div>
    </div>
    <div class="terrain-brush__tools" role="toolbar" aria-label="Survey tool">
      ${TOOLS.map(({ id, label }, index) => `<button type="button" data-tool="${id}" data-testid="terrain-brush-mode-${id}" aria-pressed="${index === 0}">${label}</button>`).join('')}
    </div>
    <div class="terrain-brush__settings">
      <label data-size-row>Brush size <input type="range" min="1" max="8" step="1" value="3" data-testid="terrain-brush-size"><output>3 cells</output></label>
      <label data-strength-row>Strength <input type="range" min="0.05" max="1" step="0.05" value="0.5" data-testid="terrain-brush-strength"><output>0.50</output></label>
      <label data-bank-row hidden>Zone bank <select data-testid="terrain-brush-bank"><option value="north">North</option><option value="south">South</option></select></label>
    </div>
    <canvas width="${CANVAS_SIZE}" height="${CANVAS_SIZE}" tabindex="0" data-testid="terrain-brush-map" aria-label="Top-down claim survey. Arrow keys move the cursor; Space applies the selected tool."></canvas>
    <div class="terrain-brush__readout">
      <span aria-live="polite" data-testid="terrain-brush-coordinates">x 0.0 · z 0.0</span>
      <span>Brush marks or select descriptor handles.</span>
    </div>
    <p class="terrain-brush__status" role="status" aria-live="polite" data-testid="terrain-brush-status">Ready to mark the descriptor.</p>`;

  const canvas = panel.querySelector<HTMLCanvasElement>('[data-testid="terrain-brush-map"]')!;
  const sizeInput = panel.querySelector<HTMLInputElement>('[data-testid="terrain-brush-size"]')!;
  const strengthInput = panel.querySelector<HTMLInputElement>('[data-testid="terrain-brush-strength"]')!;
  const bankInput = panel.querySelector<HTMLSelectElement>('[data-testid="terrain-brush-bank"]')!;
  const sizeOutput = sizeInput.nextElementSibling as HTMLOutputElement;
  const strengthOutput = strengthInput.nextElementSibling as HTMLOutputElement;
  const sizeRow = panel.querySelector<HTMLElement>('[data-size-row]')!;
  const strengthRow = panel.querySelector<HTMLElement>('[data-strength-row]')!;
  const bankRow = panel.querySelector<HTMLElement>('[data-bank-row]')!;
  const coordinates = panel.querySelector<HTMLElement>('[data-testid="terrain-brush-coordinates"]')!;
  const status = panel.querySelector<HTMLElement>('[data-testid="terrain-brush-status"]')!;
  let tool = savedState.tool;
  let cursor = savedState.cursor;
  let pointerId: number | null = null;
  let points: TerrainBrushPoint[] = [];
  let selected: TerrainGizmoRef | null = null;
  let gizmo: { hit: TerrainGizmoHit; from: TerrainBrushPoint; draft: ContractManifest; result: TerrainBrushResult } | null = null;
  let activeTool: SurveyTool | null = null;
  let activeBrush: Omit<TerrainBrushAction, 'points'> | null = null;

  sizeInput.value = String(savedState.radiusCells);
  strengthInput.value = String(savedState.strength);
  bankInput.value = savedState.bank;
  sizeOutput.value = `${savedState.radiusCells} cells`;
  strengthOutput.value = savedState.strength.toFixed(2);
  panel.querySelectorAll<HTMLButtonElement>('[data-tool]').forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.tool === tool));
  });

  const brushSettings = (): Omit<TerrainBrushAction, 'points'> => ({
    tool: tool as TerrainBrushTool,
    radiusCells: Number(sizeInput.value),
    strength: Number(strengthInput.value),
    bank: bankInput.value as 'north' | 'south',
  });
  const commitBrush = (actionPoints: readonly TerrainBrushPoint[], settings = brushSettings()) => {
    const next = structuredClone(options.contract);
    const result = applyTerrainBrush(next, { ...settings, points: actionPoints });
    status.textContent = result.message;
    if (result.changed && !options.onCommit(next, result.message)) status.textContent = 'The descriptor rejected that mark.';
  };
  const updateCursor = (point: TerrainBrushPoint) => {
    cursor = point;
    coordinates.textContent = `x ${point.x.toFixed(1)} · z ${point.z.toFixed(1)}`;
  };
  const draw = () => drawSurvey(canvas, gizmo?.draft ?? options.contract, cursor, Number(sizeInput.value), points, tool, selected, gizmo?.hit ?? null);
  const updateToolRows = () => {
    const selecting = tool === 'select';
    sizeRow.hidden = selecting;
    strengthRow.hidden = selecting || !TERRAIN_TOOLS.includes(tool as TerrainBrushTool);
    bankRow.hidden = selecting || tool !== 'zone';
    canvas.dataset.mode = tool;
    canvas.setAttribute(
      'aria-label',
      selecting
        ? 'Top-down claim survey. Arrow keys move the cursor; Space or Enter selects a mark. Use its inspector fields for keyboard editing.'
        : 'Top-down claim survey. Arrow keys move the cursor; Space or Enter applies the selected brush.',
    );
  };
  const persist = () => writeBrushState(options.contract, {
    version: 1,
    tool,
    radiusCells: Number(sizeInput.value),
    strength: Number(strengthInput.value),
    bank: bankInput.value as 'north' | 'south',
    cursor,
  });

  panel.querySelectorAll<HTMLButtonElement>('[data-tool]').forEach((button) => {
    button.addEventListener('click', () => {
      if (pointerId !== null) return;
      tool = button.dataset.tool as SurveyTool;
      panel.querySelectorAll<HTMLButtonElement>('[data-tool]').forEach((entry) => entry.setAttribute('aria-pressed', String(entry === button)));
      selected = null;
      updateToolRows();
      status.textContent = `${button.textContent} selected.`;
      persist();
      draw();
    });
  });
  sizeInput.addEventListener('input', () => {
    sizeOutput.value = `${sizeInput.value} cells`;
    persist();
    draw();
  });
  strengthInput.addEventListener('input', () => {
    strengthOutput.value = Number(strengthInput.value).toFixed(2);
    persist();
  });
  bankInput.addEventListener('change', persist);
  panel.querySelector<HTMLButtonElement>('[data-testid="terrain-brush-undo"]')!.addEventListener('click', () => {
    if (pointerId === null) options.onUndo();
  });
  panel.querySelector<HTMLButtonElement>('[data-testid="terrain-brush-redo"]')!.addEventListener('click', () => {
    if (pointerId === null) options.onRedo();
  });

  canvas.addEventListener('pointerdown', (event) => {
    if (event.button !== 0 || pointerId !== null) return;
    event.preventDefault();
    updateCursor(canvasPoint(canvas, event.clientX, event.clientY, options.contract));
    if (tool === 'select') {
      const hit = hitTerrainGizmo(options.contract, cursor, terrainGizmoHitRadiusWorld(options.contract, canvas.getBoundingClientRect().width), selected);
      if (!hit) {
        selected = null;
        status.textContent = 'No placed descriptor mark at that spot.';
        draw();
        return;
      }
      selected = hit.ref;
      gizmo = { hit, from: cursor, draft: structuredClone(options.contract), result: unchangedGizmo() };
      status.textContent = `${gizmoLabel(hit.ref)} selected. ${gizmoInstruction(hit.handle)}`;
    } else {
      points = [cursor];
      activeBrush = brushSettings();
    }
    activeTool = tool;
    pointerId = event.pointerId;
    canvas.setPointerCapture(event.pointerId);
    draw();
  });
  canvas.addEventListener('pointermove', (event) => {
    if (pointerId !== null && pointerId !== event.pointerId) return;
    updateCursor(canvasPoint(canvas, event.clientX, event.clientY, options.contract));
    if (pointerId === event.pointerId) {
      if (activeTool === 'select' && gizmo) {
        gizmo.result = applyTerrainGizmo(gizmo.draft, options.contract, { ...gizmo.hit, from: gizmo.from, to: cursor });
        if (gizmo.result.changed) status.textContent = `${gizmo.result.message} Release to commit.`;
      } else if (TERRAIN_TOOLS.includes(activeTool as TerrainBrushTool)) points.push(cursor);
      else if (activeTool === 'zone') points = [points[0] ?? cursor, cursor];
    }
    draw();
  });
  canvas.addEventListener('pointerup', (event) => {
    if (pointerId !== event.pointerId) return;
    event.preventDefault();
    updateCursor(canvasPoint(canvas, event.clientX, event.clientY, options.contract));
    if (activeTool === 'select' && gizmo) {
      gizmo.result = applyTerrainGizmo(gizmo.draft, options.contract, { ...gizmo.hit, from: gizmo.from, to: cursor });
      canvas.releasePointerCapture(event.pointerId);
      pointerId = null;
      activeTool = null;
      const completed = gizmo;
      gizmo = null;
      persist();
      draw();
      if (!completed.result.changed) {
        status.textContent = `${gizmoLabel(completed.hit.ref)} selected.`;
      } else if (!options.onCommit(completed.draft, completed.result.message)) {
        status.textContent = 'The descriptor rejected that gizmo move.';
      }
      return;
    }
    if (TERRAIN_TOOLS.includes(activeTool as TerrainBrushTool)) points.push(cursor);
    else if (activeTool === 'zone') points = [points[0] ?? cursor, cursor];
    else points = [cursor];
    canvas.releasePointerCapture(event.pointerId);
    pointerId = null;
    const committedPoints = points;
    const committedBrush = activeBrush ?? brushSettings();
    points = [];
    activeBrush = null;
    activeTool = null;
    persist();
    draw();
    commitBrush(committedPoints, committedBrush);
  });
  canvas.addEventListener('pointercancel', (event) => {
    if (event.pointerId !== pointerId) return;
    if (pointerId !== null && canvas.hasPointerCapture(pointerId)) canvas.releasePointerCapture(pointerId);
    pointerId = null;
    activeTool = null;
    activeBrush = null;
    points = [];
    const cancelledGizmo = gizmo !== null;
    gizmo = null;
    status.textContent = cancelledGizmo ? 'Gizmo gesture cancelled.' : 'Survey stroke cancelled.';
    draw();
  });
  canvas.addEventListener('keydown', (event) => {
    const step = brushCellSize(options.contract) * (event.shiftKey ? 4 : 1);
    if (event.key === 'ArrowLeft') cursor = { ...cursor, x: cursor.x - step };
    else if (event.key === 'ArrowRight') cursor = { ...cursor, x: cursor.x + step };
    else if (event.key === 'ArrowUp') cursor = { ...cursor, z: cursor.z + step };
    else if (event.key === 'ArrowDown') cursor = { ...cursor, z: cursor.z - step };
    else if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      persist();
      if (tool === 'select') {
        selected = hitTerrainGizmo(options.contract, cursor, terrainGizmoHitRadiusWorld(options.contract, canvas.getBoundingClientRect().width), selected)?.ref ?? null;
        status.textContent = selected ? `${gizmoLabel(selected)} selected. Use its inspector fields or drag it on the survey.` : 'No placed descriptor mark at the cursor.';
        draw();
      } else {
        commitBrush([cursor]);
      }
      return;
    } else return;
    event.preventDefault();
    const half = claimSize(options.contract) / 2;
    updateCursor({ x: clamp(cursor.x, -half, half), z: clamp(cursor.z, -half, half) });
    persist();
    draw();
  });

  updateToolRows();
  updateCursor(cursor);
  draw();
  return panel;
}

function applyTerrainStroke(contract: ContractManifest, action: TerrainBrushAction): TerrainBrushResult {
  const layer = structuredClone(contract.tileParams.authoredTerrain ?? createAuthoredLayer(contract));
  const path = action.points.map((point) => ({
    column: clamp((point.x - layer.originX) / layer.cellSize, 0, layer.columns - 1),
    row: clamp((point.z - layer.originZ) / layer.cellSize, 0, layer.rows - 1),
  }));
  const source = layer.heightDeltas;
  const next = [...source];
  const radius = clamp(Math.round(action.radiusCells), 1, 8);
  const strength = clamp(action.strength, 0.05, 1);
  let changed = false;

  for (let row = 1; row < layer.rows - 1; row += 1) {
    for (let column = 1; column < layer.columns - 1; column += 1) {
      let weight = 0;
      const distance = distanceToPath(column, row, path);
      if (distance <= radius) weight = 1 - distance / radius;
      if (distance === 0) weight = 1;
      if (weight <= 0) continue;
      const index = row * layer.columns + column;
      const current = source[index] ?? 0;
      let value = current;
      if (action.tool === 'raise') value += strength * weight;
      else if (action.tool === 'lower') value -= strength * weight;
      else value += (neighborMean(source, layer.columns, column, row) - current) * strength * weight;
      value = quantize(clamp(value, -MAX_DELTA, MAX_DELTA));
      if (value !== current) {
        next[index] = value;
        changed = true;
      }
    }
  }

  if (!changed) return { changed: false, message: 'That stroke left the terrain unchanged.' };
  layer.heightDeltas = next;
  contract.tileParams.authoredTerrain = layer;
  return { changed: true, message: `${title(action.tool)} stroke written to the descriptor.` };
}

function paintBuildZone(contract: ContractManifest, action: TerrainBrushAction): TerrainBrushResult {
  const zones = contract.tileParams.buildZones ?? [];
  if (zones.length >= MAX_PAINT_SHAPES) return { changed: false, message: 'The descriptor already holds 32 build zones.' };
  const size = claimSize(contract);
  const half = size / 2;
  const cellSize = brushCellSize(contract);
  const stampRadius = clamp(Math.round(action.radiusCells), 1, 8) * cellSize;
  const start = action.points[0]!;
  const end = action.points.at(-1)!;
  let minX = clamp(Math.min(start.x, end.x), -half, half);
  let maxX = clamp(Math.max(start.x, end.x), -half, half);
  let minZ = clamp(Math.min(start.z, end.z), -half, half);
  let maxZ = clamp(Math.max(start.z, end.z), -half, half);
  if (maxX - minX < cellSize) {
    minX = clamp(start.x - stampRadius, -half, half);
    maxX = clamp(start.x + stampRadius, -half, half);
  }
  if (maxZ - minZ < cellSize) {
    minZ = clamp(start.z - stampRadius, -half, half);
    maxZ = clamp(start.z + stampRadius, -half, half);
  }
  contract.tileParams.buildZones = [
    ...zones,
    { id: nextZoneId(zones.map((zone) => zone.id)), bank: action.bank, minX: quantize(minX), maxX: quantize(maxX), minZ: quantize(minZ), maxZ: quantize(maxZ) },
  ];
  return { changed: true, message: `${title(action.bank)} build zone written as a rectangle.` };
}

function paintWater(contract: ContractManifest, action: TerrainBrushAction): TerrainBrushResult {
  if (contract.tileParams.waterSources.length >= MAX_PAINT_SHAPES) {
    return { changed: false, message: 'The descriptor already holds 32 spring ponds.' };
  }
  const half = claimSize(contract) / 2;
  const maxRadius = Math.min(128, half);
  const minRadius = Math.min(brushCellSize(contract), maxRadius);
  const radius = clamp(Math.round(action.radiusCells) * brushCellSize(contract), minRadius, maxRadius);
  const point = action.points.at(-1)!;
  contract.tileParams.waterSources = [
    ...contract.tileParams.waterSources,
    {
      kind: 'spring_pond',
      x: quantize(clamp(point.x, -half + radius, half - radius)),
      z: quantize(clamp(point.z, -half + radius, half - radius)),
      radius: quantize(radius),
    },
  ];
  return { changed: true, message: 'Spring pond written as a circle.' };
}

function paintSpawnEdge(contract: ContractManifest, action: TerrainBrushAction): TerrainBrushResult {
  const edge = nearestEdge(action.points.at(-1)!, claimSize(contract) / 2);
  const edges = contract.tileParams.lanes.spawnEdges;
  if (!edges.includes(edge)) {
    contract.tileParams.lanes.spawnEdges = [...edges, edge];
    return { changed: true, message: `${title(edge)} spawn edge added.` };
  }
  if (edges.length === 1) return { changed: false, message: 'A contract must keep at least one spawn edge.' };
  contract.tileParams.lanes.spawnEdges = edges.filter((entry) => entry !== edge);
  return { changed: true, message: `${title(edge)} spawn edge removed.` };
}

function createAuthoredLayer(contract: ContractManifest): ContractAuthoredTerrainLayer {
  const size = claimSize(contract);
  return {
    version: 1,
    mode: 'visual-delta',
    columns: GRID_DIMENSION,
    rows: GRID_DIMENSION,
    cellSize: size / (GRID_DIMENSION - 1),
    originX: -size / 2,
    originZ: -size / 2,
    heightDeltas: Array(GRID_DIMENSION * GRID_DIMENSION).fill(0),
  };
}

function distanceToPath(column: number, row: number, path: ReadonlyArray<{ column: number; row: number }>): number {
  if (path.length === 1) return Math.hypot(column - path[0]!.column, row - path[0]!.row);
  let best = Number.POSITIVE_INFINITY;
  for (let index = 1; index < path.length; index += 1) {
    const from = path[index - 1]!;
    const to = path[index]!;
    const dx = to.column - from.column;
    const dy = to.row - from.row;
    const lengthSq = dx * dx + dy * dy;
    const t = lengthSq === 0 ? 0 : clamp(((column - from.column) * dx + (row - from.row) * dy) / lengthSq, 0, 1);
    best = Math.min(best, Math.hypot(column - (from.column + dx * t), row - (from.row + dy * t)));
  }
  return best;
}

function neighborMean(values: readonly number[], columns: number, column: number, row: number): number {
  let total = 0;
  for (let z = row - 1; z <= row + 1; z += 1) {
    for (let x = column - 1; x <= column + 1; x += 1) total += values[z * columns + x] ?? 0;
  }
  return total / 9;
}

function drawSurvey(
  canvas: HTMLCanvasElement,
  contract: ContractManifest,
  cursor: TerrainBrushPoint,
  radiusCells: number,
  stroke: readonly TerrainBrushPoint[],
  tool: SurveyTool,
  selected: TerrainGizmoRef | null,
  activeGizmo: TerrainGizmoHit | null,
): void {
  const context = canvas.getContext('2d');
  if (!context) return;
  const size = claimSize(contract);
  const half = size / 2;
  const toX = (x: number) => ((x + half) / size) * canvas.width;
  const toY = (z: number) => ((half - z) / size) * canvas.height;
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = '#f5e6c8';
  context.fillRect(0, 0, canvas.width, canvas.height);

  if (contract.tileParams.river) {
    context.fillStyle = 'rgba(91, 138, 138, 0.24)';
    context.fillRect(0, toY(5), canvas.width, toY(-5) - toY(5));
  }
  const layer = contract.tileParams.authoredTerrain;
  if (layer) {
    const cell = canvas.width / (layer.columns - 1);
    for (let row = 0; row < layer.rows; row += 1) {
      for (let column = 0; column < layer.columns; column += 1) {
        const value = layer.heightDeltas[row * layer.columns + column] ?? 0;
        if (value === 0) continue;
        const alpha = Math.min(0.72, 0.16 + Math.abs(value) / MAX_DELTA);
        context.fillStyle = value > 0 ? `rgba(196, 136, 58, ${alpha})` : `rgba(91, 138, 138, ${alpha})`;
        context.fillRect(column * cell - cell / 2, canvas.height - row * cell - cell / 2, cell, cell);
      }
    }
  }
  for (const zone of contract.tileParams.buildZones ?? []) {
    context.fillStyle = zone.bank === 'north' ? 'rgba(196, 136, 58, 0.25)' : 'rgba(160, 82, 45, 0.22)';
    context.strokeStyle = zone.bank === 'north' ? '#8b7d3c' : '#a0522d';
    const x = toX(zone.minX);
    const y = toY(zone.maxZ);
    const width = toX(zone.maxX) - x;
    const height = toY(zone.minZ) - y;
    context.fillRect(x, y, width, height);
    context.strokeRect(x, y, width, height);
  }
  for (const source of contract.tileParams.waterSources) {
    context.beginPath();
    context.fillStyle = 'rgba(91, 138, 138, 0.42)';
    context.strokeStyle = '#3f7778';
    context.arc(toX(source.x), toY(source.z), (source.radius / size) * canvas.width, 0, Math.PI * 2);
    context.fill();
    context.stroke();
  }
  drawSpawnEdges(context, contract.tileParams.lanes.spawnEdges, canvas.width, canvas.height);

  context.strokeStyle = 'rgba(111, 87, 50, 0.22)';
  context.lineWidth = 1;
  for (let index = 0; index <= 8; index += 1) {
    const at = (index / 8) * canvas.width;
    context.beginPath(); context.moveTo(at, 0); context.lineTo(at, canvas.height); context.stroke();
    context.beginPath(); context.moveTo(0, at); context.lineTo(canvas.width, at); context.stroke();
  }
  if (stroke.length > 1 && tool === 'zone') {
    const start = stroke[0]!;
    const end = stroke.at(-1)!;
    context.strokeStyle = '#a0522d';
    context.setLineDash([6, 4]);
    context.strokeRect(toX(Math.min(start.x, end.x)), toY(Math.max(start.z, end.z)), Math.abs(toX(end.x) - toX(start.x)), Math.abs(toY(end.z) - toY(start.z)));
    context.setLineDash([]);
  } else if (stroke.length > 1) {
    context.beginPath();
    context.strokeStyle = '#a0522d';
    context.lineWidth = 3;
    context.moveTo(toX(stroke[0]!.x), toY(stroke[0]!.z));
    for (const point of stroke.slice(1)) context.lineTo(toX(point.x), toY(point.z));
    context.stroke();
  }
  if (tool === 'select') {
    drawGizmoLayer(
      context,
      contract,
      toX,
      toY,
      selected,
      terrainGizmoHitRadiusWorld(contract, canvas.getBoundingClientRect().width),
      activeGizmo,
      cursor,
    );
  }
  context.beginPath();
  context.strokeStyle = '#2e1b0e';
  context.lineWidth = 2;
  context.arc(
    toX(cursor.x),
    toY(cursor.z),
    tool === 'select' ? 4 : (radiusCells * brushCellSize(contract) / size) * canvas.width,
    0,
    Math.PI * 2,
  );
  context.stroke();
  context.fillStyle = '#2e1b0e';
  context.font = 'bold 13px Georgia';
  context.fillText('N', canvas.width / 2 - 5, 16);
  context.strokeStyle = '#2e1b0e';
  context.lineWidth = 2;
  context.strokeRect(1, 1, canvas.width - 2, canvas.height - 2);
}

function drawGizmoLayer(
  context: CanvasRenderingContext2D,
  contract: ContractManifest,
  toX: (x: number) => number,
  toY: (z: number) => number,
  selected: TerrainGizmoRef | null,
  hitRadius: number,
  activeGizmo: TerrainGizmoHit | null,
  cursor: TerrainBrushPoint,
): void {
  context.save();
  context.lineWidth = 2;
  for (const [rosterIndex, variant] of (contract.twist.enemyRoster ?? []).entries()) {
    for (const [gateIndex, gate] of (variant.spawnGates ?? []).entries()) {
      const x = toX(gate.x);
      const y = toY(gate.z);
      context.beginPath();
      context.fillStyle = '#3f7778';
      context.strokeStyle = sameGizmoRef(selected, { kind: 'spawnGate', rosterIndex, gateIndex }) ? '#a0522d' : '#2e1b0e';
      context.moveTo(x, y - 7);
      context.lineTo(x + 7, y);
      context.lineTo(x, y + 7);
      context.lineTo(x - 7, y);
      context.closePath();
      context.fill();
      context.stroke();
    }
  }
  for (const [index, fixture] of (contract.tileParams.prePlacedBuildables ?? []).entries()) {
    const x = toX(fixture.x);
    const y = toY(fixture.z);
    context.fillStyle = '#c4883a';
    context.strokeStyle = sameGizmoRef(selected, { kind: 'fixture', index }) ? '#a0522d' : '#2e1b0e';
    context.fillRect(x - 6, y - 6, 12, 12);
    context.strokeRect(x - 6, y - 6, 12, 12);
    context.beginPath();
    if (fixtureCanRotate(fixture)) {
      const yaw = normalizedRotationSteps(fixture.rotationSteps ?? 0) * (Math.PI / 2);
      context.moveTo(x, y);
      context.lineTo(x + Math.cos(yaw) * 10, y + Math.sin(yaw) * 10);
    } else {
      context.moveTo(x, y - 9);
      context.lineTo(x, y + 9);
    }
    context.stroke();
  }

  if (selected?.kind === 'zone') {
    const zone = contract.tileParams.buildZones?.[selected.index];
    if (zone) {
      context.strokeStyle = '#a0522d';
      context.lineWidth = 3;
      context.strokeRect(toX(zone.minX), toY(zone.maxZ), toX(zone.maxX) - toX(zone.minX), toY(zone.minZ) - toY(zone.maxZ));
      drawGizmoHandle(context, toX(zone.minX), toY(zone.maxZ));
      drawGizmoHandle(context, toX(zone.maxX), toY(zone.maxZ));
      drawGizmoHandle(context, toX(zone.maxX), toY(zone.minZ));
      drawGizmoHandle(context, toX(zone.minX), toY(zone.minZ));
    }
  } else if (selected?.kind === 'pond') {
    const pond = contract.tileParams.waterSources[selected.index];
    if (pond) {
      const centerX = toX(pond.x);
      const centerY = toY(pond.z);
      const activeRadius = activeGizmo?.handle === 'pond-radius' && sameGizmoRef(selected, activeGizmo.ref);
      const handle = activeRadius ? cursor : { x: pond.x + Math.max(pond.radius, hitRadius * 1.25), z: pond.z };
      const directionLength = Math.max(1e-9, pointDistance(handle, pond));
      const edge = {
        x: pond.x + (handle.x - pond.x) / directionLength * pond.radius,
        z: pond.z + (handle.z - pond.z) / directionLength * pond.radius,
      };
      const edgeX = toX(edge.x);
      const edgeY = toY(edge.z);
      const handleX = toX(handle.x);
      const handleY = toY(handle.z);
      const circleRadius = Math.hypot(edgeX - centerX, edgeY - centerY);
      context.beginPath();
      context.strokeStyle = '#a0522d';
      context.lineWidth = 3;
      context.arc(centerX, centerY, circleRadius, 0, Math.PI * 2);
      context.stroke();
      context.beginPath();
      context.moveTo(edgeX, edgeY);
      context.lineTo(handleX, handleY);
      context.stroke();
      drawGizmoHandle(context, handleX, handleY);
    }
  } else if (selected?.kind === 'fixture') {
    const fixture = contract.tileParams.prePlacedBuildables?.[selected.index];
    if (fixture && fixtureCanRotate(fixture)) {
      const handle = fixtureRotateHandle(fixture, hitRadius, claimSize(contract) / 2);
      const fixtureX = toX(fixture.x);
      const fixtureY = toY(fixture.z);
      const handleX = toX(handle.x);
      const handleY = toY(handle.z);
      context.beginPath();
      context.strokeStyle = '#a0522d';
      context.lineWidth = 2;
      context.moveTo(fixtureX, fixtureY);
      context.lineTo(handleX, handleY);
      context.stroke();
      drawGizmoHandle(context, handleX, handleY);
      context.fillStyle = '#a0522d';
      context.font = 'bold 12px Georgia';
      context.fillText('↻', handleX - 5, handleY + 4);
    }
  }
  context.restore();
}

function drawGizmoHandle(context: CanvasRenderingContext2D, x: number, y: number): void {
  context.fillStyle = '#fff8e8';
  context.strokeStyle = '#a0522d';
  context.lineWidth = 2;
  context.fillRect(x - 6, y - 6, 12, 12);
  context.strokeRect(x - 6, y - 6, 12, 12);
}

function drawSpawnEdges(context: CanvasRenderingContext2D, edges: readonly ContractEdge[], width: number, height: number): void {
  context.strokeStyle = '#5b8a8a';
  context.lineWidth = 7;
  for (const edge of edges) {
    context.beginPath();
    if (edge === 'north') { context.moveTo(width * 0.35, 4); context.lineTo(width * 0.65, 4); }
    else if (edge === 'south') { context.moveTo(width * 0.35, height - 4); context.lineTo(width * 0.65, height - 4); }
    else if (edge === 'east') { context.moveTo(width - 4, height * 0.35); context.lineTo(width - 4, height * 0.65); }
    else { context.moveTo(4, height * 0.35); context.lineTo(4, height * 0.65); }
    context.stroke();
  }
}

function canvasPoint(canvas: HTMLCanvasElement, clientX: number, clientY: number, contract: ContractManifest): TerrainBrushPoint {
  const rect = canvas.getBoundingClientRect();
  const size = claimSize(contract);
  const half = size / 2;
  return {
    x: clamp(((clientX - rect.left) / rect.width) * size - half, -half, half),
    z: clamp(half - ((clientY - rect.top) / rect.height) * size, -half, half),
  };
}

function nearestEdge(point: TerrainBrushPoint, half: number): ContractEdge {
  const distances: Array<[ContractEdge, number]> = [
    ['north', half - point.z],
    ['south', point.z + half],
    ['east', half - point.x],
    ['west', point.x + half],
  ];
  distances.sort((left, right) => left[1] - right[1]);
  return distances[0]![0];
}

function readBrushState(contract: ContractManifest): TerrainBrushUiState {
  const fallback: TerrainBrushUiState = {
    version: 1,
    tool: 'raise',
    radiusCells: 3,
    strength: 0.5,
    bank: 'north',
    cursor: { x: 0, z: 0 },
  };
  try {
    const raw = sessionStorage.getItem(brushStateKey(contract.id));
    if (!raw || raw.length > 512) return fallback;
    const value: unknown = JSON.parse(raw);
    if (
      !isRecord(value) ||
      Object.keys(value).length !== 6 ||
      value.version !== 1 ||
      !TOOLS.some((entry) => entry.id === value.tool) ||
      !Number.isInteger(value.radiusCells) ||
      (value.radiusCells as number) < 1 ||
      (value.radiusCells as number) > 8 ||
      typeof value.strength !== 'number' ||
      !Number.isFinite(value.strength) ||
      value.strength < 0.05 ||
      value.strength > 1 ||
      (value.bank !== 'north' && value.bank !== 'south') ||
      !isRecord(value.cursor) ||
      Object.keys(value.cursor).length !== 2 ||
      typeof value.cursor.x !== 'number' ||
      !Number.isFinite(value.cursor.x) ||
      typeof value.cursor.z !== 'number' ||
      !Number.isFinite(value.cursor.z)
    ) {
      return fallback;
    }
    const half = claimSize(contract) / 2;
    return {
      version: 1,
      tool: value.tool as SurveyTool,
      radiusCells: value.radiusCells as number,
      strength: value.strength,
      bank: value.bank,
      cursor: { x: clamp(value.cursor.x, -half, half), z: clamp(value.cursor.z, -half, half) },
    };
  } catch {
    return fallback;
  }
}

function writeBrushState(contract: ContractManifest, state: TerrainBrushUiState): void {
  try {
    sessionStorage.setItem(brushStateKey(contract.id), JSON.stringify(state));
  } catch {}
}

function brushStateKey(contractId: string): string {
  return `${BRUSH_STATE_KEY}:${contractId}`;
}

function nextZoneId(ids: readonly string[]): string {
  for (let index = 1; index <= MAX_PAINT_SHAPES; index += 1) {
    const id = `editor-zone-${index}`;
    if (!ids.includes(id)) return id;
  }
  return `editor-zone-${MAX_PAINT_SHAPES}`;
}

function claimSize(contract: ContractManifest): number {
  const size = contract.tileParams.size ?? 64;
  return Number.isFinite(size) && size > 0 ? size : 64;
}

function brushCellSize(contract: ContractManifest): number {
  return contract.tileParams.authoredTerrain?.cellSize ?? claimSize(contract) / (GRID_DIMENSION - 1);
}

function quantize(value: number): number {
  const result = Math.round(value * 1_000) / 1_000;
  return Object.is(result, -0) ? 0 : result;
}

function unchangedGizmo(): TerrainBrushResult {
  return { changed: false, message: 'That gesture left the descriptor unchanged.' };
}

function changedFields(before: object, after: object): boolean {
  return JSON.stringify(before) !== JSON.stringify(after);
}

function pointDistance(left: TerrainBrushPoint, right: TerrainBrushPoint): number {
  return Math.hypot(left.x - right.x, left.z - right.z);
}

function fixtureRotateHandle(fixture: TerrainBrushPoint, hitRadius: number, claimHalf: number): TerrainBrushPoint {
  const offset = hitRadius * 2.25;
  return { x: fixture.x + (fixture.x + offset <= claimHalf ? offset : -offset), z: fixture.z };
}

function fixtureCanRotate(fixture: { id: string; rotationSteps?: number }): boolean {
  return fixture.id === 'lantern_post' && Number.isFinite(fixture.rotationSteps);
}

function normalizedRotationSteps(value: number): number {
  return ((Math.round(value) % 4) + 4) % 4;
}

function sameGizmoRef(left: TerrainGizmoRef | null, right: TerrainGizmoRef): boolean {
  if (!left || left.kind !== right.kind) return false;
  if (left.kind === 'spawnGate' && right.kind === 'spawnGate') {
    return left.rosterIndex === right.rosterIndex && left.gateIndex === right.gateIndex;
  }
  return left.kind !== 'spawnGate' && right.kind !== 'spawnGate' && left.index === right.index;
}

function gizmoLabel(ref: TerrainGizmoRef): string {
  if (ref.kind === 'zone') return 'Build zone';
  if (ref.kind === 'pond') return 'Spring pond';
  if (ref.kind === 'spawnGate') return 'Spawn gate';
  return 'Fixture';
}

function gizmoInstruction(handle: TerrainGizmoHandle): string {
  if (handle === 'move') return 'Drag to move it.';
  if (handle === 'fixture-rotate') return 'Tap to turn it a quarter-step.';
  return 'Drag to resize it.';
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function title(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
