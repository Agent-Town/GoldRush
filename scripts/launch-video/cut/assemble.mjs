// scripts/launch-video/cut/assemble.mjs: builds the launch film's exports from the phase-2 takes, the plates and the
// rendered cards, exactly as edl.mjs says (task launch-video-cut-3). Node + ffmpeg only; no server, no browser.
// Pipeline per shape: each shot to a near-lossless 4:4:4 intermediate (work/<shape>/shots, cached by a hash of its
// exact ffmpeg arguments and inputs), each beat composed with its cards, page border, "in game" marks and the
// parchment grain (work/<shape>/beats), then the film encoded once with the mix (mix.mjs) into cut/. Colour: the
// takes are full-range BT.601 (yuvj420p, smpte170m); everything is composited in RGB and leaves as BT.709.
// Usage:
//   node scripts/launch-video/cut/assemble.mjs --check                 validate every source, print the cut list
//   node scripts/launch-video/cut/assemble.mjs --cutlist FILE          write the cut list as markdown
//   node scripts/launch-video/cut/assemble.mjs --format master[,landscape,vertical] [--beats B1,B2] [--no-export]
//   node scripts/launch-video/cut/assemble.mjs --web | --teaser | --all
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { BEATS, CARDS, CUES, ERA_PUSH, FILM_FRAMES, FORMATS, INK, MENU_FRAMING, PLATES, TAKES, TEASER, TEASER_CUT, TEASER_CUES, VERSION, WEB } from './edl.mjs';
import { CUT, FPS, WORK, bytes, duration, ensureDir, fmtTime, label, platePath, run, sidecar, takePath } from './lib.mjs';
import { buildMix, ebur128 } from './mix.mjs';

const CARDS_DIR = path.join(WORK, 'cards');
const TO_RGB_601 = 'scale=in_color_matrix=bt601:in_range=full:flags=bicubic+accurate_rnd+full_chroma_int,format=gbrp';
const TO_RGB_709 = 'scale=in_color_matrix=bt709:in_range=tv:flags=bicubic+accurate_rnd+full_chroma_int,format=gbrp';
const TO_YUV444 = 'scale=out_color_matrix=bt709:out_range=tv:flags=bicubic+accurate_rnd+full_chroma_int,format=yuv444p,setsar=1';
const TAGS = ['-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-color_range', 'tv'];
// the takes carry unknown primaries and transfer, and the encoder writes the frames' own properties, so the exports
// are stamped in the filter graph itself (the intermediates are internal and always decoded as BT.709 explicitly)
const STAMP_709 = 'setparams=color_primaries=bt709:color_trc=bt709:colorspace=bt709:range=tv';
const MEZZ = ['-an', '-r', `${FPS}`, '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '8', '-pix_fmt', 'yuv444p', ...TAGS];
// the night grade: a toe curve that lifts the blacks to ledger-ink #2e1b0e (treatment, the look) and leaves the mids
// and highlights where the game put them
const NIGHT = "curves=r='0/0.180 0.25/0.285 1/1':g='0/0.106 0.25/0.262 1/1':b='0/0.055 0.25/0.252 1/1'";
const even = (n) => 2 * Math.round(n / 2);
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

// An intermediate is reused when its ffmpeg arguments and its inputs are unchanged: small inputs (cards, plates,
// shots) by content, the multi-gigabyte takes by size and time.
function fingerprint(args, inputs) {
  const h = createHash('sha256').update(JSON.stringify(args));
  for (const file of inputs) {
    const s = statSync(file);
    h.update(s.size < 256 * 1024 * 1024 ? `${file}:${createHash('sha1').update(readFileSync(file)).digest('hex')}` : `${file}:${s.size}:${s.mtimeMs}`);
  }
  return h.digest('hex');
}

function cached(out, args, inputs) {
  const spec = `${out}.spec`;
  const hash = fingerprint(args, inputs);
  if (existsSync(out) && existsSync(spec) && readFileSync(spec, 'utf8') === hash) return true;
  return { spec, hash };
}

function ffmpeg(out, args, inputs) {
  const c = cached(out, args, inputs);
  if (c === true) return false;
  run('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-nostdin', '-y', ...args, out]);
  writeFileSync(c.spec, c.hash);
  return true;
}

// ---- framing -------------------------------------------------------------------------------------------------
// A take seen through a shape: the master keeps the 1920x1200 frame, the landscape crops 1920x1080, the vertical uses
// the 390x844 take's 780x1387 window (scaled to 1080x1920), or failing one, the treatment's fallback: a 675x1200
// reframed crop of the master, or a UI panel scaled to the width on the ledger-ink ground.
function framing(shot, fmtName) {
  const fmt = FORMATS[fmtName];
  if (fmtName === 'vertical') {
    const v = shot.vertical ?? {};
    if (v.take) return { take: TAKES[v.take], in: v.in, vf: `crop=780:1387:0:${v.y ?? 0},scale=1080:1920:flags=lanczos`, frame: [1080, 1920], source: 'vertical take' };
    const panel = v.panel ?? shot.panel;
    if (panel) { const [x, y, w, h] = panel; const h2 = even((h * 1080) / w); return { take: TAKES[shot.take], in: shot.in, vf: `crop=${w}:${h}:${x}:${y},scale=1080:${h2}:flags=lanczos,pad=1080:1920:0:${(1920 - h2) / 2}:color=${INK}`, frame: [1080, 1920], source: `${w}x${h} at (${x}, ${y}) of the master, fitted to the width on ledger-ink (fallback)`, panel: true }; }
    const x = v.x ?? 622;
    return { take: TAKES[shot.take], in: shot.in, vf: `crop=675:1200:${x}:0,scale=1080:1920:flags=lanczos`, frame: [1080, 1920], source: `675x1200 reframe of the master at x=${x} (fallback)` };
  }
  if (shot.panel) {
    const [x, y, w, h] = shot.panel;
    const h2 = even((h * fmt.w) / w);
    const pad = h2 < fmt.h ? `,pad=${fmt.w}:${fmt.h}:0:${(fmt.h - h2) / 2}:color=${INK}` : '';
    return { take: TAKES[shot.take], in: shot.in, vf: `crop=${w}:${h}:${x}:${y},scale=${fmt.w}:${Math.min(h2, fmt.h)}:flags=lanczos${pad}`, frame: [fmt.w, fmt.h], source: 'panel', yoff: 0, panel: true };
  }
  if (fmtName === 'landscape') { const y = shot.landscape?.y ?? 60; return { take: TAKES[shot.take], in: shot.in, vf: `crop=1920:1080:0:${y}`, frame: [1920, 1080], yoff: y, source: `1920x1080 crop at y=${y}` }; }
  return { take: TAKES[shot.take], in: shot.in, vf: '', frame: [1920, 1200], yoff: 0, source: 'the take\'s own 1920x1200' };
}

