import { createServer } from 'vite';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
const root='artifacts/sol/map-art-campaign-2/run-10/code-presentation';
const overrides=new Map([['world','Scatter'],['world','RailPath'],['game','Game']].map(([folder,name])=>[resolve(`src/${folder}/${name}.ts`),readFileSync(`${root}/baseline-${name}.ts`,'utf8')]));
const server=await createServer({server:{port:5312,strictPort:true},plugins:[{name:'preflight-source-control',enforce:'pre',transform(code,id){return overrides.get(id.split('?')[0])}}]});
await server.listen();server.printUrls();
