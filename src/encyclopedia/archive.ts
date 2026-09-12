import type { LedgerEntry } from './registry';
import { listEpochs } from '../meta/ContractFamilies';

export const archivePageByWing = {
  'west-stacks-wing': 'archive_answered_doors',
  'east-stacks-wing': 'archive_last_standards',
  'warning-shelf-wing': 'archive_recall_instruction',
} as const;
export type ArchivePageId = (typeof archivePageByWing)[keyof typeof archivePageByWing];

const pages = [
  { id: archivePageByWing['west-stacks-wing'], name: 'The Catalog of Answered Doors' },
  { id: archivePageByWing['east-stacks-wing'], name: 'The Minutes of the Last Standards Body' },
  { id: archivePageByWing['warning-shelf-wing'], name: 'The Instruction That Was Followed' },
];

export const archiveLedgerEntries: LedgerEntry[] = (listEpochs().some(epoch => epoch.id === 'epoch-10-deepsky') ? pages : []).map(page => ({
  id: page.id, epochId: 'epoch-10-deepsky', name: page.name, category: 'The Claim',
  unlockSignal: 'archive-wing-restored', hiddenUntilDiscovered: true,
  factLines: () => ['Recovered from the Archive World.'],
  loreLine: '',
  spriteRef: { slot: 'archive-page', imageUrl: new URL('../../assets/processed/ui-title-emblem.png', import.meta.url).href },
}));

/** The ratified file is loaded by the browser reader, keeping this registry Node-loadable. */
export function loadArchiveLore(source: string): void {
  if (archiveLedgerEntries.length === 0) return;
  const sections = source.split(/^## Wing /m).slice(1);
  if (sections.length !== 3) throw new Error('Archive lore requires three ratified wing sections');
  sections.forEach((section, index) => {
    const [heading, ...lines] = section.split(/^## Wiring law/m)[0].trim().split('\n');
    const page = archiveLedgerEntries[index];
    if (!heading.includes(`"${page.name}"`)) throw new Error('Archive lore title mismatch');
    page.loreLine = lines.filter(line => !/^\((Canon|Tone law):/.test(line) && !line.startsWith('This page is the map')).join('\n')
      .replace(/\s*\(`STORYBOOK\.md:\d+`\)/g, '').replace(/\*/g, '').trim();
  });
}
