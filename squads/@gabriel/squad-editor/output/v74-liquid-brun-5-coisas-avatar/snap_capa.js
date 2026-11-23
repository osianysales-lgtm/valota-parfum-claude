const path=require('path');const puppeteer=require(path.join(__dirname,'../../node_modules/puppeteer'));const sharp=require(path.join(__dirname,'../../node_modules/sharp'));
(async()=>{const b=await puppeteer.launch({args:['--allow-file-access-from-files']});const pg=await b.newPage();await pg.setViewport({width:1080,height:1920});
const T=path.join(__dirname,'tmp');const parts=[];
for(const v of ['A','B']){await pg.goto('file://'+path.join(__dirname,'capa.html')+'?v='+v,{waitUntil:'networkidle0'});await pg.evaluate(()=>document.fonts.ready);await new Promise(r=>setTimeout(r,300));
 await pg.screenshot({path:path.join(T,'capa_'+v+'.png')});}
await b.close();
const comp=[];let x=0;
for(const v of ['A','B']){comp.push({input:await sharp(path.join(T,'capa_'+v+'.png')).resize(540).toBuffer(),left:x,top:0});x+=560;
 comp.push({input:await sharp(path.join(T,'capa_'+v+'.png')).extract({left:0,top:240,width:1080,height:1440}).resize(405).toBuffer(),left:x,top:0});x+=445;}
await sharp({create:{width:x,height:960,channels:3,background:'#ffffff'}}).composite(comp).jpeg({quality:90}).toFile(path.join(T,'capas_AB.jpg'));})();
