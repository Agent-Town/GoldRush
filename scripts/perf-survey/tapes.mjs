import {parseArgs} from 'node:util';
import {read,write} from './browser.mjs';
const {values}=parseArgs({options:{origin:{type:'string',default:'https://agenttown.app'}}});
const inventory=await read('inventory.json'),rows=[];
for(const map of inventory.maps){
 const query=new URLSearchParams({epoch:map.epochId,contract:map.id});const url=`${values.origin}/api/standings?${query}`;
 const row={map:map.id,url};
 try{
  const response=await fetch(url,{signal:AbortSignal.timeout(10000)});row.status=response.status;const data=await response.json();
  const scan=x=>Array.isArray(x)?x.flatMap(scan):x&&typeof x==='object'?[...(x.reel?.id?[x.reel.id]:[]),...Object.values(x).flatMap(scan)]:[];
  const ids=[...new Set(scan(data))];row.reels=ids;row.board=data;
  if(ids.length){const reelUrl=`${url}&reel=${encodeURIComponent(ids[0])}`;const r=await fetch(reelUrl,{signal:AbortSignal.timeout(10000)});const body=await r.json();row.reelStatus=r.status;if(body.reel){row.tapePath=`tapes/county-${map.id}.json`;await write(row.tapePath,body.reel);}}
 }catch(e){row.error=String(e);}
 rows.push(row);await write('county-tapes.json',{at:new Date().toISOString(),origin:values.origin,rows});console.log(`${map.id}: HTTP ${row.status} reels=${row.reels?.length??0} ${row.error??''}`);
}