// zoompan: an absolute zoom path z0->z1 and a window centre path (normalised to the frame), eased, from a start time.
function zoompan({ z, from = 0, ease = 'linear', u = [0.5, 0.5], v = [0.5, 0.5] }, N, [W, H], single) {
  const F0 = Math.round(from * FPS);
  const span = Math.max(1, N - 1 - F0);
  const p = `max(0\\,min(1\\,(on-${F0})/${span}))`;
  const e = ease === 'cos' ? `(1-cos(PI*${p}))/2` : p;
  const lerp = ([a, b]) => (a === b ? `${a}` : `(${a}+(${(b - a).toFixed(6)})*${e})`);
  const zz = lerp(z);
  return `zoompan=z='${zz}':x='max(0\\,min(iw-iw/zoom\\,${lerp(u)}*iw-iw/zoom/2))':y='max(0\\,min(ih-ih/zoom\\,${lerp(v)}*ih-ih/zoom/2))':d=${single ? N : 1}:s=${W}x${H}:fps=${FPS}`;
}

function pushFor(shot, f, fmtName) {
  if (!shot.push) return null;
  const [W, H] = f.frame;
  if (fmtName === 'vertical') {
    if (f.panel) return { z: [1.0, 1.04], ease: 'cos' };
    return { z: shot.push.z, from: shot.push.from, ease: shot.push.ease };
  }
  if (!shot.push.at) return { z: shot.push.z, from: shot.push.from, ease: shot.push.ease };
  const [[x0, y0], [x1, y1]] = shot.push.at;
  return { z: shot.push.z, from: shot.push.from, ease: shot.push.ease, u: [x0 / W, x1 / W], v: [(y0 - f.yoff) / H, (y1 - f.yoff) / H], prescale: shot.push.prescale };
}

// the largest window-aspect region of a plate centred at (cx, cy), clamped inside it
function region(pw, ph, ww, wh, cx = 0.5, cy = 0.5) {
  const a = ww / wh;
  const [rw, rh] = pw / ph > a ? [ph * a, ph] : [pw, pw / a];
  const x = clamp(cx * pw - rw / 2, 0, pw - rw);
  const y = clamp(cy * ph - rh / 2, 0, ph - rh);
  return { x: Math.round(x), y: Math.round(y), w: Math.round(rw), h: Math.round(rh) };
}

const PLATE_SIZE = [1672, 941];

// ---- shots ---------------------------------------------------------------------------------------------------
function shotStarts(beat) {
  const starts = [];
  let acc = 0;
  beat.shots.forEach((shot, i) => { if (i > 0) acc -= shot.xfade ?? 0; starts.push(acc); acc += shot.len; });
  return starts;
}

