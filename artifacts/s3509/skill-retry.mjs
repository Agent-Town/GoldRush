import fs from 'node:fs';
import {spawn} from 'node:child_process';
const start=Date.now();const fd=fs.openSync('artifacts/s3509/skillmd-tests.txt','a');
const command=['--test','--test-concurrency=1','scripts/skillmd-guard.test.mjs'];
const child=spawn('/Users/robin/.nvm/versions/node/v26.4.0/bin/node',command,{env:{...process.env,DEVELOPER_DIR:'/Library/Developer/CommandLineTools',PATH:'/Users/robin/.nvm/versions/node/v26.4.0/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin'},stdio:['ignore',fd,fd]});
child.on('close',(code,signal)=>{fs.closeSync(fd);const result={code,signal,seconds:(Date.now()-start)/1000,command,at:new Date().toISOString(),premise:'Explicit documented runtime PATH and DEVELOPER_DIR; serialized scheduling; test assertions and child timeout unchanged'};fs.writeFileSync('artifacts/s3509/skill-result.json',JSON.stringify(result,null,2));console.log(result);process.exitCode=code??1;});
