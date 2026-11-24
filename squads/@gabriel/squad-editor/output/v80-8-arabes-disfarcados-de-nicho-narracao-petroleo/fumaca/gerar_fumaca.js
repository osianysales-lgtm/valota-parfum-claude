// máscaras de fumaça (feTurbulence, igual ao v73): fumaca_a.png e fumaca_b.png
const fs=require('fs'),path=require('path'),puppeteer=require(path.join(__dirname,'../../../node_modules/puppeteer'));
const amb=JSON.parse(fs.readFileSync(path.join(__dirname,'../../../.ambiente.json')));
(async()=>{const b=await puppeteer.launch({executablePath:amb.navegador});const pg=await b.newPage();
for(const [nome,seed,freq] of [['fumaca_a',3,0.0021],['fumaca_b',11,0.0028]]){await pg.setViewport({width:1200,height:1000});
await pg.setContent(`<body style="margin:0;background:transparent"><svg width="1200" height="1000"><filter id="f"><feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="5" seed="${seed}"/>
<feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 4 -1.55"/></filter>
<radialGradient id="g"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
<mask id="m"><rect width="1200" height="1000" fill="url(#g)"/></mask><rect width="1200" height="1000" filter="url(#f)" mask="url(#m)"/></svg></body>`);
await pg.screenshot({path:path.join(__dirname,nome+'.png'),omitBackground:true})}await b.close();console.log('fumaça ok')})();