function renderShot(beat, shot, index, fmtName, start) {
  const fmt = FORMATS[fmtName];
  const dir = ensureDir(path.join(WORK, fmtName, 'shots'));
  const out = path.join(dir, `${beat.id}-${index + 1}.mp4`);
  const N = shot.len;
  let args;
  let inputs;
  if (shot.black) {
    args = ['-f', 'lavfi', '-i', `color=c=black:s=${fmt.w}x${fmt.h}:r=${FPS}`, '-vf', `format=gbrp,${TO_YUV444}`, '-frames:v', `${N}`, ...MEZZ];
    inputs = [];
  } else if (shot.take && fmtName === 'vertical' && shot.vertical?.segments) {
    // a vertical-only split of one master shot into cuts from the same vertical take (sum of lens = the shot)
    const v = shot.vertical;
    const take = takePath(TAKES[v.take]);
    const total = v.segments.reduce((n, seg) => n + seg.len, 0);
    if (total !== N) throw new Error(`assemble: ${beat.id} shot ${index + 1} vertical segments sum to ${total}, not ${N}`);
    args = [];
    const fc = [];
    v.segments.forEach((seg, k) => {
      args.push('-ss', `${seg.in}`, '-i', take);
      fc.push(`[${k}:v]${TO_RGB_601},settb=1/60,setpts=N,trim=end_frame=${seg.len},crop=780:1387:0:${v.y ?? 0},scale=1080:1920:flags=lanczos,setsar=1[g${k}]`);
    });
    fc.push(`${v.segments.map((_, k) => `[g${k}]`).join('')}concat=n=${v.segments.length}:v=1:a=0,settb=1/60,setpts=N,${TO_YUV444}[v]`);
    args.push('-filter_complex', fc.join(';'), '-map', '[v]', '-frames:v', `${N}`, ...MEZZ);
    inputs = [take];
  } else if (shot.take) {
    const f = framing(shot, fmtName);
    const push = pushFor(shot, f, fmtName);
    const chain = [TO_RGB_601, 'settb=1/60,setpts=N', f.vf, shot.grade === 'night' ? NIGHT : '',
      push ? `${push.prescale ? `scale=iw*${push.prescale}:ih*${push.prescale}:flags=lanczos,` : ''}${zoompan(push, N, f.frame, false)}` : '',
      shot.fadeIn ? `fade=t=in:st=0:d=${shot.fadeIn}` : '', 'settb=1/60,setpts=N', TO_YUV444].filter(Boolean).join(',');
    args = ['-ss', `${f.in}`, '-i', takePath(f.take), '-vf', chain, '-frames:v', `${N}`, ...MEZZ];
    inputs = [takePath(f.take)];
  } else if (shot.plate) {
    const win = shot.page ? fmt.page : { x: 0, y: 0, w: fmt.w, h: fmt.h };
    const cx = fmtName === 'vertical' ? shot.region?.vertical ?? 0.5 : shot.region?.[fmtName] ?? 0.5;
    const r = region(...PLATE_SIZE, win.w, win.h, cx);
    const zpath = shot.eraPush
      ? { z: [ERA_PUSH.z0 + ((ERA_PUSH.z1 - ERA_PUSH.z0) * start) / ERA_PUSH.seconds / FPS, ERA_PUSH.z0 + ((ERA_PUSH.z1 - ERA_PUSH.z0) * (start + N - 1)) / ERA_PUSH.seconds / FPS] }
      : { z: shot.z, u: shot.c ? [shot.c[0][0], shot.c[1][0]] : [0.5, 0.5], v: shot.c ? [shot.c[0][1], shot.c[1][1]] : [0.5, 0.5] };
    const pre = `crop=${r.w}:${r.h}:${r.x}:${r.y},scale=iw*4:ih*4:flags=lanczos`;
    const pad = shot.page ? `,pad=${fmt.w}:${fmt.h}:${win.x}:${win.y}:color=black` : '';
    if (shot.parallax) {
      const far = path.join(CARDS_DIR, 'b2-far.png');
      const near = path.join(CARDS_DIR, 'b2-near.png');
      const fc = `[0:v]format=rgb24,${pre},${zoompan(zpath, N, [win.w, win.h], true)},format=gbrp[far];[1:v]format=rgba,${pre},${zoompan({ ...zpath, z: shot.zNear }, N, [win.w, win.h], true)}[near];[far][near]overlay=0:0:format=gbrp${pad},settb=1/60,setpts=N,${TO_YUV444}[v]`;
      args = ['-i', far, '-i', near, '-filter_complex', fc, '-map', '[v]', '-frames:v', `${N}`, ...MEZZ];
      inputs = [far, near];
    } else {
      const file = platePath(PLATES[shot.plate]);
      args = ['-i', file, '-vf', `format=rgb24,${pre},${zoompan(zpath, N, [win.w, win.h], true)},format=gbrp${pad},settb=1/60,setpts=N,${TO_YUV444}`, '-frames:v', `${N}`, ...MEZZ];
      inputs = [file];
    }
  } else if (shot.still === 'menu') {
    const vertical = fmtName === 'vertical';
    const file = path.join(CARDS_DIR, vertical ? 'menu-still-780x1688.png' : 'menu-still-1920x1200.png');
    const vf = vertical ? `crop=780:1387:0:${MENU_FRAMING.vertical.y},scale=1080:1920:flags=lanczos` : fmtName === 'landscape' ? `crop=1920:1080:0:${MENU_FRAMING.landscape.y}` : '';
    args = ['-i', file, '-vf', [`loop=loop=${N - 1}:size=1:start=0`, 'settb=1/60,setpts=N', 'format=gbrp', vf, TO_YUV444].filter(Boolean).join(','), '-frames:v', `${N}`, ...MEZZ];
    inputs = [file];
  } else if (shot.endcard) {
    const file = path.join(CARDS_DIR, fmtName, 'endcard.png');
    const fade = shot.fadeOut ? `,fade=t=out:st=${(N / FPS - shot.fadeOut).toFixed(3)}:d=${shot.fadeOut}` : '';
    args = ['-i', file, '-vf', `loop=loop=${N - 1}:size=1:start=0,settb=1/60,setpts=N,format=gbrp${fade},${TO_YUV444}`, '-frames:v', `${N}`, ...MEZZ];
    inputs = [file];
  } else throw new Error(`assemble: ${beat.id} shot ${index + 1} has no source`);
  const rendered = ffmpeg(out, args, inputs);
  return { out, rendered };
}

// ---- beats ---------------------------------------------------------------------------------------------------
function cardBox(fmtName, id) {
  const manifest = JSON.parse(readFileSync(path.join(CARDS_DIR, 'manifest.json'), 'utf8'));
  const box = manifest.formats?.[fmtName]?.cards?.[id];
  if (!box) throw new Error(`assemble: no rendered card ${fmtName}/${id}; run cards.mjs first`);
  const fmt = FORMATS[fmtName];
  if (CARDS[id]?.type === 'lockup') return { x: 0, y: 0, w: fmt.w, h: fmt.h }; // its soft scrim spans the frame
  const m = 110; // the slip's drop shadow and the night glow reach beyond its box
  const x = Math.max(0, box.x - m);
  const y = Math.max(0, box.y - m);
  return { x, y, w: even(Math.min(fmt.w, box.x + box.w + m) - x), h: even(Math.min(fmt.h, box.y + box.h + m) - y) };
}

