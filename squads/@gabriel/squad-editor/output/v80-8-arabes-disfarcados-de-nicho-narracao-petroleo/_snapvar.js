const puppeteer=require('puppeteer'),path=require('path'),fs=require('fs'),sharp=require('sharp');
const amb=JSON.parse(fs.readFileSync(path.join(__dirname,'../../.ambiente.json')));
(async()=>{const b=await puppeteer.launch({executablePath:amb.navegador,args:['--allow-file-access-from-files']});const p=await b.newPage();await p.setViewport({width:1080,height:1920});
const comp=[];const ks=['A','B','C'];for(let i=0;i<3;i++){await p.goto('file://'+path.join(__dirname,`_var${ks[i]}.html`),{waitUntil:'networkidle0'});await p.evaluate(()=>document.fonts.ready);await new Promise(r=>setTimeout(r,200));
const f=path.join(__dirname,`_var${ks[i]}.png`);await p.screenshot({path:f});
comp.push({input:await sharp(f).extract({left:0,top:240,width:1080,height:1440}).resize({width:540}).toBuffer(),left:i*560,top:60});
comp.push({input:Buffer.from(`<svg width="540" height="60"><text x="270" y="42" font-size="36" font-family="Arial" font-weight="bold" fill="#fff" text-anchor="middle">${ks[i]}</text></svg>`),left:i*560,top:0})}
await b.close();await sharp({create:{width:1660,height:780,channels:3,background:'#444'}}).composite(comp).jpeg({quality:90}).toFile(path.join(__dirname,'_opcoes_de_nicho.jpg'));console.log('ok')})();
