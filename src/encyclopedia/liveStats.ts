const ASSAY_REFRESH_MS = 60_000;

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
      if (!disposed) renderLines(card, lines);
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
    const response = await fetch('/api/stats', { headers: { accept: 'application/json' }, signal });
    if (!response.ok) return ['the wire is quiet.'];
    const payload = (await response.json()) as StatsPayload;
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
    `Claims assayed this week: ${formatCount(runs.sevenDays)}`,
    `Claims assayed all told: ${formatCount(runs.allTime)}`,
    `Deepest holdout: wave ${formatCount(stats.deepestWave)}`,
    busiestContractLine(stats.busiestContract),
  ].filter((line): line is string => Boolean(line));
  return lines.length > 0 ? lines : ['the office opens with the first assay.'];
}

function busiestContractLine(contract: BusiestContract): string | undefined {
  if (!contract?.id || (contract.runs ?? 0) <= 0) return undefined;
  return `Busiest trail: ${titleCase(contract.id)} (${formatCount(contract.runs)} assays)`;
}

function renderLines(card: HTMLElement, lines: readonly string[]): void {
  if (lines.length === 0) return;
  const facts = card.querySelector<HTMLElement>('[data-testid="claim-ledger-facts-assay_office_records"]');
  if (!facts) return;
  facts.innerHTML = lines.map((line) => `<li data-testid="claim-ledger-fact-line">${escapeHtml(line)}</li>`).join('');
}

function titleCase(value: string): string {
  return value
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