function composeBeat(beat, fmtName, shotFiles, { extraMark } = {}) {
  const fmt = FORMATS[fmtName];
  const dir = ensureDir(path.join(WORK, fmtName, 'beats'));
  const out = path.join(dir, `${beat.id}${extraMark !== undefined ? '-marked' : ''}.mp4`); // extraMark may be 0
  const NB = beat.frames[1] - beat.frames[0];
  const inputs = [];
  const args = [];
  const add = (file, pre = []) => { args.push(...pre, '-i', file); inputs.push(file); return inputs.length - 1; };
  const fc = [];
  shotFiles.forEach((file, i) => { const k = add(file); fc.push(`[${k}:v]${TO_RGB_709},setsar=1,settb=1/60,setpts=N,fps=${FPS}[s${i}]`); });
  let acc = 's0';
  let length = beat.shots[0].len;
  beat.shots.slice(1).forEach((shot, j) => {
    const i = j + 1;
    const d = shot.xfade ?? 0;
    const next = `a${i}`;
    if (d > 0) fc.push(`[${acc}][s${i}]xfade=transition=fade:duration=${(d / FPS).toFixed(4)}:offset=${((length - d) / FPS).toFixed(4)}[${next}]`);
    else fc.push(`[${acc}][s${i}]concat=n=2:v=1:a=0[${next}]`);
    length += shot.len - d;
    acc = next;
  });
  fc.push(`[${acc}]settb=1/60,setpts=N[b0]`);
  acc = 'b0';
  let n = 0;
  const over = (label, x, y, extra = '') => { const next = `o${n++}`; fc.push(`[${acc}][${label}]overlay=${x}:${y}:format=gbrp${extra}[${next}]`); acc = next; };
  const loopPng = (file) => `[${add(file)}:v]loop=loop=${NB - 1}:size=1:start=0,settb=1/60,setpts=N,fps=${FPS}`;
  if (beat.page) {
    const [t0, t1, fo] = beat.page;
    fc.push(`${loopPng(path.join(CARDS_DIR, fmtName, 'page.png'))},format=rgba${fo ? `,fade=t=out:st=${t1}:d=${fo}:alpha=1` : ''}[pg]`);
    over('pg', 0, 0, `:enable='between(t,${t0},${t1 + fo})'`);
  }
  if (beat.overlay) {
    const o = beat.overlay;
    const f = fmtName === 'vertical' ? { take: TAKES[o.vertical.take], in: o.vertical.in, vf: `crop=780:1387:0:${o.vertical.y},scale=1080:1920:flags=lanczos` } : { take: TAKES[o.take], in: o.in, vf: fmtName === 'landscape' ? `crop=1920:1080:0:${MENU_FRAMING.landscape.y}` : '' };
    const k = add(takePath(f.take), ['-ss', `${f.in}`, '-t', `${(o.len / FPS).toFixed(4)}`]);
    const len = o.len / FPS;
    fc.push(`[${k}:v]${[TO_RGB_601, f.vf, 'setsar=1', 'format=rgba', 'settb=1/60,setpts=N', `fade=t=in:st=0:d=${o.fadeIn}:alpha=1`, `fade=t=out:st=${(len - o.fadeOut).toFixed(4)}:d=${o.fadeOut}:alpha=1`].filter(Boolean).join(',')}[ov]`);
    over('ov', 0, 0, ':eof_action=pass');
  }
  const cards = [...beat.cards.map(([id, t0, t1, fi = 0.3, fo = 0.3]) => ({ id, t0, t1, fi, fo })), ...(beat.marks ?? []).map((t) => ({ id: 'mark', t0: t, t1: t + 1.0, fi: 0.15, fo: 0.2 })), ...(extraMark !== undefined ? [{ id: 'mark', t0: extraMark, t1: extraMark + 1.0, fi: 0.15, fo: 0.2 }] : [])];
  cards.forEach((c, i) => {
    const b = cardBox(fmtName, c.id);
    const fades = [c.fi ? `fade=t=in:st=${c.t0}:d=${c.fi}:alpha=1` : '', c.fo ? `fade=t=out:st=${(c.t1 - c.fo).toFixed(3)}:d=${c.fo}:alpha=1` : ''].filter(Boolean).join(',');
    fc.push(`${loopPng(path.join(CARDS_DIR, fmtName, `${c.id}.png`))},crop=${b.w}:${b.h}:${b.x}:${b.y},format=rgba${fades ? `,${fades}` : ''}[c${i}]`);
    over(`c${i}`, b.x, b.y, `:enable='between(t,${c.t0},${c.t1})'`);
  });
  fc.push(`${loopPng(path.join(CARDS_DIR, fmtName, 'grain.png'))},format=rgba[gr]`);
  over('gr', 0, 0);
  // beat-level fades come last, after the grain, so the head and the tail are true black (the fade out completes two
  // frames before the end, so the 30 fps web copy also ends on black)
  const fades = [beat.fade?.in ? `fade=t=in:st=${beat.fade.in[0]}:d=${beat.fade.in[1]}` : '', beat.fade?.out ? `fade=t=out:st=${(NB / FPS - beat.fade.out - 2 / FPS).toFixed(4)}:d=${beat.fade.out}` : ''].filter(Boolean);
  fc.push(`[${acc}]${fades.length ? `${fades.join(',')},` : ''}settb=1/60,setpts=N,${TO_YUV444}[v]`);
  args.push('-filter_complex', fc.join(';'), '-map', '[v]', '-frames:v', `${NB}`, ...MEZZ);
  const rendered = ffmpeg(out, args, inputs);
  return { out, rendered };
}

