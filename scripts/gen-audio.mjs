#!/usr/bin/env node
import { appendFile, mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const API_BASE = 'https://api.elevenlabs.io/v1';
const OUTPUT_FORMAT = 'mp3_44100_128';
const MODEL_ID = 'eleven_text_to_sound_v2';
const SPEND_CAP = 6000;
const MIN_REMAINING = 3000;
const API_PAUSE_MS = 2200;
const RAW_DIR = path.join(ROOT, 'assets/audio/raw');
const LEDGER = path.join(ROOT, 'assets/audio/LEDGER.md');

const sounds = [
  ['spark-bolt-fire', 0.8, false, 'short spark-bolt fire, electric twang from brass coil, bright spark tail, frontier ledger game, no gunshot/music/voice, -14 LUFS', 'electric brass-coil twang'],
  ['spark-bolt-hit', 0.7, false, 'short spark-bolt hit, dry snapping spark on wood and dust, clear transient, frontier-tech, no gore/music/voice, -14 LUFS', 'dry spark snap'],
  ['blast-charge-arm', 1.2, false, 'short blast-charge arm, steam valve wind-up tick and tiny brass ratchet, tense not martial, no music/voice, -14 LUFS', 'wind-up steam tick'],
  ['blast-charge-boom', 1.2, false, 'short blast-charge boom, padded steam-thump and dust puff, no realistic explosion, no bass boom, no voice/music, -14 LUFS', 'soft steam-thump'],
  ['turret-fire', 0.7, false, 'short signal turret fire, brass snap and teal spark, frontier-tech rig not firearm, no gunshot/music/voice, -14 LUFS', 'brass snap'],
  ['palisade-hit', 0.8, false, 'short palisade hit, solid timber knock with dusty tail, warm woody danger cue, no shriek/music/voice, -14 LUFS', 'timber knock'],
  ['palisade-crack', 1.0, false, 'short palisade crack, splitting dry wood fibers and low knock, illustrated frontier danger, no gore/music/voice, -14 LUFS', 'splitting wood crack'],
  ['palisade-collapse', 1.8, false, 'short palisade collapse, timber tumble and soft dust fall, handmade wood foley, no crash bass/music/voice, -14 LUFS', 'timber tumble with dust'],
  ['pan-swish', 1.0, false, 'short pan swish, gravel and shallow river water in metal pan, warm economy foley, no music/voice, -14 LUFS', 'gravel-water pan swish'],
  ['gold-chime', 0.8, false, 'short gold chime, small warm bell with soft coin glint, reward cue, handmade not casino, no music/voice, -14 LUFS', 'small warm bell'],
  ['sluice-water-loop', 3.6, true, 'seamless sluice water loop, wooden trough water over gravel, calm economy bed, no melody/voice, -14 LUFS', 'wooden sluice water bed'],
  ['stockpile-deposit', 0.9, false, 'short stockpile deposit, coins landing on wood with soft pouch rustle, warm reward cue, no music/voice, -14 LUFS', 'coins on wood'],
  ['demolish', 1.4, false, 'short demolish, timber disassembly with one sad plank drop, rustic UI action, no explosion/music/voice, -14 LUFS', 'sad plank disassembly'],
  ['menu-tap', 0.5, false, 'tiny menu tap, pencil dot on paper with soft wood desk tick, warm UI foley, no beep/music/voice, -14 LUFS', 'pencil dot'],
  ['build-place', 0.7, false, 'short build place, rubber stamp on parchment with wood block thud, tactile UI confirm, no music/voice, -14 LUFS', 'stamp on paper'],
  ['invalid', 0.6, false, 'short invalid action, dry double-knock on wood, polite frontier UI refusal, no buzzer/music/voice, -14 LUFS', 'dry double knock'],
  ['tier-up', 1.0, false, 'short tier-up, two-note warm brass flourish with tiny bell tail, upgrade cue, no melody bed/voice, -14 LUFS', 'two-note brass cue'],
  ['research-pick', 0.9, false, 'short research pick, page turn plus pencil scratch on ledger paper, clever UI cue, no music/voice, -14 LUFS', 'page turn and pencil scratch'],
  ['ledger-open', 0.8, false, 'short ledger open, old book thump and paper flutter, warm paper UI cue, no music/voice, -14 LUFS', 'book thump'],
  ['prospector-hover-loop', 2.8, true, 'seamless prospector hover loop, soft steam hiss with tiny teal shimmer, gentle agent tech, no melody/voice, -14 LUFS', 'soft steam-hiss hover'],
  ['chirp-acknowledge', 0.7, false, 'short acknowledge chirp, two-note teal glass chime, friendly agent response, no voice/music, -14 LUFS', 'two-note teal chime'],
  ['chirp-refuse', 0.7, false, 'short refuse chirp, gentle down-note teal chime, polite agent no, no buzzer/voice/music, -14 LUFS', 'down-note chime'],
  ['agent-works', 0.8, false, 'short agent works, tiny brass ratchet and soft tool tick, busy helper cue, no music/voice, -14 LUFS', 'tiny ratchet'],
  ['river-ambience-loop', 3.8, true, 'seamless river ambience loop, soft frontier river current and bank breeze, calm parchment tone, no melody/voice, -14 LUFS', 'soft river current'],
  ['wind-gust', 1.3, false, 'short wind gust, dusty frontier breeze through wood posts and grass, warm not harsh, no shriek/music/voice, -14 LUFS', 'dusty warm gust'],
  ['wave-start-horn', 1.8, false, 'short wave-start horn, distant warm brass call over wood valley, alert not martial, no drums/voice, -14 LUFS', 'distant warm brass horn'],
  ['victory-sting', 3.0, false, 'three-second victory sting, rising warm brass and small bell, frontier celebration, no full music loop/voice, -14 LUFS', 'rising brass and bell'],
  ['defeat-sting', 3.0, false, 'three-second defeat sting, low wood tone and one bell, melancholy never doom, no dark drone/voice, -14 LUFS', 'low wood with single bell'],
  ['desert-day-loop', 4.0, true, 'seamless quiet desert day ambience loop, dry warm wind over brush, distant sparse insects, frontier ledger claim bed, no melody/voice/words, -18 LUFS', 'dry wind and distant insects'],
  ['desert-dusk-loop', 4.0, true, 'seamless quiet desert dusk ambience loop, sparse crickets, soft cooling breeze, wide handmade frontier bed, no melody/voice/words, -18 LUFS', 'sparse dusk crickets'],
  ['river-bed-v2-loop', 4.0, true, 'seamless richer river bed loop, shallow current over gravel with bank breeze and tiny reeds, calm economy bed, no melody/voice/words, -18 LUFS', 'richer shallow river bed'],
  ['town-square-loop', 4.0, true, 'seamless quiet town square ambience loop, light foot shuffle, wood porch creaks, distant cloth awnings, wordless murmur texture only, no distinct voices/words, -18 LUFS', 'light wordless town bustle'],
  ['tavern-interior-loop', 4.0, true, 'seamless quiet tavern interior loop, warm wood creaks, soft room tone, low indistinct wordless murmur, no spoken words/singing/music, -18 LUFS', 'wood creak and wordless room tone'],
  ['research-pick-sting', 1.5, false, 'short research pick sting, pencil scratch on ledger paper plus small warm bell, clever agent-town cue, no voice/full music, -14 LUFS', 'pencil and small bell'],
  ['epoch-door-sting', 3.0, false, 'three-second epoch door sting, low warm brass swell with steam breath, Stamp Mill completion beat, frontier-tech not martial, no voice/drums, -14 LUFS', 'low brass and steam breath'],
  ['baron-arrival-sting', 2.5, false, 'short baron arrival sting, dark warm brass cousin of the wave horn, low wood shadow, villain cue not horror, no voice/drums, -14 LUFS', 'dark brass arrival cue'],
  ['baron-defeat-fanfare', 4.0, false, 'four-second baron defeat fanfare, triumphant warm brass with small bells, handmade frontier celebration, no voice/full music loop, -14 LUFS', 'triumphant brass and bells'],
  ['town-enter-chime', 2.0, false, 'short town enter chime, two warm bells with soft porch-wood tail, arrival cue, no voice/music bed, -14 LUFS', 'warm arrival bells'],
  ['founding-stamp-thunk', 0.8, false, 'short founding stamp thunk, rubber stamp on parchment with solid ledger desk thump, naming confirm, no voice/music, -14 LUFS', 'stamp on parchment and desk thump'],
  ['save-tick', 0.5, false, 'tiny save tick, very short pencil scratch on paper, light UI confirmation, no beep/voice/music, -14 LUFS', 'tiny pencil scratch'],
  ['slot-save-confirm', 1.0, false, 'short slot save confirm, ledger book closing with soft leather and paper puff, warm UI confirm, no voice/music, -14 LUFS', 'ledger book close'],
  ['sign-in-chime', 1.2, false, 'short sign-in chime, two gentle post-code teal notes with paper-soft tail, no voice/music bed, -14 LUFS', 'two-note post-code chime'],
  ['t4-first-wave', 1.6, false, 'one small ocean wave reaching wet sand after silence, clear water break then short foam retreat, warm and close, no storm/music/voice, -14 LUFS', 'first ocean wave on wet sand'],
  ['t4-engines-loop', 3.2, true, 'seamless small convoy engine loop, warm brass pistons, soft steam and leather belt rhythm, handmade motor-age machinery, no horn/music/voice, -18 LUFS', 'warm brass convoy engines'],
  ['t4-wind', 1.4, false, 'short dune-crest wind falling into near silence, dry sand and one soft canvas flap, warm small frontier scene, no whistle/music/voice, -18 LUFS', 'dune wind falling quiet'],
  ['t5-winch-rhythm', 1.8, false, 'short flotilla winch rhythm cue, three spaced wooden ratchet ticks with wet rope tension and small water drips, warm handmade machinery, no music/voice, -14 LUFS', 'wet rope and winch ticks'],
  ['t5-deep-hum-loop', 3.2, true, 'seamless deep reactor hum loop, low old brass dynamo and patient steam vibration heard through water, warm and small, no alarm/music/voice, -18 LUFS', 'old warm underwater machine hum'],
  ['t5-surfacing', 1.5, false, 'short surfacing cue, wet brass housing rises as water sheets away, soft teal glass resonance, patient not triumphant, no music/voice, -14 LUFS', 'wet brass surfacing wash'],
  ['dredge-queen-arrival-horn', 2.4, false, 'short Dredge-Queen arrival horn, low weathered brass ship horn over one hull creak and dark water, imposing not horror, no orchestra/drums/voice, -14 LUFS', 'weathered brass ship arrival horn'],
  ['homemaker-done-chime', 1.2, false, 'short Homemaker DONE chime, small warm brass kitchen timer bell with one tidy latch click, gentle completion not victory, no music/voice, -14 LUFS', 'warm tidy done chime'],
  ['old-digger-tape-swap', 0.8, false, 'short Old Digger tape-swap click, dry mechanical reel eject, paper tape slide and firm brass latch, readable close foley, no music/voice, -14 LUFS', 'paper tape swap and brass latch'],
  ['e5-deepwater-ambience-loop', 6.0, true, 'seamless Deepwater harbor ambience loop, small surf against timber pilings, distant steam winch, hull rope creak and calm open water, warm lived-in frontier harbor, no storm/music/voice, -18 LUFS', 'warm small deepwater harbor'],
].map(([name, seconds, loop, prompt, readsAs]) => ({ name, seconds, loop, prompt, readsAs }));

const only = process.argv.find((arg) => arg.startsWith('--only='))?.slice('--only='.length);
const batchSounds = sounds.slice(sounds.findIndex((sound) => sound.name === 't4-first-wave'));

function cleanCell(value) {
  return String(value).replace(/\s+/g, ' ').replaceAll('|', '/').trim();
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function ensureLedger() {
  await mkdir(path.dirname(LEDGER), { recursive: true });
  try {
    await stat(LEDGER);
  } catch {
    await writeFile(
      LEDGER,
      '# Audio Ledger - Gold Rush\n\n| name | prompt | seconds | credits-cost | takes | status | remaining-credits-after |\n|---|---|---:|---:|---:|---|---:|\n',
    );
  }
}

async function ledger(row) {
  await appendFile(
    LEDGER,
    `| ${[
      row.name,
      row.prompt,
      row.seconds,
      row.cost,
      row.takes,
      row.status,
      row.remaining,
    ].map(cleanCell).join(' | ')} |\n`,
  );
}

async function generatedNames() {
  const text = await readFile(LEDGER, 'utf8').catch(() => '');
  return new Set([...text.matchAll(/^\| ([^|]+) \| .* \| (?:kept; )?generated;/gm)].map((match) => match[1].trim()));
}

async function batchStartRemaining(fallback) {
  const text = await readFile(LEDGER, 'utf8').catch(() => '');
  const row = text.split('\n').find((line) => line.startsWith('| batch-start | remaining credits before lane-a-audio-batch-01 |'));
  const remaining = Number(row?.split('|').at(-2)?.trim());
  return Number.isFinite(remaining) ? remaining : fallback;
}

async function exists(file) {
  try {
    await stat(file);
    return true;
  } catch {
    return false;
  }
}

async function readApiKey() {
  const text = await readFile(path.join(ROOT, '.env.local'), 'utf8');
  const line = text.split(/\r?\n/).find((entry) => /^\s*ELEVENLABS_API_KEY\s*=/.test(entry));
  const value = line?.replace(/^\s*ELEVENLABS_API_KEY\s*=\s*/, '').trim().replace(/^['"]|['"]$/g, '');
  if (!value) throw new Error('ELEVENLABS_API_KEY missing from .env.local');
  return value;
}

async function apiFetch(key, apiPath, options = {}) {
  const res = await fetch(`${API_BASE}${apiPath}`, {
    ...options,
    headers: {
      'xi-api-key': key,
      ...options.headers,
    },
  });
  if (res.ok) return res;
  const body = (await res.text()).replace(/\s+/g, ' ').slice(0, 300);
  const err = new Error(`ElevenLabs HTTP ${res.status}: ${body}`);
  err.status = res.status;
  throw err;
}

async function credits(key) {
  const res = await apiFetch(key, '/user/subscription');
  const sub = await res.json();
  const used = Number(sub.character_count);
  const limit = Number(sub.character_limit);
  if (!Number.isFinite(used) || !Number.isFinite(limit)) {
    throw new Error('ElevenLabs subscription response did not include character_count/character_limit');
  }
  return { used, limit, remaining: Math.max(0, limit - used) };
}

async function generate(key, sound) {
  const url = `/sound-generation?output_format=${encodeURIComponent(OUTPUT_FORMAT)}`;
  const res = await apiFetch(key, url, {
    method: 'POST',
    headers: {
      Accept: 'audio/mpeg',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: sound.prompt,
      duration_seconds: sound.seconds,
      prompt_influence: sound.loop ? 0.48 : 0.7,
      loop: sound.loop,
      model_id: MODEL_ID,
    }),
  });
  const data = Buffer.from(await res.arrayBuffer());
  await mkdir(RAW_DIR, { recursive: true });
  const out = path.join(RAW_DIR, `${sound.name}.mp3`);
  await writeFile(out, data);
  return out;
}

function measuredDuration(file) {
  const ffprobe = spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', file], { encoding: 'utf8' });
  if (ffprobe.status === 0) {
    const value = Number(ffprobe.stdout.trim());
    if (Number.isFinite(value)) return value;
  }
  const afinfo = spawnSync('afinfo', [file], { encoding: 'utf8' });
  const match = afinfo.stdout?.match(/estimated duration:\s*([0-9.]+)/i) ?? afinfo.stdout?.match(/duration:\s*([0-9.]+)/i);
  const value = match ? Number(match[1]) : NaN;
  return Number.isFinite(value) ? value : null;
}

function qaStatus(sound, file) {
  const actual = measuredDuration(file);
  const min = sound.seconds < 0.5 ? 0.25 : 0.5;
  const max = sound.loop ? 8 : Math.max(2.5, sound.seconds + 0.15);
  const duration = actual == null ? `duration unknown, requested ${sound.seconds}s` : `duration ${actual.toFixed(2)}s ${actual >= min && actual <= max ? 'OK' : 'RETAKE-CANDIDATE batch-002'}`;
  const seam = sound.loop ? '; loop seam: generated with loop=true, audition seam before integration' : '';
  return `generated; ${duration}; reads as ${sound.readsAs}${seam}`;
}

async function main() {
  await ensureLedger();
  const key = await readApiKey();
  let start;
  try {
    start = await credits(key);
  } catch (err) {
    if (err.status === 401 || err.status === 403) throw new Error('ElevenLabs auth rejected .env.local key; stopping without retries');
    throw err;
  }
  let current = start;
  const done = await generatedNames();
  const batchStart = await batchStartRemaining(current.remaining);
  let spent = Math.max(
    batchStart - current.remaining,
    batchSounds.filter((sound) => done.has(sound.name)).reduce((sum, sound) => sum + sound.prompt.length, 0),
  );
  await ledger({ name: 'batch-start', prompt: 'remaining credits before lane-a-audio-batch-01', seconds: 0, cost: 0, takes: 0, status: 'queried before batch', remaining: current.remaining });

  for (const sound of sounds) {
    if (only && sound.name !== only) continue;
    if (done.has(sound.name) && await exists(path.join(RAW_DIR, `${sound.name}.mp3`))) {
      console.log(`${sound.name}: skipped existing`);
      continue;
    }

    const projectedSpent = spent + sound.prompt.length;
    if (projectedSpent > SPEND_CAP || batchStart - projectedSpent < MIN_REMAINING) {
      await ledger({ name: 'batch-stop', prompt: `stopped before ${sound.name}`, seconds: 0, cost: 0, takes: 0, status: `STOP cap=${SPEND_CAP} spent=${spent} minRemaining=${MIN_REMAINING}`, remaining: current.remaining });
      console.log(`STOP spent=${spent} remaining=${current.remaining}`);
      return;
    }

    const before = current.remaining;
    let out;
    try {
      spent = projectedSpent;
      await sleep(API_PAUSE_MS);
      out = await generate(key, sound);
      await sleep(API_PAUSE_MS);
      current = await credits(key);
      spent = Math.max(spent, batchStart - current.remaining);
      await ledger({ name: sound.name, prompt: sound.prompt, seconds: sound.seconds, cost: before - current.remaining, takes: 1, status: qaStatus(sound, out), remaining: current.remaining });
      console.log(`${sound.name}: generated, cost=${before - current.remaining}, remaining=${current.remaining}`);
    } catch (err) {
      current = await credits(key).catch(() => current);
      const status = out ? `${qaStatus(sound, out)}; post-generation credit query failed ${err.status ?? 'error'}, stopping` : `FAILED ${err.status ?? 'error'}: ${String(err.message).slice(0, 180)}`;
      await ledger({ name: sound.name, prompt: sound.prompt, seconds: sound.seconds, cost: before - current.remaining, takes: 1, status, remaining: current.remaining });
      if (err.status === 401 || err.status === 403) throw new Error('ElevenLabs auth rejected during generation; stopping without retries');
      throw err;
    }
  }

  console.log(`DONE spent<=${spent} remaining=${current.remaining}`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
