const STATS_ENDPOINT = 'https://gold-rush-3in.pages.dev/api/stats';

const DURATION_LABELS = {
  lt1m: 'under a minute',
  '1-3m': '1–3 min',
  '3-5m': '3–5 min',
  '5-10m': '5–10 min',
  '10-20m': '10–20 min',
  '20mplus': '20 min+',
};

const numberFormatter = new Intl.NumberFormat('en-US');

document.addEventListener('DOMContentLoaded', () => {
  const office = document.querySelector('[data-assay="office"]');
  if (!office) return;

  const fields = {
    status: office.querySelector('[data-assay="status"]'),
    message: office.querySelector('[data-assay="message"]'),
    grid: office.querySelector('[data-assay="grid"]'),
    runsToday: office.querySelector('[data-assay="runs-today"]'),
    runsSevenDays: office.querySelector('[data-assay="runs-seven-days"]'),
    runsAllTime: office.querySelector('[data-assay="runs-all-time"]'),
    deepestWave: office.querySelector('[data-assay="deepest-wave"]'),
    typicalRun: office.querySelector('[data-assay="typical-run"]'),
    busiestContract: office.querySelector('[data-assay="busiest-contract"]'),
  };
  let inFlight = false;

  async function loadStats() {
    if (inFlight) return;
    inFlight = true;
    try {
      const response = await fetch(STATS_ENDPOINT, { headers: { Accept: 'application/json' } });
      if (!response.ok) throw new Error('assay stats unavailable');
      render(await response.json());
    } catch {
      renderQuiet();
    } finally {
      inFlight = false;
    }
  }

  loadStats();
  setInterval(loadStats, window.__ASSAY_REFRESH_MS__ ?? 60000);

  function render(payload) {
    if (!payload || payload.ok !== true) {
      renderQuiet();
      return;
    }
    if (payload.empty) {
      renderMessage(payload.message || 'the office opens with the first assay');
      return;
    }
    renderStats(payload.stats || {});
  }

  function renderStats(stats) {
    fields.grid.hidden = false;
    fields.message.hidden = true;
    fields.status.textContent = formatUpdatedAt(stats.updatedAt);
    fields.runsToday.textContent = formatCount(stats.runs?.today);
    fields.runsSevenDays.textContent = formatCount(stats.runs?.sevenDays);
    fields.runsAllTime.textContent = formatCount(stats.runs?.allTime);
    fields.deepestWave.textContent = formatCount(stats.deepestWave);
    fields.typicalRun.textContent = DURATION_LABELS[stats.medianDurationBucket] || 'still tallying';
    fields.busiestContract.textContent = stats.busiestContract?.id ? titleCase(stats.busiestContract.id) : 'still tallying';
  }

  function renderMessage(message) {
    fields.grid.hidden = true;
    fields.status.textContent = 'The ledgers are ready for the first assay.';
    fields.message.hidden = false;
    fields.message.textContent = message;
  }

  function renderQuiet() {
    renderMessage('the wire is quiet — the office reports again shortly');
  }
});

function formatCount(value) {
  return Number.isFinite(value) ? numberFormatter.format(value) : '0';
}

function formatUpdatedAt(value) {
  if (!value) return 'Updated when the office receives a tally.';
  const time = new Date(value).getTime();
  if (!Number.isFinite(time)) return 'Updated when the office receives a tally.';
  const elapsed = Math.max(0, Date.now() - time);
  const minutes = Math.floor(elapsed / 60000);
  if (minutes < 1) return 'Updated just now.';
  if (minutes < 60) return `Updated ${minutes}m ago.`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Updated ${hours}h ago.`;
  return `Updated ${new Date(time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}.`;
}

function titleCase(id) {
  return String(id)
    .replace(/[-_]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(' ');
}
