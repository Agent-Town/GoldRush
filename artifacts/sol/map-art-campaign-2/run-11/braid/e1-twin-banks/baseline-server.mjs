// Exact pre-task renderer source transported through the current Vite dependency URLs.
import http from 'node:http';
import {readFileSync} from 'node:fs';
const out='artifacts/sol/map-art-campaign-2/run-11/braid/e1-twin-banks';
const upstream='http://127.0.0.1:5188';
const dependencyVersion=(await(await fetch(upstream+'/src/world/Terrain.ts')).text()).match(/three\.js(\?v=[^"]+)/)[1];
const transport=source=>source.replace(/(\/node_modules\/\.vite\/deps\/[^"\s?]+)\?v=[a-f0-9]+/g,'$1'+dependencyVersion);
const server=http.createServer(async(req,res)=>{
 try{
  const url=new URL(req.url,upstream), name=/^\/src\/world\/(Terrain|Terrain3dClaimPilot)\.ts$/.exec(url.pathname)?.[1];
  if(name){res.writeHead(200,{'Content-Type':'application/javascript'});res.end(transport(readFileSync(`${out}/baseline-${name}.js`,'utf8')));return}
  const response=await fetch(url);res.writeHead(response.status,{'Content-Type':response.headers.get('content-type')??'application/octet-stream'});res.end(Buffer.from(await response.arrayBuffer()));
 }catch(e){res.writeHead(502);res.end(String(e))}
});
server.listen(5193,'127.0.0.1',()=>console.log('baseline renderer at http://127.0.0.1:5193'));
