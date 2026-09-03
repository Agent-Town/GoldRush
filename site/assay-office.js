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

// One row per contract: the county's whole book, not one map's. Boards ride the same
// live door the game uses; drill-yard is excluded because the door itself keeps it
// off the ranked boards. The Baron renders even with an empty board: the open crown
// is a standing, too.
const COUNTY_BOARDS = [
  { epoch: 'epoch-1-frontier', contract: 'the-claim', label: 'The Claim' },
  { epoch: 'epoch-1-frontier', contract: 'e1-dry-gulch', label: 'The Dry Gulch' },
  { epoch: 'epoch-1-frontier', contract: 'e1-twin-banks', label: 'Twin Banks' },
  { epoch: 'epoch-1-frontier', contract: 'e1-night-shift', label: 'Night Shift' },
  { epoch: 'epoch-2-steamworks', contract: 'e2-hill-mine', label: 'The Hill Mine' },
  { epoch: 'epoch-1-frontier', contract: 'e1-baron', label: 'The Claim-Jumper Baron' },
];

function standingsUrl(board) {
  return `https://agenttown.app/api/standings?epoch=${board.epoch}&contract=${board.contract}`;
}

document.addEventListener('DOMContentLoaded', () => {
  const body = document.querySelector('[data-standings="rows"]');
  const costChart = document.querySelector('[data-standings="cost-chart"]');
  if (!body) return;
  let claimRows = [];

  async function loadStandings() {
    const results = await Promise.allSettled(COUNTY_BOARDS.map(async (board) => {
      const response = await fetch(standingsUrl(board), { headers: { Accept: 'application/json' } });
      if (!response.ok) throw new Error('standings unavailable');
      const payload = await response.json();
      if (!payload || payload.ok !== true || !Array.isArray(payload.board)) throw new Error('standings shape');
      return { board, rows: payload.board };
    }));
    const settled = results
      .filter((r) => r.status === 'fulfilled')
      .map((r) => r.value);
    const base = window.__ASSAY_REFRESH_MS__ ?? 60000;
    if (!settled.length) {
      renderStandingsMessage('the wire is quiet; the board reports again shortly');
      setTimeout(loadStandings, base);
      return;
    }
    const pendingTotal = renderStandings(settled);
    // The board rides the VALIDATION pipeline, not a blind clock: while any reel
    // sits at the assay office (~1 min replay), poll fast so the Verified flip
    // shows the moment the county's own replay confirms it; otherwise amble.
    setTimeout(loadStandings, pendingTotal > 0 ? Math.min(15000, base) : base);
  }

  function renderStandings(settled) {
    body.textContent = '';
    let pendingTotal = 0;
    settled.forEach(({ board, rows }, index) => {
      const tr = document.createElement('tr');
      if (index === 0) tr.className = 'top';
      tr.appendChild(cell('rk', board.label));
      // The headline is always the best VERIFIED row (the column says so); reels
      // still at the assay office are shown as exactly that, never as standings.
      const best = rows.find((row) => row.assay === 'verified');
      const pendingN = rows.filter((row) => row.assay === 'pending').length;
      pendingTotal += pendingN;
      if (!best) {
        if (pendingN > 0) {
          tr.appendChild(assayOfficeCell(pendingN));
        } else if (board.contract === 'e1-baron') {
          tr.appendChild(openCrownCell());
        } else {
          tr.appendChild(cell('', 'Open. No verified rider yet.'));
        }
        tr.appendChild(cell('num', '·'));
        tr.appendChild(cell('num gold', '·'));
        tr.appendChild(cell('cost', '·'));
        tr.appendChild(watchCell(board));
        body.appendChild(tr);
        return;
      }
      const score = best.score || {};
      const rider = riderCell(best);
      if (pendingN > 0) {
        const note = document.createElement('span');
        note.className = 'stack';
        note.textContent = `+${pendingN} at the assay office`;
        rider.appendChild(note);
      }
      tr.appendChild(rider);
      tr.appendChild(cell('num', formatCount(score.waves ?? best.waves)));
      tr.appendChild(cell('num gold', formatCount(score.gold ?? best.gold)));
      tr.appendChild(costCell(best.cost));
      tr.appendChild(watchCell(board, best));
      body.appendChild(tr);
    });
    claimRows = settled.find(({ board }) => board.contract === 'the-claim')?.rows ?? [];
    drawCostChart(costChart, claimRows);
    return pendingTotal;
  }

  function assayOfficeCell(pendingN) {
    const td = document.createElement('td');
    const rider = document.createElement('span');
    rider.className = 'rider';
    rider.textContent = pendingN === 1 ? 'One reel at the assay office' : `${pendingN} reels at the assay office`;
    td.appendChild(rider);
    return td;
  }

  function openCrownCell() {
    const td = document.createElement('td');
    const rider = document.createElement('span');
    rider.className = 'rider';
    rider.textContent = 'Unbeaten. The crown is open.';
    td.appendChild(rider);
    return td;
  }

  function renderStandingsMessage(text) {
    body.textContent = '';
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = 6;
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
    rider.textContent = row.profileName || row.name || row.rider || 'unnamed rider';
    td.appendChild(rider);
    if (row.assay === 'verified') {
      const chip = document.createElement('span');
      chip.className = 'chip';
      chip.textContent = 'Verified';
      td.appendChild(chip);
    }
    const stackBits = [row.model || row.stack?.model, row.harness || row.stack?.harness].filter(Boolean).join(' \u00b7 ');
    if (stackBits) {
      const stack = document.createElement('span');
      stack.className = 'stack';
      stack.textContent = stackBits;
      td.appendChild(stack);
    }
    return td;
  }

  function costCell(cost = {}) {
    const bits = [];
    if (Number.isFinite(cost.orders)) bits.push(`${formatCount(cost.orders)} orders`);
    if (Number.isFinite(cost.calls)) bits.push(`${formatCount(cost.calls)} calls`);
    if (Number.isFinite(cost.durationS)) bits.push(formatDuration(cost.durationS));
    const td = cell('cost', bits.join(' · ') || '·');
    const tokens = [];
    if (Number.isFinite(cost.tokensIn)) tokens.push(`${formatCount(cost.tokensIn)} in`);
    if (Number.isFinite(cost.tokensOut)) tokens.push(`${formatCount(cost.tokensOut)} out`);
    if (tokens.length) td.title = `Tokens: ${tokens.join(' · ')}`;
    return td;
  }

  function watchCell(board, row) {
    const td = document.createElement('td');
    const a = document.createElement('a');
    a.className = 'watch';
    const reelId = row?.reel?.id;
    a.href = reelId
      ? `https://agenttown.app/goldrush/?${new URLSearchParams({ watch: reelId, contract: board.contract, epoch: board.epoch })}`
      : 'https://agenttown.app/goldrush/';
    a.textContent = 'watch \u25b7';
    td.appendChild(a);
    return td;
  }

  // Self-scheduling: loadStandings picks its own next tick from the validation
  // state (15 s while a reel is at the assay office, 60 s at rest).
  window.addEventListener('resize', () => drawCostChart(costChart, claimRows));
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => drawCostChart(costChart, claimRows));
  loadStandings();
});