function buildBeat(beat, fmtName, opts = {}) {
  const starts = shotStarts(beat);
  const shots = beat.shots.map((shot, i) => renderShot(beat, shot, i, fmtName, starts[i]));
  const composed = composeBeat(beat, fmtName, shots.map((s) => s.out), opts);
  return { ...composed, shotsRendered: shots.filter((s) => s.rendered).length };
}

// ---- exports -------------------------------------------------------------------------------------------------
const FINAL_VIDEO = ['-r', `${FPS}`, '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-g', '120', '-bf', '3', ...TAGS];

function concatList(files, name) {
  const list = path.join(WORK, `${name}.concat.txt`);
  writeFileSync(list, files.map((f) => `file '${f}'`).join('\n'));
  return list;
}

function exportFormat(fmtName, beatFiles) {
  const mix = buildMix('film');
  const out = path.join(CUT, FORMATS[fmtName].file);
  const list = concatList(beatFiles, `${fmtName}-film`);
  const args = ['-f', 'concat', '-safe', '0', '-i', list, '-i', mix.wav, '-map', '0:v', '-map', '1:a', '-vf', `settb=1/60,setpts=N,scale=flags=bicubic+accurate_rnd+full_chroma_int,format=yuv420p,${STAMP_709}`, '-frames:v', `${FILM_FRAMES}`, ...FINAL_VIDEO, '-c:a', 'aac', '-b:a', '256k', '-ar', '48000', '-t', `${FILM_FRAMES / FPS}`, '-movflags', '+faststart'];
  ffmpeg(out, args, [...beatFiles, mix.wav]);
  return out;
}

function buildFormat(fmtName, { beats, exportFilm = true } = {}) {
  const t0 = Date.now();
  const files = [];
  for (const beat of BEATS) {
    if (beats && !beats.includes(beat.id)) { files.push(path.join(WORK, fmtName, 'beats', `${beat.id}.mp4`)); continue; }
    const r = buildBeat(beat, fmtName);
    console.log(`assemble: ${fmtName} ${beat.id} ${r.rendered ? 'composed' : 'cached'} (${r.shotsRendered} shots rendered) ${((Date.now() - t0) / 1000).toFixed(0)} s`);
    files.push(r.out);
  }
  if (!exportFilm) return null;
  const out = exportFormat(fmtName, files);
  console.log(`assemble: ${fmtName} -> ${out} ${bytes(out)} B, ${duration(out).toFixed(3)} s, ${((Date.now() - t0) / 1000).toFixed(0)} s`);
  return out;
}

function buildWeb() {
  const master = path.join(CUT, FORMATS.master.file);
  const out = path.join(CUT, WEB.file);
  const pass = path.join(WORK, 'web-2pass');
  const common = ['-i', master, '-vf', `scale=${WEB.w}:${WEB.h}:flags=lanczos,fps=${WEB.fps},${STAMP_709}`, '-c:v', 'libx264', '-preset', 'slow', '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-b:v', `${WEB.videoKbps}k`, '-maxrate', `${Math.round(WEB.videoKbps * 1.6)}k`, '-bufsize', `${WEB.videoKbps * 3}k`, '-g', `${WEB.fps * 4}`, ...TAGS, '-passlogfile', pass];
  const c = cached(out, common, [master]);
  if (c !== true) {
    run('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-nostdin', '-y', ...common, '-pass', '1', '-an', '-f', 'mp4', '/dev/null']);
    run('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-nostdin', '-y', ...common, '-pass', '2', '-c:a', 'aac', '-b:a', `${WEB.audioKbps}k`, '-ar', '48000', '-movflags', '+faststart', out]);
    writeFileSync(c.spec, c.hash);
  }
  if (bytes(out) >= WEB.maxBytes) throw new Error(`assemble: the web export is ${bytes(out)} B, over ${WEB.maxBytes}`);
  // the poster: the B3 title frame (the lockup over the valley, film 16.95 s)
  const poster = path.join(CUT, WEB.poster);
  for (const q of [3, 4, 5, 6, 8]) {
    run('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-nostdin', '-y', '-ss', '16.95', '-i', master, '-frames:v', '1', '-vf', `scale=${WEB.w}:${WEB.h}:flags=lanczos`, '-q:v', `${q}`, poster]);
    if (bytes(poster) < WEB.posterMaxBytes) break;
  }
  console.log(`assemble: web -> ${out} ${bytes(out)} B; poster ${bytes(poster)} B`);
  return out;
}

