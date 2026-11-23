const path=require('path');const puppeteer=require(path.join(__dirname,'../../node_modules/puppeteer'));
(async()=>{const b=await puppeteer.launch({args:['--allow-file-access-from-files']});const pg=await b.newPage();await pg.setViewport({width:1080,height:1920});
for(const [q,out] of [['m=capa','capa'],['m=capa&g=1','capa_guias'],['m=item','item1']]){await pg.goto('file://'+path.join(__dirname,'previa.html')+'?'+q,{waitUntil:'networkidle0'});await pg.evaluate(()=>document.fonts.ready);await new Promise(r=>setTimeout(r,300));await pg.screenshot({path:path.join(__dirname,'tmp',out+'.png')})}
await b.close()})();
