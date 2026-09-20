import { writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const browser = await chromium.launch({ channel: 'chromium', headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const errors = [], modules = {};
  page.on('request', request => {
    const path = new URL(request.url()).pathname;
    if (path === '/src/game/Game.ts') modules.game = request.url();
    if (path === '/src/entities/Enemy.ts') modules.enemy = request.url();
  });
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.addInitScript(() => { localStorage.clear(); localStorage.setItem('gr.activeEpoch.v1', 'epoch-4-motor'); });
  await page.goto('http://127.0.0.1:5246/?debug&epoch=epoch-4-motor&contract=e4-dust-flats&nolevel&nopause&seed=land-yacht-multipliers');
  await page.waitForFunction(() => window.__GR_TEST__ && window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId === 'e4-dust-flats', null, { timeout: 60000 });
  const briefing = page.getByTestId('contract-briefing-dismiss');
  if (await briefing.isVisible()) await briefing.evaluate(button => button.click());
  await page.evaluate(async url => {
    const { Game } = await import(url);
    const original = Game.prototype.syncBaronRocketCart;
    Game.prototype.syncBaronRocketCart = function (...args) { window.__e4RiskGame = this; Game.prototype.syncBaronRocketCart = original; return original.apply(this, args); };
    const h = window.__GR_TEST__;
    h.setManualSim(true);
    for (const [key,value] of Object.entries({ 'waves.waveInterval': .35, 'waves.trickleInterval': 999, 'waves.pulseBase': 0, 'waves.pulsePerWave': 0, 'waves.aliveCap': 20, 'enemy.contactDamage': 0, 'sparkRig.range': 0, 'sparkRig.damage': 0 })) h.setBalance(key,value);
    h.placeFree('sentry_beacon', -24, 0);
    h.advanceSim(.2);
  }, modules.game);
  await page.waitForFunction(() => window.__e4RiskGame);
  await page.evaluate(async url => {
    const { ClaimJumperEnemy } = await import(url);
    const original = ClaimJumperEnemy.prototype.update;
    window.__e4RiskRows = [];
    window.__e4RiskStage = 'spawn';
    ClaimJumperEnemy.prototype.update = function (...args) {
      if (this.variantId === 'land_yacht') {
        const g = window.__e4RiskGame;
        window.__e4RiskRows.push({ stage: window.__e4RiskStage, at: g.timeAlive, id: this.bossComponentId,
          delta: args[0], passedMultiplier: args[9], scriptedSpeed: this.scriptedSpeed,
          night: g.nightSpeedMultiplier(this), weather: g.motorSocket?.enemyMovementMultiplier(g.timeAlive) ?? 1,
          wrangle: g.wrangle.movementMultiplier(this), e6: g.e6ArsenalSystem.movementMultiplier(this), e9: g.e9ArsenalSystem.movementMultiplier(this),
          hpRatio: this.currentHp/this.maxHp, y: this.position.y, light: g.lightField.coverageAt(this.position.x,this.position.z),
          ignoresTerrain: this.scriptedIgnoresTerrain, activationDelay: this.activationDelay,
          wreckerState: this.wreckerState, thiefState: this.thiefState, gnawing: this.gnawing });
      }
      return original.apply(this,args);
    };
    const h = window.__GR_TEST__;
    const wave = window.__THREE_GAME_DIAGNOSTICS__.contract.baron.wave;
    h.setWave(wave - 1); h.advanceSim(.4); h.setBalance('waves.waveInterval',999); h.setWave(wave); h.advanceSim(.2);
  }, modules.enemy);
  async function advance(stage, seconds) {
    await page.evaluate(({stage,seconds}) => { window.__e4RiskStage = stage; for(let i=0;i<seconds;i++)window.__GR_TEST__.advanceSim(1); }, {stage,seconds});
  }
  async function setHp(id, ratio) {
    const ok = await page.evaluate(({id,ratio}) => {
      const h=window.__GR_TEST__, s=structuredClone(h.captureSuspend());
      const e=s.enemies.active.find(e=>e.variantId==='land_yacht'&&e.bossComponentId===id);
      e.hp=ratio===0 ? .01 : e.maxHp*ratio;
      return h.restoreSuspend(s);
    }, {id,ratio});
    if(!ok) throw Error('fixture restore failed');
  }
  async function kill(id) {
    await page.evaluate(id => { window.__e4RiskStage = `kill-${id}`; }, id);
    await setHp(id,0);
    await page.evaluate(id => {
      const h=window.__GR_TEST__,e=h.enemyPositions().find(e=>e.variantId==='land_yacht'&&e.bossComponentId===id);
      h.setBalance('blast.damage',.02); h.launchBlastAt(e.x,e.z,.05); h.advanceSim(.25);
    },id);
  }
  await advance('before-hp-fixture',60);
  await setHp('wheels',.49);
  await advance('wheels-half-hp',30);
  await kill('crane');
  await advance('crane-dead-wheels-moving',30);
  await kill('wheels');
  await advance('beached-wheelhouse',4);
  const result = await page.evaluate(() => {
    const g=window.__e4RiskGame, rows=window.__e4RiskRows, stages={};
    for(const stage of new Set(rows.map(r=>r.stage))) {
      const entries=rows.filter(r=>r.stage===stage), ticks=new Map();
      for(const r of entries) { const tick=ticks.get(r.at)??[]; tick.push(r);ticks.set(r.at,tick); }
      const range=key=>[Math.min(...entries.map(r=>r[key])),Math.max(...entries.map(r=>r[key]))];
      stages[stage]={ actorUpdates:entries.length, ticks:ticks.size, ids:[...new Set(entries.map(r=>r.id))],
        multipliers:Object.fromEntries(['passedMultiplier','night','weather','wrangle','e6','e9','scriptedSpeed','hpRatio','y','light'].map(key=>[key,range(key)])),
        maxSameTickMultiplierSpread:Math.max(...[...ticks.values()].map(t=>Math.max(...t.map(r=>r.passedMultiplier))-Math.min(...t.map(r=>r.passedMultiplier)))),
        maxSameTickLightSpread:Math.max(...[...ticks.values()].map(t=>Math.max(...t.map(r=>r.light))-Math.min(...t.map(r=>r.light)))),
        maxSameTickHeightSpread:Math.max(...[...ticks.values()].map(t=>Math.max(...t.map(r=>r.y))-Math.min(...t.map(r=>r.y)))),
        allIgnoreTerrain:entries.every(r=>r.ignoresTerrain), maxActivationDelay:Math.max(...entries.map(r=>r.activationDelay)),
        gnawing:entries.some(r=>r.gnawing), wreckerStates:[...new Set(entries.map(r=>r.wreckerState))], thiefStates:[...new Set(entries.map(r=>r.thiefState))] };
    }
    return { contract:g.activeContract.id, activeEpoch:g.activeEpoch.order, nightEnabled:g.isNightShiftContract(), lightRamp:g.activeContract.twist.lightRamp??null, dayNightCycle:g.activeContract.twist.dayNightCycle??null, mothSeason:g.activeContract.twist.mothSeason??null,
      e6Active:g.e6ArsenalSystem.diagnostics.eraActive, e9Active:g.e9ArsenalSystem.diagnostics.eraActive,
      diagnostics:g.landYachtBoss.diagnostics(), stages, actorSamples:rows.filter((r,i)=>i===0||r.stage!==rows[i-1].stage||r.weather!==rows[i-1].weather).slice(0,30) };
  });
  result.errors=errors;
  result.modules=modules;
  await writeFile(new URL('./movement-multipliers.json', import.meta.url),JSON.stringify(result,null,2)+'\n');
  console.log(JSON.stringify(result,null,2));
} finally { await browser.close(); }
