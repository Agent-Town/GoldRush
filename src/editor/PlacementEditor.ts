import type { ContractEdge, ContractManifest } from '../meta/ContractFamilies';

type PlacementEditorOptions = {
  contract: ContractManifest;
  onCommit: (next: ContractManifest, message: string) => boolean;
};

const SPAWN_EDGES = ['north', 'south', 'east', 'west'] as const satisfies readonly ContractEdge[];
const ZONE_NUMBER_KEYS = ['minX', 'maxX', 'minZ', 'maxZ'] as const;

export function createPlacementEditorPanel({ contract, onCommit }: PlacementEditorOptions): HTMLElement {
  const panel = document.createElement('section');
  panel.className = 'placement-editor';
  panel.dataset.testid = 'placement-editor';
  panel.innerHTML = `
    <header class="placement-editor__heading">
      <div><p>Charter Press · Third floor</p><h2>Placement &amp; briefing</h2></div>
      <span>Descriptor marks only</span>
    </header>`;

  panel.append(buildZoneEditor(contract, onCommit));
  panel.append(spawnEditor(contract, onCommit));
  panel.append(briefingEditor(contract, onCommit));
  return panel;
}

function buildZoneEditor(contract: ContractManifest, onCommit: PlacementEditorOptions['onCommit']): HTMLElement {
  const section = placementSection(
    'Build zones',
    'Draw new rectangles with the Zone brush; refine or remove them here. Changing bank mirrors a river-zone across the water.',
    'placement-zones',
  );
  const zones = contract.tileParams.buildZones ?? [];
  if (zones.length === 0) {
    section.append(emptyLine('No surveyed rectangles. The whole dry bank remains buildable.'));
    return section;
  }

  zones.forEach((zone, index) => {
    const card = document.createElement('fieldset');
    card.className = 'placement-editor__zone';
    card.dataset.testid = 'placement-zone';
    card.dataset.zoneId = zone.id;
    const legend = document.createElement('legend');
    legend.textContent = `Zone ${index + 1}`;
    card.append(legend);

    card.append(textControl('ID', zone.id, `placement-zone-${index}-id`, `tileParams.buildZones[${index}].id`, (input) => {
      const next = structuredClone(contract);
      next.tileParams.buildZones![index]!.id = input.value;
      if (!onCommit(next, 'Updating the build-zone survey…')) input.value = zone.id;
    }));

    const bank = document.createElement('select');
    bank.dataset.testid = `placement-zone-${index}-bank`;
    bank.dataset.editorPath = `tileParams.buildZones[${index}].bank`;
    bank.add(new Option('North', 'north', false, zone.bank === 'north'));
    bank.add(new Option('South', 'south', false, zone.bank === 'south'));
    bank.addEventListener('change', () => {
      const next = structuredClone(contract);
      const nextZone = next.tileParams.buildZones![index]!;
      nextZone.bank = bank.value as 'north' | 'south';
      if (contract.tileParams.river) {
        nextZone.minZ = -zone.maxZ;
        nextZone.maxZ = -zone.minZ;
      }
      if (!onCommit(next, `Moving the build zone to the ${bank.value} bank…`)) bank.value = zone.bank;
    });
    card.append(labelControl('Bank', bank));

    for (const key of ZONE_NUMBER_KEYS) {
      const input = document.createElement('input');
      input.type = 'number';
      input.step = '0.1';
      input.value = String(zone[key]);
      input.dataset.testid = `placement-zone-${index}-${key}`;
      input.dataset.editorPath = `tileParams.buildZones[${index}].${key}`;
      input.addEventListener('change', () => {
        const next = structuredClone(contract);
        next.tileParams.buildZones![index]![key] = input.valueAsNumber;
        if (!onCommit(next, 'Updating the build-zone survey…')) input.value = String(zone[key]);
      });
      card.append(labelControl(zoneNumberLabel(key), input));
    }

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'placement-editor__remove';
    remove.dataset.testid = `placement-zone-${index}-remove`;
    remove.textContent = 'Remove zone';
    remove.addEventListener('click', () => {
      const next = structuredClone(contract);
      next.tileParams.buildZones = (next.tileParams.buildZones ?? []).filter((_, zoneIndex) => zoneIndex !== index);
      onCommit(next, 'Removing the build-zone survey…');
    });
    card.append(remove);
    section.append(card);
  });
  return section;
}

