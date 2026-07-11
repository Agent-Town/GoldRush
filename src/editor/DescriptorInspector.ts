import {
  CONTRACT_EDITOR_PARAM,
  CONTRACT_EDITOR_REJECTION_LINE,
  CONTRACT_EDITOR_SESSION_REF,
  contractDescriptorJson,
  contractNumberRange,
  activeContract,
  loadContract,
  parseContractDescriptor,
  readContractEditorDocument,
  stageContractEditorDocument,
  type ContractDescriptorParseResult,
  type ContractManifest,
} from '../meta/ContractFamilies';
import { createPlacementEditorPanel } from './PlacementEditor';
import { createTerrainBrushPanel } from './TerrainBrush';
import './descriptor-inspector.css';

type JsonRecord = Record<string, unknown>;
type EditorHistory = { version: 1; head: string; past: string[]; future: string[] };

const EDITOR_HISTORY_KEY = 'gr.editor.history.v1';
const EDITOR_HISTORY_MAX_STEPS = 20;
const EDITOR_HISTORY_MAX_CHARS = 1_000_000;
const COLOR_TUPLE_PATHS = new Set([
  'tileParams.palette.tint',
  'tileParams.palette.dampTint',
]);

const ENUMS: Record<string, readonly string[]> = {
  'tileParams.render.terrainMesh': ['required', 'preferred', 'off'],
  'tileParams.heightfield.mode': ['visual'],
  'tileParams.waterSources[].kind': ['spring_pond'],
  'tileParams.rails[].style': ['placeholder', 'steamworks', 'mine-spur'],
  'tileParams.prePlacedBuildables[].id': ['lantern_post'],
};

type ContractDescriptorRejection = Extract<ContractDescriptorParseResult, { ok: false }>;

