import fs from 'node:fs';
import {runBattery} from "file:///Users/robin/Claude/Projects/Gold%20Rush/scripts/gate-battery.mjs";
const result=runBattery([['E1 build','npm','run','build'],['E1 payload','node','scripts/first-town-payload.mjs'],['evidence budget','node','scripts/evidence-budget.mjs',"075e97b6c5b9b3a4dc95221dc1b10f94c45a0cc6",'HEAD']],{cwd:"/Users/robin/.goldrush/s2747/wt-aif1",env:{PATH:'/opt/homebrew/bin:'+process.env.PATH,GR_RELEASE:'e1'},transcript:"/Users/robin/Claude/Projects/Gold Rush/artifacts/s2747/candidate-static.txt",label:'s2747 E1 build and evidence'});
fs.writeFileSync("/Users/robin/Claude/Projects/Gold Rush/artifacts/s2747/candidate-release-result.json",JSON.stringify(result,null,2));process.exitCode=result.overall;
