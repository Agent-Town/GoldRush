import fs from 'node:fs';
import { PNG } from 'pngjs';
const T='/private/tmp/claude-501/-Users-robin-Claude-Projects-Gold-Rush/fe6b8d27-b064-40eb-934b-1d29d57a71db/scratchpad/ztmp';
for (const f of fs.readdirSync(T)) {
  const buf=fs.readFileSync(T+'/'+f);
  const bd=buf[24], ct=buf[25];
  let off=8; const ch=[];
  while(off<buf.length){const len=buf.readUInt32BE(off);const type=buf.toString('ascii',off+4,off+8);ch.push(`${type}:${len}`);off+=12+len;}
  const p=PNG.sync.read(buf);
  console.log(f, 'bitdepth',bd,'colourtype',ct,'size',buf.length,'chunks',ch.join(' '),'px0',p.data[0],p.data[1],p.data[2],p.data[3]);
}
