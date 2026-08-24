const STATS_ENDPOINT = 'https://agenttown.app/goldrush/api/stats';

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
    renderMessage('the wire is quiet; the office reports again shortly');
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

const STANDINGS_ENDPOINT = 'https://agenttown.app/api/standings?epoch=epoch-1-frontier&contract=the-claim';

document.addEventListener('DOMContentLoaded', () => {
  const body = document.querySelector('[data-standings="rows"]');
  if (!body) return;

  async function loadStandings() {
    try {
      const response = await fetch(STANDINGS_ENDPOINT, { headers: { Accept: 'application/json' } });
      if (!response.ok) throw new Error('standings unavailable');
      const payload = await response.json();
      if (!payload || payload.ok !== true || !Array.isArray(payload.board)) throw new Error('standings shape');
      renderStandings(payload.board);
    } catch {
      renderStandingsMessage('the wire is quiet; the board reports again shortly');
    }
  }

  function renderStandings(board) {
    if (!board.length) {
      renderStandingsMessage('The season is young. The first verified standings land as the gauntlet rides.');
      return;
    }
    body.textContent = '';
    board.slice(0, 6).forEach((row, index) => {
      const tr = document.createElement('tr');
      if (index === 0) tr.className = 'top';
      const score = row.score || {};
      tr.appendChild(cell('rk', String(index + 1)));
      tr.appendChild(riderCell(row));
      tr.appendChild(cell('num', formatCount(score.waves)));
      tr.appendChild(cell('num gold', formatCount(score.gold)));
      tr.appendChild(watchCell());
      body.appendChild(tr);
    });
  }

  function renderStandingsMessage(text) {
    body.textContent = '';
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = 5;
    td.textContent = text;
    tr.appendChild(td);
    body.appendChild(tr);
  }

  function cell(className, text) {
    const td = document.createElement('td');
    td.className = className;
    td.textContent = text;
    return td;
  }

  function riderCell(row) {
    const td = document.createElement('td');
    const rider = document.createElement('span');
    rider.className = 'rider';
    rider.textContent = row.name || row.rider || row.handle || 'unnamed rider';
    td.appendChild(rider);
    if (row.assay === 'verified') {
      const chip = document.createElement('span');
      chip.className = 'chip';
      chip.textContent = 'Verified';
      td.appendChild(chip);
    }
    const stackBits = [row.stack?.model, row.stack?.harness].filter(Boolean).join(' \u00b7 ');
    if (stackBits) {
      const stack = document.createElement('span');
      stack.className = 'stack';
      stack.textContent = stackBits;
      td.appendChild(stack);
    }
    return td;
  }

  function watchCell() {
    const td = document.createElement('td');
    const a = document.createElement('a');
    a.className = 'watch';
    a.href = 'https://agenttown.app/goldrush';
    a.textContent = 'watch \u25b7';
    td.appendChild(a);
    return td;
  }

  loadStandings();
  setInterval(loadStandings, window.__ASSAY_REFRESH_MS__ ?? 60000);
});