function spawnEditor(contract: ContractManifest, onCommit: PlacementEditorOptions['onCommit']): HTMLElement {
  const section = placementSection('Wave approaches', 'Keep at least one compass edge open. New edges join the end of the authored order.', 'placement-spawns');
  const choices = document.createElement('div');
  choices.className = 'placement-editor__checks';
  for (const edge of SPAWN_EDGES) {
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = contract.tileParams.lanes.spawnEdges.includes(edge);
    input.dataset.testid = `placement-spawn-${edge}`;
    input.dataset.editorPath = 'tileParams.lanes.spawnEdges';
    input.addEventListener('change', () => {
      const next = structuredClone(contract);
      const edges = next.tileParams.lanes.spawnEdges;
      next.tileParams.lanes.spawnEdges = input.checked
        ? edges.includes(edge) ? edges : [...edges, edge]
        : edges.filter((entry) => entry !== edge);
      if (!onCommit(next, 'Updating the wave approaches…')) input.checked = !input.checked;
    });
    const label = document.createElement('label');
    label.append(input, title(edge));
    choices.append(label);
  }
  section.append(choices);
  return section;
}

function briefingEditor(contract: ContractManifest, onCommit: PlacementEditorOptions['onCommit']): HTMLElement {
  const section = placementSection('Briefing card', 'Edit the authored rows. This first press keeps their count fixed.', 'placement-briefing');
  section.append(textControl('Geography', contract.briefing.geographyLine, 'placement-briefing-geography', 'briefing.geographyLine', (input) => {
    const next = structuredClone(contract);
    next.briefing.geographyLine = input.value;
    if (!onCommit(next, 'Updating the contract briefing…')) input.value = contract.briefing.geographyLine;
  }));
  contract.briefing.goals.forEach((goal, index) => {
    section.append(textControl(`Goal ${index + 1}`, goal, `placement-briefing-goal-${index}`, `briefing.goals[${index}]`, (input) => {
      const next = structuredClone(contract);
      next.briefing.goals[index] = input.value;
      if (!onCommit(next, 'Updating the contract goals…')) input.value = goal;
    }));
  });
  contract.briefing.rules.forEach((rule, index) => {
    section.append(textControl(`Rule ${index + 1}`, rule, `placement-briefing-rule-${index}`, `briefing.rules[${index}]`, (input) => {
      const next = structuredClone(contract);
      next.briefing.rules[index] = input.value;
      if (!onCommit(next, 'Updating the contract rules…')) input.value = rule;
    }));
  });
  return section;
}

function placementSection(titleText: string, hintText: string, testId: string): HTMLElement {
  const section = document.createElement('section');
  section.className = 'placement-editor__section';
  section.dataset.testid = testId;
  const heading = document.createElement('h3');
  heading.textContent = titleText;
  const hint = document.createElement('p');
  hint.textContent = hintText;
  section.append(heading, hint);
  return section;
}

function textControl(
  labelText: string,
  value: string,
  testId: string,
  path: string,
  commit: (input: HTMLInputElement) => void,
): HTMLElement {
  const input = textInput(value, testId, path);
  input.addEventListener('change', () => commit(input));
  return labelControl(labelText, input);
}

function textInput(value: string, testId: string, path: string): HTMLInputElement {
  const input = document.createElement('input');
  input.type = 'text';
  input.value = value;
  input.autocomplete = 'off';
  input.dataset.testid = testId;
  input.dataset.editorPath = path;
  return input;
}

function labelControl(labelText: string, input: HTMLElement): HTMLElement {
  const label = document.createElement('label');
  label.className = 'placement-editor__control';
  const text = document.createElement('span');
  text.textContent = labelText;
  label.append(text, input);
  return label;
}

function emptyLine(text: string): HTMLElement {
  const line = document.createElement('p');
  line.className = 'placement-editor__empty';
  line.textContent = text;
  return line;
}

function zoneNumberLabel(key: (typeof ZONE_NUMBER_KEYS)[number]): string {
  return ({ minX: 'West edge', maxX: 'East edge', minZ: 'South line', maxZ: 'North line' } as const)[key];
}

function title(value: string): string {
  return value[0]!.toUpperCase() + value.slice(1);
}
