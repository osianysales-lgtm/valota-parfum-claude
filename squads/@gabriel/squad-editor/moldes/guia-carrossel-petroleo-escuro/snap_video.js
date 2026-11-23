const puppeteer=require('puppeteer'),path=require('path'),fs=require('fs');
const amb=JSON.parse(fs.readFileSync('/Users/osianysales/Downloads/ClaudCode/squads/@gabriel/squad-editor/.ambiente.json'));
(async()=>{const b=await puppeteer.launch({executablePath:amb.navegador,args:['--allow-file-access-from-files']});
const p=await b.newPage();await p.setViewport({width:1080,height:1920});
await p.goto('file://'+path.join(__dirname,'capa.html'),{waitUntil:'networkidle0'});await p.evaluate(()=>document.fonts.ready);
await p.screenshot({path:path.join(__dirname,process.argv[2]||'capa.png')});await b.close()})();