function buildTeaser() {
  const fmtName = TEASER.format;
  const files = [];
  const byId = Object.fromEntries(BEATS.map((b) => [b.id, b]));
  let at = 0;
  for (const part of TEASER_CUT) {
    if (part.endcard) {
      const beat = { id: 'TEASER-END', frames: [0, part.len], shots: [{ endcard: true, len: part.len }], cards: [], fade: { out: part.fadeOut } };
      files.push({ file: buildBeat(beat, fmtName).out, from: 0, len: part.len });
    } else {
      const beat = byId[part.beat];
      const r = part.mark ? buildBeat(beat, fmtName, { extraMark: 0.0 }) : { out: path.join(WORK, fmtName, 'beats', `${beat.id}.mp4`) };
      files.push({ file: r.out, from: part.from, len: part.len });
    }
    at += part.len;
  }
  if (at !== TEASER.frames) throw new Error(`assemble: the teaser sums to ${at} frames, not ${TEASER.frames}`);
  const mix = buildMix('teaser');
  const out = path.join(CUT, TEASER.file);
  const args = [];
  const fc = [];
  files.forEach((f, i) => { args.push('-i', f.file); fc.push(`[${i}:v]trim=start_frame=${f.from}:end_frame=${f.from + f.len},settb=1/60,setpts=N[t${i}]`); });
  fc.push(`${files.map((_, i) => `[t${i}]`).join('')}concat=n=${files.length}:v=1:a=0,settb=1/60,setpts=N,format=yuv420p,${STAMP_709}[v]`);
  args.push('-i', mix.wav, '-filter_complex', fc.join(';'), '-map', '[v]', '-map', `${files.length}:a`, '-frames:v', `${TEASER.frames}`, ...FINAL_VIDEO, '-c:a', 'aac', '-b:a', '256k', '-ar', '48000', '-t', `${TEASER.frames / FPS}`, '-movflags', '+faststart');
  ffmpeg(out, args, [...files.map((f) => f.file), mix.wav]);
  console.log(`assemble: teaser -> ${out} ${bytes(out)} B, ${duration(out).toFixed(3)} s`);
  return out;
}

// ---- the cut list --------------------------------------------------------------------------------------------
function hudToggles(take, a, b) {
  const marks = sidecar(take).recording?.marks ?? [];
  return marks.filter((m) => /^hud/.test(m.name) && m.t > a && m.t < b).map((m) => `${m.name} at ${m.t.toFixed(1)} s`);
}