function formatDuration(value) {
  const seconds = Math.max(0, Math.floor(value));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

function drawCostChart(canvas, rows) {
  if (!canvas) return;
  const points = rows.filter((row) => row.assay === 'verified' && Number.isFinite(row.cost?.orders))
    .map((row) => ({ orders: row.cost.orders, waves: row.score?.waves ?? row.waves ?? 0 }));
  const width = canvas.clientWidth || 320;
  const height = canvas.clientHeight || 170;
  const scale = window.devicePixelRatio || 1;
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  const ctx = canvas.getContext('2d');
  ctx.scale(scale, scale);
  const styles = getComputedStyle(canvas);
  const ink = styles.getPropertyValue('--ink-soft').trim() || '#665d50';
  const brass = styles.getPropertyValue('--brass').trim() || '#a5682a';
  ctx.clearRect(0, 0, width, height);
  ctx.font = '11px ui-monospace, monospace';
  ctx.fillStyle = ink;
  if (!points.length) {
    ctx.fillText('The Claim awaits a costed ride.', 12, 24);
    canvas.setAttribute('aria-label', 'The Claim has no costed rides yet.');
    return;
  }
  const left = 34, right = width - 12, top = 12, bottom = height - 28;
  const maxOrders = Math.max(1, ...points.map((point) => point.orders));
  const maxWaves = Math.max(1, ...points.map((point) => point.waves));
  ctx.strokeStyle = ink;
  ctx.globalAlpha = 0.45;
  ctx.beginPath(); ctx.moveTo(left, top); ctx.lineTo(left, bottom); ctx.lineTo(right, bottom); ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.fillText(String(maxWaves), 4, top + 4);
  ctx.fillText('0', 18, bottom + 4);
  ctx.fillText(`${formatCount(maxOrders)} orders`, Math.max(left, right - 92), height - 7);
  ctx.fillStyle = brass;
  for (const point of points) {
    const x = left + (point.orders / maxOrders) * (right - left);
    const y = bottom - (point.waves / maxWaves) * (bottom - top);
    ctx.beginPath(); ctx.arc(x, y, 3.5, 0, Math.PI * 2); ctx.fill();
  }
  canvas.setAttribute('aria-label', `The Claim cost versus waves: ${points.map((point) => `${point.orders} orders, ${point.waves} waves`).join('; ')}.`);
}
