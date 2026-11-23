// node snap.js [t1,t2,...] → tmp/quadros/*.png + tmp/storyboard.jpg (tela inteira, com avatar)
const path=require('path');const puppeteer=require(path.join(__dirname,'../../node_modules/puppeteer'));const sharp=require(path.join(__dirname,'../../node_modules/sharp'));const fs=require('fs');
const TS=(process.argv[2]||'0.5,6.6,10.6,12.5,16.0,18.9,21.8,22.9,25.0,27.1,29.0,31.0,34.6,38.95,41.6,44.2').split(',').map(Number);
(async()=>{const b=await puppeteer.launch({args:['--allow-file-access-from-files']});const pg=await b.newPage();await pg.setViewport({width:1080,height:1920});
await pg.goto('file://'+path.join(__dirname,'index.html'),{waitUntil:'networkidle0'});await pg.evaluate(()=>document.fonts.ready);
const Q=path.join(__dirname,'tmp','quadros');fs.mkdirSync(Q,{recursive:true});const comp=[];const W=270,H=480,C=8;
for(const [k,t] of TS.entries()){await pg.evaluate(t=>render(t),t);await new Promise(r=>setTimeout(r,120));const f=path.join(Q,`q_${t.toFixed(2)}.png`);await pg.screenshot({path:f});
 comp.push({input:await sharp(f).resize(W).toBuffer(),left:(k%C)*(W+10),top:Math.floor(k/C)*(H+40)+30});
 comp.push({input:Buffer.from(`<svg width="${W}" height="30"><text x="4" y="22" font-size="22" font-family="Arial" fill="#000">${t.toFixed(1)} s</text></svg>`),left:(k%C)*(W+10),top:Math.floor(k/C)*(H+40)});}
await b.close();const rows=Math.ceil(TS.length/C);
await sharp({create:{width:C*(W+10),height:rows*(H+40),channels:3,background:'#fff'}}).composite(comp).jpeg({quality:88}).toFile(path.join(__dirname,'tmp','storyboard.jpg'));})();
