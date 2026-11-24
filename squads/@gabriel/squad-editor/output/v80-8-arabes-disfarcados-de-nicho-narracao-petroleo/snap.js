// quadros do vídeo em tempos escolhidos → _q/q<t>.png + storyboard _sb.jpg (prévia em tela inteira)
const puppeteer=require('puppeteer'),path=require('path'),fs=require('fs'),sharp=require('sharp');
const amb=JSON.parse(fs.readFileSync(path.join(__dirname,'../../.ambiente.json')));
(async()=>{const ts=process.argv.slice(2).map(Number);const Q=path.join(__dirname,'_q');fs.mkdirSync(Q,{recursive:true});
const b=await puppeteer.launch({executablePath:amb.navegador,args:['--allow-file-access-from-files']});const p=await b.newPage();await p.setViewport({width:1080,height:1920});
await p.goto('file://'+path.join(__dirname,'index.html'),{waitUntil:'networkidle0'});await p.evaluate(()=>document.fonts.ready);
const files=[];for(const t of ts){await p.evaluate(t=>window.render(t),t);await new Promise(r=>setTimeout(r,120));const f=path.join(Q,`q${t.toFixed(2)}.png`);await p.screenshot({path:f});files.push(f)}
await b.close();const W=360,H=640,cols=Math.min(5,files.length),rows=Math.ceil(files.length/cols);
const comp=await Promise.all(files.map(async(f,i)=>({input:await sharp(f).resize(W,H).toBuffer(),left:(i%cols)*(W+10),top:Math.floor(i/cols)*(H+10)})));
await sharp({create:{width:cols*(W+10),height:rows*(H+10),channels:3,background:'#333'}}).composite(comp).jpeg({quality:85}).toFile(path.join(__dirname,'_sb.jpg'));console.log('ok',files.length)})();