export function installDescriptorInspector(root: HTMLElement): void {
  const contract = structuredClone(activeContract());
  const template = loadContract(contract.id);
  const currentBytes = contractDescriptorJson(contract);
  const history = readEditorHistory(template, currentBytes);
  const shell = document.createElement('aside');
  shell.className = 'descriptor-inspector';
  shell.dataset.testid = 'descriptor-inspector';
  shell.innerHTML = `
    <header class="descriptor-inspector__header">
      <p>Charter Press · Engine floor</p>
      <h1>Contract Inspector</h1>
      <strong data-testid="editor-contract-name"></strong>
      <span>Waves are paused while this page is open.</span>
    </header>
    <div class="descriptor-inspector__fields" data-testid="editor-fields"></div>
    <section class="descriptor-inspector__transfer">
      <h2>Descriptor page</h2>
      <div class="descriptor-inspector__actions">
        <button type="button" data-testid="editor-copy">Copy descriptor JSON</button>
        <button type="button" data-testid="editor-download">Download JSON</button>
      </div>
      <label class="descriptor-inspector__load-file">Load JSON file<input type="file" accept="application/json,.json" data-testid="editor-import-file"></label>
      <textarea rows="7" spellcheck="false" aria-label="Paste descriptor JSON" data-testid="editor-import-text"></textarea>
      <button type="button" class="descriptor-inspector__apply" data-testid="editor-import-apply">Apply pasted JSON</button>
      <p class="descriptor-inspector__status" role="status" data-testid="editor-status">Ready.</p>
      <div class="descriptor-inspector__damage" role="alert" data-testid="editor-rejection" hidden></div>
    </section>`;

  shell.querySelector<HTMLElement>('[data-testid="editor-contract-name"]')!.textContent = `${contract.name} · ${contract.id}`;
  const status = shell.querySelector<HTMLElement>('[data-testid="editor-status"]')!;
  const rejection = shell.querySelector<HTMLElement>('[data-testid="editor-rejection"]')!;
  const textarea = shell.querySelector<HTMLTextAreaElement>('[data-testid="editor-import-text"]')!;
  const fields = shell.querySelector<HTMLElement>('[data-testid="editor-fields"]')!;
  const validator = createContractValidator();
  fields.append(validator.element);
  validator.render({ ok: true, contract });
  const showAccepted = (message: string) => {
    rejection.hidden = true;
    validator.render({ ok: true, contract });
    status.textContent = message;
  };
  const showRejection = (result: ContractDescriptorRejection) => {
    rejection.hidden = false;
    rejection.textContent = result.message;
    validator.render(result);
    status.textContent = 'The open contract was left untouched.';
  };
  const commit = (text: string, nextHistory: EditorHistory, message: string): boolean => {
    const staged = stageDescriptorWithHistory(text, template, nextHistory);
    if (staged.ok) {
      showAccepted(message);
      return true;
    }
    showRejection(staged);
    return false;
  };
  const apply = (next: ContractManifest, message = 'Applying the descriptor…'): boolean => {
    const nextBytes = contractDescriptorJson(next);
    if (nextBytes === currentBytes) {
      showAccepted('That mark left the descriptor unchanged.');
      return true;
    }
    const nextHistory = boundEditorHistory({ version: 1, head: documentFingerprint(nextBytes), past: [...history.past, currentBytes], future: [] });
    return commit(nextBytes, nextHistory, message);
  };
  const undo = () => {
    const target = history.past.at(-1);
    if (!target) return;
    const nextHistory = boundEditorHistory({
      version: 1,
      head: documentFingerprint(target),
      past: history.past.slice(0, -1),
      future: [...history.future, currentBytes],
    });
    commit(target, nextHistory, 'Undoing the last descriptor mark…');
  };
  const redo = () => {
    const target = history.future.at(-1);
    if (!target) return;
    const nextHistory = boundEditorHistory({
      version: 1,
      head: documentFingerprint(target),
      past: [...history.past, currentBytes],
      future: history.future.slice(0, -1),
    });
    commit(target, nextHistory, 'Restoring the next descriptor mark…');
  };
  fields.append(createTerrainBrushPanel({
    contract,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
    onCommit: (next, message) => apply(next, message),
    onUndo: undo,
    onRedo: redo,
  }));
  fields.append(createPlacementEditorPanel({
    contract,
    onCommit: (next, message) => apply(next, message),
  }));
  renderSections(fields, contract, () => apply(contract));
  const importText = (text: string) => {
    const parsed = parseContractDescriptor(text, template);
    if (!parsed.ok) {
      showRejection(parsed);
      return;
    }
    apply(parsed.contract, 'Applying the imported descriptor…');
  };

  shell.querySelector<HTMLButtonElement>('[data-testid="editor-copy"]')!.addEventListener('click', async () => {
    const text = contractDescriptorJson(contract);
    try {
      await navigator.clipboard.writeText(text);
      status.textContent = 'Descriptor JSON copied.';
    } catch {
      textarea.value = text;
      textarea.select();
      document.execCommand('copy');
      status.textContent = 'Descriptor JSON selected and copied.';
    }
  });
  shell.querySelector<HTMLButtonElement>('[data-testid="editor-download"]')!.addEventListener('click', () => {
    downloadDescriptor(contract);
    status.textContent = 'Descriptor page downloaded.';
  });
  shell.querySelector<HTMLButtonElement>('[data-testid="editor-import-apply"]')!.addEventListener('click', () => importText(textarea.value));
  shell.querySelector<HTMLInputElement>('[data-testid="editor-import-file"]')!.addEventListener('change', async (event) => {
    const file = (event.currentTarget as HTMLInputElement).files?.[0];
    if (file) importText(await file.text());
  });

  root.append(shell);
  const rawOverride = new URLSearchParams(location.search).get(CONTRACT_EDITOR_PARAM);
  const staged = rawOverride === null || rawOverride === CONTRACT_EDITOR_SESSION_REF ? readContractEditorDocument(template) : null;
  const direct = rawOverride !== null && rawOverride !== CONTRACT_EDITOR_SESSION_REF ? parseContractDescriptor(rawOverride, template) : null;
  if (direct?.ok === false) showRejection(direct);
  else if (staged?.ok === false) showRejection(staged);
  else if (rawOverride === CONTRACT_EDITOR_SESSION_REF && staged === null) {
    showRejection(editorRejection('document_missing', 'The staged contract page is no longer in this tab.'));
  }
  window.__GR_EDITOR__ = { descriptorJson: () => contractDescriptorJson(contract), wavesPaused: true };
}

