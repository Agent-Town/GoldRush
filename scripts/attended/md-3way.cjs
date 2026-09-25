// md-3way.cjs <file> — resolve a conflicted append-style markdown file inside a git merge (cwd = the worktree):
//   sections keyed by "## " headings (the campaign report) and table rows keyed by "| <name> (<id>) |" (the status doc).
//   Rule per key: theirs (the lane) wins where the lane changed it against the merge base; ours (main) wins where only main changed it;
//   both changed = theirs, reported. Keys new on either side are kept (ours' new first, then theirs' new). Prose outside keys: ours.
const fs=require('fs');const {execSync}=require('child_process');const f=process.argv[2];if(!f)throw new Error('file');
const sh=(c)=>execSync(c,{encoding:'utf8'});const base=sh('git show :1:'+JSON.stringify(f));const ours=sh('git show :2:'+JSON.stringify(f));const theirs=sh('git show :3:'+JSON.stringify(f));
const isReport=/report\.md$/.test(f);
function split(t){ // returns {head, items:[{key,text}]} — items are sections (report) or rows (status doc)
  const lines=t.split('\n');const items=[];let head=[];let cur=null;
  for(const l of lines){let key=null;if(isReport){if(/^## /.test(l))key=l.trim();}else{const m=l.match(/^\| ([^|]+?) \|/);if(m&&!/^\| Map \|/.test(l)&&!/^\|-/.test(l))key=m[1].trim();}
    if(key!==null){if(isReport&&cur)items.push(cur);cur=isReport?{key,text:[l]}:{key,text:[l],row:true};if(!isReport){items.push(cur);cur=null;}continue;}
    if(isReport&&cur){cur.text.push(l);}else if(!isReport){head.push({line:l,after:items.length});}else head.push(l);}
  if(isReport&&cur)items.push(cur);return {head,items};}
const B=split(base),O=split(ours),T=split(theirs);const map=(s)=>new Map(s.items.map(i=>[i.key,i.text.join('\n')]));const bm=map(B),om=map(O),tm=map(T);
const keys=[...new Set([...B.items.map(i=>i.key),...O.items.map(i=>i.key),...T.items.map(i=>i.key)])];const notes=[];
const pick=(k)=>{const b=bm.get(k),o=om.get(k),t=tm.get(k);if(o===undefined&&t===undefined)return null;if(o===undefined)return t;if(t===undefined)return o;if(b===undefined){if(o===t)return o;notes.push('both added '+k+': theirs');return t;}
  const oc=o!==b,tc=t!==b;if(!tc)return o;if(!oc)return t;if(!isReport){const bc=b.split(' | '),occ=o.split(' | '),tcc=t.split(' | ');if(bc.length===occ.length&&occ.length===tcc.length){let ok=true;const merged=occ.map((oc2,i)=>{const b2=bc[i],t2=tcc[i];if(oc2===b2)return t2;if(t2===b2)return oc2;if(oc2.endsWith(b2))return oc2.slice(0,oc2.length-b2.length)+t2;if(oc2.startsWith(b2))return t2+oc2.slice(b2.length);ok=false;return t2;});if(ok){notes.push('both changed '+k+': composed (ours\' prefix/suffix around theirs\' cell)');return merged.join(' | ');}}}notes.push('both changed '+k+': theirs (main\'s edit dropped)');return t;};
let out;
if(isReport){const ordered=[...B.items.map(i=>i.key),...O.items.map(i=>i.key).filter(k=>!bm.has(k)),...T.items.map(i=>i.key).filter(k=>!bm.has(k)&&!om.has(k))];
  out=[O.head.join('\n'),...ordered.map(pick).filter(x=>x!==null)].join('\n').replace(/\s*$/,'\n');}
else{ // status doc: keep ours' non-row lines in place; rows by key in ours' order, then theirs' new rows appended after the last row
  const lines=ours.split('\n');const res=[];const seen=new Set();let lastRow=-1;
  for(const l of lines){const m=l.match(/^\| ([^|]+?) \|/);if(m&&!/^\| Map \|/.test(l)&&!/^\|-/.test(l)){const k=m[1].trim();seen.add(k);const v=pick(k);if(v!==null){res.push(v);lastRow=res.length-1;}}else res.push(l);}
  const extra=T.items.map(i=>i.key).filter(k=>!seen.has(k)).map(pick).filter(x=>x!==null);if(extra.length)res.splice(lastRow+1,0,...extra);out=res.join('\n');}
if(/^(<<<<<<<|=======|>>>>>>>)/m.test(out))throw new Error('markers left');fs.writeFileSync(f,out);console.log('md-3way '+f+': '+keys.length+' keys; '+(notes.length?notes.join('; '):'no double edits'));