export function cutList() {
  const lines = [];
  const problems = [];
  lines.push(`# The cut list, ${VERSION} (generated by scripts/launch-video/cut/assemble.mjs from edl.mjs)`, '');
  lines.push('Film time is frame-exact at 60 fps; take times are seconds of the take\'s own clip; labels come from each take\'s sidecar. Vertical sources are named per shot.', '');
  let total = 0;
  for (const beat of BEATS) {
    const [f0, f1] = beat.frames;
    total += f1 - f0;
    lines.push(`## ${beat.id} · ${fmtTime(f0 / FPS)} to ${fmtTime(f1 / FPS)} (${((f1 - f0) / FPS).toFixed(3)} s) · ${beat.title}`, '');
    lines.push('| Shot | Film | Source (master and landscape) | In to out | Label | Vertical | Why |', '|---|---|---|---|---|---|---|');
    const starts = shotStarts(beat);
    beat.shots.forEach((shot, i) => {
      const a = (f0 + starts[i]) / FPS;
      const b = a + shot.len / FPS;
      let src; let io; let lab; let vert;
      if (shot.black) { src = 'black'; io = '-'; lab = '-'; vert = 'black'; }
      else if (shot.take) {
        const take = TAKES[shot.take];
        const len = shot.len / FPS;
        src = `\`${take}\``;
        io = `${shot.in.toFixed(2)} to ${(shot.in + len).toFixed(2)} s`;
        lab = label(take);
        if (!existsSync(takePath(take))) problems.push(`missing take ${take}`);
        else if (shot.in + len > duration(takePath(take)) + 0.01) problems.push(`${beat.id} shot ${i + 1} runs past the end of ${take}`);
        const hud = hudToggles(take, shot.in, shot.in + len);
        if (hud.length) problems.push(`${beat.id} shot ${i + 1}: HUD toggles inside the window (${hud.join(', ')})`);
        const f = framing(shot, 'vertical');
        const vt = shot.vertical?.take ? TAKES[shot.vertical.take] : null;
        const segs = shot.vertical?.segments ?? (vt ? [{ in: shot.vertical.in, len: shot.len }] : []);
        vert = vt ? `\`${vt}\` ${segs.map((seg) => `${seg.in.toFixed(2)} to ${(seg.in + seg.len / FPS).toFixed(2)} s`).join(' then ')} (${label(vt) === 'real' ? 'real' : 'STAGED'})` : f.source;
        for (const seg of segs) {
          const vh = hudToggles(vt, seg.in, seg.in + seg.len / FPS);
          if (vh.length) problems.push(`${beat.id} shot ${i + 1} (vertical): HUD toggles inside the window (${vh.join(', ')})`);
          if (seg.in + seg.len / FPS > duration(takePath(vt)) + 0.01) problems.push(`${beat.id} shot ${i + 1} (vertical) runs past the end of ${vt}`);
        }
      } else if (shot.plate) { src = `plate \`store:${PLATES[shot.plate]}\``; io = '-'; lab = 'drawn plate'; vert = `crop of the plate centred at x=${shot.region?.vertical ?? 0.5}`; if (!existsSync(platePath(PLATES[shot.plate]))) problems.push(`missing plate ${PLATES[shot.plate]}`); }
      else if (shot.still) { src = 'the menu\'s backdrop drawn from `store:kit-valley-master.png` with the game\'s own CSS (the match)'; io = '-'; lab = 'drawn plate'; vert = 'the same at the vertical menu\'s framing'; }
      else if (shot.endcard) { src = 'the end card (cards.mjs) over `store:kit-valley-master.png`'; io = '-'; lab = 'type'; vert = 'the vertical end card'; }
      const move = (z, at) => (z[0] !== z[1] ? `push ${z[0]}x to ${z[1]}x` : at && at[0][1] !== at[1][1] ? `tilt down the page at ${z[0]}x` : at && at[0][0] !== at[1][0] ? `pan across at ${z[0]}x` : `drift across at ${z[0]}x`);
      const how = [shot.xfade ? `dissolve ${(shot.xfade / FPS).toFixed(2)} s in` : '', shot.grade === 'night' ? 'night grade' : '', shot.push ? move(shot.push.z, shot.push.at) + (shot.push.from ? ` from ${shot.push.from} s` : '') : '', shot.z ? move(shot.z, shot.c && [[shot.c[0][0], shot.c[0][1]], [shot.c[1][0], shot.c[1][1]]]) : '', shot.eraPush ? 'one continuous 8 percent push' : '', shot.parallax ? `2.5D parallax, near ${shot.zNear.join(' to ')}` : '', shot.fadeIn ? `from black ${shot.fadeIn} s` : '', shot.fadeOut ? `to black ${shot.fadeOut} s` : ''].filter(Boolean).join('; ');
      lines.push(`| ${i + 1} | ${fmtTime(a)} to ${fmtTime(b)} | ${src} | ${io} | ${lab} | ${vert} | ${[how, shot.why].filter(Boolean).join('. ')} |`);
    });
    if (beat.fade) lines.push(`| fade | ${beat.fade.in ? `black to ${fmtTime(f0 / FPS + beat.fade.in[0])}, up from black over ${beat.fade.in[1]} s` : ''}${beat.fade.out ? `to black over the last ${beat.fade.out} s` : ''} | after the grain, so the black is true black | | | | |`);
    if (beat.overlay) {
      const o = beat.overlay;
      lines.push(`| over | ${fmtTime(f0 / FPS)} to ${fmtTime((f0 + o.len) / FPS)} | \`${TAKES[o.take]}\` (the live menu, dissolved in ${o.fadeIn} s and out ${o.fadeOut} s) | ${o.in.toFixed(2)} to ${(o.in + o.len / FPS).toFixed(2)} s | ${label(TAKES[o.take])} | \`${TAKES[o.vertical.take]}\` ${o.vertical.in.toFixed(2)} s | ${o.why} |`);
    }
    lines.push('');
    const texts = beat.cards.map(([id, t0, t1]) => { const c = CARDS[id]; const words = c.text ?? c.lines?.slice(0, c.show).join(' / ') ?? (c.type === 'lockup' ? 'the lockup: emblem, GOLD RUSH, an Agent Town tale' : ''); return `${fmtTime(f0 / FPS + t0)} to ${fmtTime(f0 / FPS + t1)} ${c.type === 'rye' ? 'Rye' : c.type === 'lockup' ? 'lockup' : c.type === 'teal' ? 'Wellfleet, teal rivets' : c.type === 'masthead' ? 'Wellfleet ledger capitals' : `Wellfleet${c.italic ? ' italic' : ''}`}: "${words}"`; });
    for (const t of beat.marks ?? []) texts.push(`${fmtTime(f0 / FPS + t)} to ${fmtTime(f0 / FPS + t + 1)} the "in game" mark`);
    if (texts.length) lines.push(`Type: ${texts.join('; ')}.`, '');
  }
  if (total !== FILM_FRAMES) problems.push(`the beats sum to ${total} frames, not ${FILM_FRAMES}`);
  lines.push('## Sound (the cue sheet as mixed)', '', '| Film | Cue | Source | From to | Gain dB |', '|---|---|---|---|---|');
  for (const c of CUES) lines.push(`| ${fmtTime(c.at)} | ${c.what} | \`assets/audio/raw/${c.src}\` | ${c.loop ? `looped to ${fmtTime(c.to)}` : `${c.from.toFixed(3)} to ${c.to.toFixed(3)} s`} | ${c.gain} |`);
  lines.push('', '## The teaser (30 s, 1920x1080, the Pan Theme only)', '', TEASER_CUT.map((p) => (p.endcard ? `the end card ${(p.len / FPS).toFixed(3)} s` : `${p.beat} frames ${p.from} to ${p.from + p.len}${p.mark ? ' (with the "in game" mark)' : ''}`)).join(' · '), '');
  for (const c of TEASER_CUES) lines.push(`- ${fmtTime(c.at)} ${c.what}: title-theme ${c.from.toFixed(3)} to ${c.to.toFixed(3)} s`);
  return { text: `${lines.join('\n')}\n`, problems, frames: total };
}