function renderSections(root: HTMLElement, contract: ContractManifest, apply: () => boolean): void {
  const tileParams = contract.tileParams as JsonRecord;
  const basics: JsonRecord = {};
  for (const [key, value] of Object.entries(tileParams)) {
    if (isLeaf(value)) basics[key] = value;
  }
  const commit = (): boolean => {
    const previous = Object.fromEntries(Object.keys(basics).map((key) => [key, tileParams[key]]));
    Object.assign(tileParams, basics);
    if (apply()) return true;
    Object.assign(tileParams, previous);
    return false;
  };
  root.append(section('Tile', basics, 'tileParams', commit));
  for (const [key, value] of Object.entries(tileParams)) {
    if (key in basics || key === 'authoredTerrain' || key === 'buildZones') continue;
    if (key === 'lanes' && isRecord(value)) {
      const laneFields = { ...value };
      delete laneFields.spawnEdges;
      const laneCommit = (): boolean => {
        const previous = Object.fromEntries(Object.keys(laneFields).map((field) => [field, value[field]]));
        Object.assign(value, laneFields);
        if (apply()) return true;
        Object.assign(value, previous);
        return false;
      };
      root.append(section(label(key), laneFields, `tileParams.${key}`, laneCommit));
      continue;
    }
    root.append(section(label(key), value, `tileParams.${key}`, commit));
  }
}

function createContractValidator(): {
  element: HTMLElement;
  render: (result: ContractDescriptorParseResult) => void;
} {
  const element = document.createElement('section');
  element.className = 'contract-validator';
  element.dataset.testid = 'contract-validator';
  element.innerHTML = `
    <header><div><p>Assayer's gate</p><h2>Contract verdict</h2></div><strong data-testid="contract-validator-seal"></strong></header>
    <p class="contract-validator__summary" role="status" aria-live="polite" data-testid="contract-validator-summary"></p>
    <ul class="contract-validator__reasons" aria-live="polite" aria-atomic="true" data-testid="contract-validator-reasons"></ul>`;
  const seal = element.querySelector<HTMLElement>('[data-testid="contract-validator-seal"]')!;
  const summary = element.querySelector<HTMLElement>('[data-testid="contract-validator-summary"]')!;
  const reasons = element.querySelector<HTMLUListElement>('[data-testid="contract-validator-reasons"]')!;
  const render = (result: ContractDescriptorParseResult) => {
    reasons.replaceChildren();
    if (result.ok) {
      element.dataset.verdict = 'accepted';
      seal.textContent = 'Accepted';
      summary.textContent = 'Placement, wave approaches, and briefing pass the contract gate.';
      reasons.hidden = true;
      return;
    }
    element.dataset.verdict = 'rejected';
    seal.textContent = 'Rejected';
    const firstReason = result.reasons[0]?.message ?? 'The contract page did not pass.';
    summary.textContent = result.reasons.length === 1
      ? `Rejected. ${firstReason} The open contract was not changed.`
      : `${result.reasons.length} reasons found. First: ${firstReason} The open contract was not changed.`;
    const items: HTMLLIElement[] = [];
    for (const reason of result.reasons) {
      const item = document.createElement('li');
      item.dataset.reasonCode = reason.code;
      if (reason.path) item.dataset.reasonPath = reason.path;
      item.textContent = reason.message;
      items.push(item);
    }
    reasons.replaceChildren(...items);
    reasons.hidden = false;
  };
  return { element, render };
}

function section(title: string, value: unknown, path: string, apply: () => boolean): HTMLElement {
  const details = document.createElement('details');
  details.className = 'descriptor-inspector__section';
  details.dataset.editorPath = path;
  details.open = path === 'tileParams' || path.endsWith('.heightfield') || path.endsWith('.palette');
  const summary = document.createElement('summary');
  summary.textContent = title;
  details.append(summary);
  renderValue(details, value, path, apply);
  return details;
}

function renderValue(root: HTMLElement, value: unknown, path: string, apply: () => boolean): void {
  if (Array.isArray(value)) {
    if (isColorTuple(path, value)) {
      root.append(colorControl(value, path, apply));
      return;
    }
    if (value.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'descriptor-inspector__empty';
      empty.textContent = 'No entries';
      root.append(empty);
      return;
    }
    value.forEach((entry, index) => {
      const itemPath = `${path}[]`;
      if (isLeaf(entry)) root.append(control(value as unknown as JsonRecord, String(index), itemPath, entry, apply, `${index + 1}`));
      else root.append(section(`${label(path.split('.').at(-1) ?? 'entry')} ${index + 1}`, entry, itemPath, apply));
    });
    return;
  }
  if (!isRecord(value)) return;
  for (const [key, child] of Object.entries(value)) {
    const childPath = `${path}.${key}`;
    if (isColorTuple(childPath, child)) root.append(colorControl(child, childPath, apply));
    else if (isLeaf(child)) root.append(control(value, key, childPath, child, apply));
    else root.append(section(label(key), child, childPath, apply));
  }
}

