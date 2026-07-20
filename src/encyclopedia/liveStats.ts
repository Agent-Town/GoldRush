import { loadScores } from '../game/Scoreboard';

const ASSAY_REFRESH_MS = 60_000;
const STATS_ENDPOINT = 'https://gold-rush-3in.pages.dev/api/stats';

const DURATION_LABELS: Record<string, string> = {
  lt1m: 'under a minute',
  '1-3m': '1–3 min',
  '3-5m': '3–5 min',
  '5-10m': '5–10 min',
  '10-20m': '10–20 min',
  '20mplus': '20 min+',
};

type StatsPayload = {
  ok?: boolean;
  empty?: boolean;
  stats?: {
    runs?: {
      today?: number;
      sevenDays?: number;
      allTime?: number;
    };
    deepestWave?: number;
    medianDurationBucket?: string;
    busiestContract?: {
      id?: string;
      runs?: number;
    } | null;
    tierSplit?: Record<string, number>;
    durationHistogram?: Record<string, number>;
    wavesHistogram?: Record<string, number>;
  };
};

type BusiestContract = NonNullable<StatsPayload['stats']>['busiestContract'];

export function installAssayOfficeRecordsLiveRead(root: ParentNode): () => void {
  const card = root.querySelector<HTMLElement>('[data-ledger-entry="assay_office_records"][data-ledger-discovered="true"]');
  if (!card) return () => undefined;

  let disposed = false;
  const controller = new AbortController();
  const read = () => {
    void readAssayStats(controller.signal).then((lines) => {
      if (!disposed) renderRecords(card, lines);
    });
  };

  read();
  const interval = window.setInterval(read, ASSAY_REFRESH_MS);
  return () => {
    disposed = true;
    controller.abort();
    window.clearInterval(interval);
  };
}

async function readAssayStats(signal: AbortSignal): Promise<string[]> {
  try {
    const response = await fetch(STATS_ENDPOINT, { headers: { accept: 'application/json' }, signal });
    if (!response.ok) return ['the wire is quiet.'];
    const payload = (await response.json()) as StatsPayload;
    if (payload.ok !== true) return ['the wire is quiet.'];
    if (payload.empty === true) return ['the office opens with the first assay.'];
    return formatStats(payload);
  } catch {
    return signal.aborted ? [] : ['the wire is quiet.'];
  }
}

function formatStats(payload: StatsPayload): string[] {
  const stats = payload.stats;
  const runs = stats?.runs;
  if (!stats || !runs || (runs.allTime ?? 0) <= 0) return ['the office opens with the first assay.'];

  const lines = [
    `Runs assayed today: ${formatCount(runs.today)} · Claims assayed this week: ${formatCount(runs.sevenDays)}`,
    `Claims assayed all told: ${formatCount(runs.allTime)} · Deepest holdout: wave ${formatCount(stats.deepestWave)}`,
    `Typical run: ${DURATION_LABELS[stats.medianDurationBucket ?? ''] ?? 'still tallying'}`,
    [
      busiestContractLine(stats.busiestContract),
      splitLine('Trail rigs', stats.tierSplit),
      splitLine('Run lengths', stats.durationHistogram),
      splitLine('Waves reached', stats.wavesHistogram),
    ]
      .filter(Boolean)
      .join(' · '),
  ].filter((line): line is string => Boolean(line));
  return lines.length > 0 ? lines : ['the office opens with the first assay.'];
}

function busiestContractLine(contract: BusiestContract): string | undefined {
  if (!contract?.id || (contract.runs ?? 0) <= 0) return undefined;
  return `Busiest trail: ${titleCase(contract.id)} (${formatCount(contract.runs)} assays)`;
}

function splitLine(label: string, values: Record<string, number> | undefined): string | undefined {
  if (!values) return undefined;
  const parts = Object.entries(values)
    .filter(([, count]) => Number.isFinite(count) && count > 0)
    .map(([key, count]) => `${splitKey(label, key)} ${formatCount(count)}`);
  return parts.length > 0 ? `${label}: ${parts.join(', ')}` : undefined;
}

function splitKey(label: string, key: string): string {
  if (label === 'Run lengths') return DURATION_LABELS[key] ?? key;
  if (label === 'Waves reached') return key.replace('-', '–').replace('plus', '+');
  return titleCase(key);
}

function renderRecords(card: HTMLElement, countyLines: readonly string[]): void {
  if (countyLines.length === 0) return;
  const facts = card.querySelector<HTMLElement>('[data-testid="claim-ledger-facts-assay_office_records"]');
  if (!facts) return;
  facts.outerHTML = `<div class="claim-ledger-card__facts" data-testid="claim-ledger-facts-assay_office_records">
    ${renderSection('THE COUNTY', "the county's book", countyLines, 'county')}
    ${renderSection('THE CLAIM', 'your page in it', localLines(), 'claim')}
  </div>`;
}

function renderSection(title: string, subtitle: string, lines: readonly string[], id: string): string {
  return `<section data-testid="assay-records-${id}">
    <strong>${escapeHtml(title)}</strong> — ${escapeHtml(subtitle)}
    <ul>${lines.map((line) => `<li>${escapeHtml(line)}</li>`).join('')}</ul>
  </section>`;
}

function localLines(): string[] {
  const scores = loadScores();
  return [
    `Runs entered: ${scores.length} · Deepest holdout: wave ${Math.max(0, ...scores.map((score) => score.waves))}`,
    `Gold panned: ${formatCount(scores.reduce((sum, score) => sum + score.gold, 0))} · Folks freed: ${formatCount(scores.reduce((sum, score) => sum + score.kills, 0))}`,
    `Playtime in the ledger: ${formatPlaytime(scores.reduce((sum, score) => sum + score.timeAlive, 0))}`,
  ];
}

function formatPlaytime(seconds: number): string {
  const minutes = Math.floor(Math.max(0, seconds) / 60);
  return minutes < 60 ? `${minutes} min` : `${Math.floor(minutes / 60)} hr ${minutes % 60} min`;
}

function titleCase(value: string): string {
  return value
    .toLowerCase()
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(' ');
}

function formatCount(value: unknown): string {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? String(Math.floor(number)) : '0';
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => {
    if (char === '&') return '&amp;';
    if (char === '<') return '&lt;';
    if (char === '>') return '&gt;';
    if (char === '"') return '&quot;';
    return '&#39;';
  });
}