// ---- evidence ------------------------------------------------------------------------------------------------
export function evidence(outDir) {
  ensureDir(outDir);
  const exports = [...['master', 'landscape', 'vertical'].map((f) => FORMATS[f].file), WEB.file, TEASER.file];
  const probe = [`# ffprobe of every export of the cut (${new Date().toISOString()}), in ~/.goldrush/launch-video/cut/`, ''];
  const loud = [`# Loudness of the cut (${new Date().toISOString()}); target -14 LUFS integrated, true peak at most -1 dBTP`, ''];
  for (const name of exports) {
    const file = path.join(CUT, name);
    if (!existsSync(file)) { probe.push(`${name}: MISSING`, ''); continue; }
    const j = JSON.parse(run('ffprobe', ['-v', 'error', '-count_frames', '-show_entries', 'format=duration,size,bit_rate:format_tags=major_brand:stream=index,codec_type,codec_name,profile,level,width,height,pix_fmt,r_frame_rate,nb_read_frames,sample_rate,channels,bit_rate,color_space,color_transfer,color_primaries,color_range', '-of', 'json', file], { nice: false }).stdout);
    const v = j.streams.find((s) => s.codec_type === 'video');
    const a = j.streams.find((s) => s.codec_type === 'audio');
    const moov = readFileSync(file).subarray(0, 64 * 1024).includes(Buffer.from('moov'));
    const sha = createHash('sha256').update(readFileSync(file)).digest('hex');
    probe.push(`## ${name}`, `duration ${Number(j.format.duration).toFixed(3)} s · size ${j.format.size} B · ${Math.round(j.format.bit_rate / 1000)} kb/s overall · moov at the head (faststart): ${moov ? 'yes' : 'no'} · sha256 ${sha}`,
      `video: ${v.codec_name} ${v.profile} level ${v.level} · ${v.width}x${v.height} · ${v.pix_fmt} · ${v.r_frame_rate} fps · ${v.nb_read_frames} frames · ${v.color_space}/${v.color_transfer}/${v.color_primaries}/${v.color_range} · ${Math.round((v.bit_rate ?? 0) / 1000)} kb/s`,
      a ? `audio: ${a.codec_name} ${a.profile ?? ''} · ${a.sample_rate} Hz · ${a.channels} ch · ${Math.round((a.bit_rate ?? 0) / 1000)} kb/s` : 'audio: NONE');
    if (a) { const m = ebur128(file); loud.push(`${name}: integrated ${m.integratedLufs} LUFS · true peak ${m.truePeakDbtp} dBTP · LRA ${m.lraLu} LU (ebur128 on the encoded AAC)`); }
    // luma per frame (limited range: black is 16, white 235): the head and tail must be black, no frame white
    const ys = [...run('ffmpeg', ['-hide_banner', '-nostats', '-nostdin', '-i', file, '-vf', 'scale=320:-2,signalstats,metadata=mode=print:key=lavfi.signalstats.YAVG', '-an', '-f', 'null', '-'], { nice: true }).stderr.matchAll(/YAVG=([\d.]+)/g)].map((m) => Number(m[1]));
    const fps = Number(v.r_frame_rate.split('/')[0]) / Number(v.r_frame_rate.split('/')[1] ?? 1);
    const maxAt = ys.indexOf(Math.max(...ys));
    probe.push(`luma (YAVG, 16 = black, 235 = white) over ${ys.length} frames: first frame ${ys[0].toFixed(1)}, last frame ${ys.at(-1).toFixed(1)}, brightest ${ys[maxAt].toFixed(1)} at ${(maxAt / fps).toFixed(2)} s, frames above 200: ${ys.filter((y) => y > 200).length}`, '');
  }
  const poster = path.join(CUT, WEB.poster);
  if (existsSync(poster)) { const p = JSON.parse(run('ffprobe', ['-v', 'error', '-show_entries', 'stream=width,height,codec_name', '-of', 'json', poster], { nice: false }).stdout).streams[0]; probe.push(`## ${WEB.poster}`, `${p.codec_name} ${p.width}x${p.height} · ${bytes(poster)} B (limit ${WEB.posterMaxBytes})`, ''); }
  for (const kind of ['film', 'teaser']) {
    const f = path.join(WORK, 'audio', `${kind}-loudness.json`);
    if (!existsSync(f)) continue;
    const r = JSON.parse(readFileSync(f, 'utf8'));
    loud.push('', `${kind} mix (48 kHz, before AAC): loudnorm two-pass, target I ${r.target.I} LUFS, TP ${r.target.TP} dBTP, LRA ${r.target.LRA} LU`,
      `  pass 1 measured: input_i ${r.pass1.input_i} LUFS · input_tp ${r.pass1.input_tp} dBTP · input_lra ${r.pass1.input_lra} LU · input_thresh ${r.pass1.input_thresh} · target_offset ${r.pass1.target_offset}`,
      `  pass 2 (${r.pass2.normalization_type}): output_i ${r.pass2.output_i} LUFS · output_tp ${r.pass2.output_tp} dBTP · output_lra ${r.pass2.output_lra} LU`,
      `  ebur128 re-measure of the WAV: ${r.remeasured.integratedLufs} LUFS · ${r.remeasured.truePeakDbtp} dBTP · LRA ${r.remeasured.lraLu} LU`);
  }
  writeFileSync(path.join(outDir, 'ffprobe.txt'), `${probe.join('\n')}\n`);
  writeFileSync(path.join(outDir, 'loudness.txt'), `${loud.join('\n')}\n`);
  return { probe: probe.join('\n'), loud: loud.join('\n') };
}

// ---- main ----------------------------------------------------------------------------------------------------
const isMain = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname);
if (isMain) {
  const { values: args } = parseArgs({ options: { check: { type: 'boolean' }, cutlist: { type: 'string' }, evidence: { type: 'string' }, format: { type: 'string' }, beats: { type: 'string' }, 'no-export': { type: 'boolean' }, web: { type: 'boolean' }, teaser: { type: 'boolean' }, all: { type: 'boolean' } } });
  if (args.check || args.cutlist) {
    const list = cutList();
    if (args.cutlist) writeFileSync(args.cutlist, list.text);
    else process.stdout.write(list.text);
    console.error(`check: ${BEATS.length} beats, ${list.frames} frames (${(list.frames / FPS).toFixed(3)} s); ${list.problems.length ? `PROBLEMS ${list.problems.length}:\n  ${list.problems.join('\n  ')}` : 'every take, in-point and plate present, no HUD toggle inside a shot'}`);
    process.exit(list.problems.length ? 1 : 0);
  }
  const formats = args.all ? ['master', 'landscape', 'vertical'] : args.format ? args.format.split(',') : [];
  for (const f of formats) buildFormat(f, { beats: args.beats?.split(','), exportFilm: !args['no-export'] });
  if (args.all || args.web) buildWeb();
  if (args.all || args.teaser) buildTeaser();
  if (args.evidence) { const e = evidence(args.evidence); console.log(e.probe); console.log(e.loud); }
}
