// scripts/launch-video/cut/mix.mjs: the soundtrack of the launch film, per the treatment's cue sheet (edl.mjs CUES,
// and TEASER_CUES for the teaser), task launch-video-cut-3 scope 4. Sources are the game's own files in
// assets/audio/raw (the Pan Theme, the E1 frontier loop, the named stings and beds); nothing is generated, nothing is
// stock. Each cue is trimmed, gained, faded and placed sample-exact, the cues are summed without normalisation, and
// the sum is brought to -14 LUFS integrated with a two-pass loudnorm (true-peak ceiling -1.5 dBTP, so the AAC
// encode stays under the task's -1 dBTP); the measured values of both passes and an ebur128 re-measure are written
// beside the WAV. Usage: node scripts/launch-video/cut/mix.mjs [film|teaser]
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { isMain } from '../../is-main.mjs';
import { CUES, FILM_FRAMES, TEASER, TEASER_CUES } from './edl.mjs';
import { FPS, WORK, audioPath, ensureDir, run } from './lib.mjs';

const RATE = 48000;
export const TARGET = { I: -14, TP: -1.5, LRA: 20 };

function loudnormJson(stderr) {
  const m = stderr.match(/\{\s*"input_i"[\s\S]*?\}/);
  if (!m) throw new Error('mix: no loudnorm measurement in the ffmpeg output');
  return JSON.parse(m[0]);
}

export function ebur128(file) {
  const r = run('ffmpeg', ['-hide_banner', '-nostats', '-nostdin', '-i', file, '-map', '0:a', '-af', 'ebur128=peak=true:framelog=quiet', '-f', 'null', '-'], { nice: false });
  const s = r.stderr.slice(r.stderr.lastIndexOf('Summary:'));
  const num = (re) => Number(s.match(re)?.[1]);
  return { integratedLufs: num(/I:\s+(-?[\d.]+) LUFS/), lraLu: num(/LRA:\s+(-?[\d.]+) LU/), truePeakDbtp: num(/Peak:\s+(-?[\d.]+) dBFS/) };
}

export function buildMix(kind = 'film') {
  const cues = kind === 'teaser' ? TEASER_CUES : CUES;
  const seconds = (kind === 'teaser' ? TEASER.frames : FILM_FRAMES) / FPS;
  const dir = ensureDir(path.join(WORK, 'audio'));
  const premix = path.join(dir, `${kind}-premix.wav`);
  const wav = path.join(dir, `${kind}-mix.wav`);
  const args = [];
  const fc = [];
  cues.forEach((c, i) => {
    if (c.loop) args.push('-stream_loop', '-1');
    args.push('-i', audioPath(c.src));
    const len = c.loop ? c.to - c.at : c.to - c.from;
    fc.push(`[${i}:a]${[
      c.loop ? `atrim=0:${len.toFixed(4)}` : `atrim=${c.from.toFixed(4)}:${c.to.toFixed(4)}`,
      'asetpts=PTS-STARTPTS', `aresample=${RATE}`, 'aformat=sample_fmts=fltp:channel_layouts=stereo', `volume=${c.gain}dB`,
      c.fadeIn ? `afade=t=in:st=0:d=${c.fadeIn}` : '', c.fadeOut ? `afade=t=out:st=${(len - c.fadeOut).toFixed(4)}:d=${c.fadeOut}` : '',
      `adelay=delays=${Math.round(c.at * RATE)}S:all=1`,
    ].filter(Boolean).join(',')}[a${i}]`);
  });
  fc.push(`${cues.map((_, i) => `[a${i}]`).join('')}amix=inputs=${cues.length}:normalize=0:dropout_transition=0,apad,atrim=0:${seconds},asetpts=PTS-STARTPTS[m]`);
  run('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-nostdin', '-y', ...args, '-filter_complex', fc.join(';'), '-map', '[m]', '-c:a', 'pcm_f32le', '-ar', `${RATE}`, premix]);
  const target = `I=${TARGET.I}:TP=${TARGET.TP}:LRA=${TARGET.LRA}`;
  const pass1 = loudnormJson(run('ffmpeg', ['-hide_banner', '-nostats', '-nostdin', '-i', premix, '-af', `loudnorm=${target}:print_format=json`, '-f', 'null', '-']).stderr);
  const measured = `measured_I=${pass1.input_i}:measured_TP=${pass1.input_tp}:measured_LRA=${pass1.input_lra}:measured_thresh=${pass1.input_thresh}:offset=${pass1.target_offset}`;
  const pass2 = loudnormJson(run('ffmpeg', ['-hide_banner', '-nostats', '-nostdin', '-y', '-i', premix, '-af', `loudnorm=${target}:${measured}:linear=true:print_format=json,aresample=${RATE}`, '-c:a', 'pcm_s24le', '-ar', `${RATE}`, wav]).stderr);
  const result = { kind, seconds, target: TARGET, pass1, pass2, remeasured: ebur128(wav), cues: cues.map((c) => c.what) };
  writeFileSync(path.join(dir, `${kind}-loudness.json`), `${JSON.stringify(result, null, 2)}\n`);
  return { wav, ...result };
}

// scripts/is-main.test.mjs test 9: the entry-point question is answered by the shared helper, never by a hand-rolled argv[1] compare.
if (isMain(import.meta.url)) {
  const r = buildMix(process.argv[2] ?? 'film');
  console.log(`mix: ${r.kind} ${r.seconds} s -> ${r.wav}; pass 1 I ${r.pass1.input_i} LUFS, TP ${r.pass1.input_tp} dBTP, LRA ${r.pass1.input_lra}; pass 2 ${r.pass2.normalization_type}, out I ${r.pass2.output_i}, TP ${r.pass2.output_tp}; ebur128 I ${r.remeasured.integratedLufs} LUFS, TP ${r.remeasured.truePeakDbtp} dBTP, LRA ${r.remeasured.lraLu} LU`);
}