function control(owner: JsonRecord, key: string, path: string, value: unknown, apply: () => boolean, name = label(key)): HTMLElement {
  const row = document.createElement('label');
  row.className = 'descriptor-inspector__control';
  row.append(Object.assign(document.createElement('span'), { textContent: name }));
  const choices = ENUMS[path];
  if (choices) {
    const select = document.createElement('select');
    select.dataset.editorPath = path;
    choices.forEach((choice) => select.add(new Option(label(choice), choice, false, choice === value)));
    select.addEventListener('change', () => {
      const previous = owner[key];
      owner[key] = select.value;
      if (!apply()) {
        owner[key] = previous;
        select.value = String(previous);
      }
    });
    row.append(select);
  } else if (typeof value === 'boolean') {
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = value;
    input.dataset.editorPath = path;
    input.addEventListener('change', () => {
      const previous = owner[key];
      owner[key] = input.checked;
      if (!apply()) {
        owner[key] = previous;
        input.checked = Boolean(previous);
      }
    });
    row.append(input);
  } else if (typeof value === 'number') {
    const range = contractNumberRange(path, value);
    const slider = numberInput('range', value, range, path);
    const number = numberInput('number', value, range, path);
    slider.addEventListener('input', () => { number.value = slider.value; });
    const commitNumber = (next: string) => {
      const previous = owner[key];
      owner[key] = Number(next);
      if (apply()) return;
      owner[key] = previous;
      slider.value = String(previous);
      number.value = String(previous);
    };
    slider.addEventListener('change', () => commitNumber(slider.value));
    number.addEventListener('change', () => commitNumber(number.value));
    const pair = document.createElement('span');
    pair.className = 'descriptor-inspector__number';
    pair.append(slider, number);
    row.append(pair);
  } else {
    const input = document.createElement('input');
    input.type = 'text';
    input.value = String(value);
    input.dataset.editorPath = path;
    input.addEventListener('change', () => {
      const previous = owner[key];
      owner[key] = input.value;
      if (!apply()) {
        owner[key] = previous;
        input.value = String(previous);
      }
    });
    row.append(input);
  }
  return row;
}

function colorControl(value: number[], path: string, apply: () => boolean): HTMLElement {
  const row = document.createElement('label');
  row.className = 'descriptor-inspector__control';
  row.append(Object.assign(document.createElement('span'), { textContent: label(path.split('.').at(-1) ?? 'color') }));
  const input = document.createElement('input');
  input.type = 'color';
  input.value = rgbToHex(value);
  input.dataset.editorPath = path;
  input.addEventListener('change', () => {
    const previous = [...value];
    const rgb = hexToRgb(input.value);
    value.splice(0, 3, ...rgb);
    if (!apply()) {
      value.splice(0, 3, ...previous);
      input.value = rgbToHex(previous);
    }
  });
  row.append(input);
  return row;
}

function numberInput(type: 'range' | 'number', value: number, range: ReturnType<typeof contractNumberRange>, path: string): HTMLInputElement {
  const input = document.createElement('input');
  input.type = type;
  input.value = String(value);
  input.min = String(range.min);
  input.max = String(range.max);
  input.step = String(range.step);
  input.dataset.editorPath = path;
  return input;
}

