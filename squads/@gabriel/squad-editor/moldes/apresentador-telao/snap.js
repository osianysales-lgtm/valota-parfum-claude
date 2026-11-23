// v62: tira quadros em tempos escolhidos → qa/q_<t>.png  (uso: node snap.js 1 5 9.2 ...)
const puppeteer=require('puppeteer'),path=require('path'),fs=require('fs');
const amb=JSON.parse(fs.readFileSync(path.join(__dirname,'../../.ambiente.json')));
(async()=>{const b=await puppeteer.launch({executablePath:amb.navegador,args:['--allow-file-access-from-files']});
 const p=await b.newPage();await p.setViewport({width:1080,height:1920});
 await p.goto('file://'+path.join(__dirname,'index.html'),{waitUntil:'networkidle0'});await p.evaluate(()=>document.fonts.ready);
 for(const t of process.argv.slice(2)){await p.evaluate(t=>{const v=document.querySelector('#avv');if(v&&v.readyState>0)v.currentTime=t;window.render(t)},+t);
  await new Promise(r=>setTimeout(r,250));await p.screenshot({path:path.join(__dirname,'qa',`q_${t}.png`)})}
 await b.close()})();