function stageDescriptorWithHistory(
  text: string,
  template: ContractManifest,
  history: EditorHistory,
): ContractDescriptorParseResult {
  const parsed = parseContractDescriptor(text, template);
  if (!parsed.ok) return parsed;
  if (history.head !== documentFingerprint(text)) {
    return editorRejection('document_history', 'This contract page no longer matches its history mark.');
  }
  const key = editorHistoryKey(template.id);
  let previous: string | null;
  try {
    previous = sessionStorage.getItem(key);
    sessionStorage.setItem(key, JSON.stringify(history));
  } catch {
    return editorRejection('document_storage', 'The ledger could not hold this contract page for the next scene.');
  }
  const staged = stageContractEditorDocument(text, template);
  if (!staged.ok) {
    try {
      if (previous === null) sessionStorage.removeItem(key);
      else sessionStorage.setItem(key, previous);
    } catch {}
    return staged;
  }
  const url = new URL(location.href);
  url.searchParams.set('editor', '');
  url.searchParams.set('contract', template.id);
  url.searchParams.set(CONTRACT_EDITOR_PARAM, CONTRACT_EDITOR_SESSION_REF);
  location.replace(url);
  return parsed;
}

function editorRejection(code: string, message: string): ContractDescriptorRejection {
  return { ok: false, message: CONTRACT_EDITOR_REJECTION_LINE, reasons: [{ code, message }] };
}

function readEditorHistory(template: ContractManifest, currentBytes: string): EditorHistory {
  try {
    const raw = sessionStorage.getItem(editorHistoryKey(template.id));
    if (!raw || raw.length > EDITOR_HISTORY_MAX_CHARS) return emptyEditorHistory(currentBytes);
    const value: unknown = JSON.parse(raw);
    if (
      !isRecord(value) ||
      Object.keys(value).length !== 4 ||
      value.version !== 1 ||
      typeof value.head !== 'string' ||
      value.head !== documentFingerprint(currentBytes) ||
      !Array.isArray(value.past) ||
      !Array.isArray(value.future)
    ) {
      return emptyEditorHistory(currentBytes);
    }
    const snapshots = [...value.past, ...value.future];
    if (snapshots.some((snapshot) => typeof snapshot !== 'string' || !parseContractDescriptor(snapshot, template).ok)) {
      return emptyEditorHistory(currentBytes);
    }
    return boundEditorHistory({ version: 1, head: value.head, past: [...value.past] as string[], future: [...value.future] as string[] });
  } catch {
    return emptyEditorHistory(currentBytes);
  }
}

function boundEditorHistory(history: EditorHistory): EditorHistory {
  const bounded: EditorHistory = { version: 1, head: history.head, past: [...history.past], future: [...history.future] };
  while (
    bounded.past.length + bounded.future.length > EDITOR_HISTORY_MAX_STEPS ||
    JSON.stringify(bounded).length > EDITOR_HISTORY_MAX_CHARS
  ) {
    if (bounded.past.length > 0) bounded.past.shift();
    else bounded.future.shift();
  }
  return bounded;
}

function emptyEditorHistory(currentBytes: string): EditorHistory {
  return { version: 1, head: documentFingerprint(currentBytes), past: [], future: [] };
}

function editorHistoryKey(contractId: string): string {
  return `${EDITOR_HISTORY_KEY}:${contractId}`;
}

function documentFingerprint(text: string): string {
  let hash = 0x811c9dc5;
  for (let index = 0; index < text.length; index += 1) hash = Math.imul(hash ^ text.charCodeAt(index), 0x01000193);
  return `${text.length}:${(hash >>> 0).toString(16).padStart(8, '0')}`;
}

function downloadDescriptor(contract: ContractManifest): void {
  const link = document.createElement('a');
  link.download = `${contract.id}-descriptor.json`;
  link.href = URL.createObjectURL(new Blob([contractDescriptorJson(contract)], { type: 'application/json' }));
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 0);
}

function rgbToHex(value: number[]): string {
  return `#${value.slice(0, 3).map((channel) => Math.round(Math.max(0, Math.min(1, channel)) * 255).toString(16).padStart(2, '0')).join('')}`;
}

function hexToRgb(value: string): number[] {
  return [1, 3, 5].map((index) => Number.parseInt(value.slice(index, index + 2), 16) / 255);
}

function isColorTuple(path: string, value: unknown): value is number[] {
  return COLOR_TUPLE_PATHS.has(path) && Array.isArray(value) && value.length === 3 && value.every((entry) => typeof entry === 'number');
}

function isLeaf(value: unknown): value is string | number | boolean {
  return ['string', 'number', 'boolean'].includes(typeof value);
}

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function label(value: string): string {
  return value.replace(/[_-]+/g, ' ').replace(/([a-z\d])([A-Z])/g, '$1 $2').replace(/^./, (letter) => letter.toUpperCase());
}
