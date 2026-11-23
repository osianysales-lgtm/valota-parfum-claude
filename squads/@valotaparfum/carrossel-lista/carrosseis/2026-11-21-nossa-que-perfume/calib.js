// calibra tamanho da letra sobrepondo texto vermelho na referência
const puppeteer=require('/Users/osianysales/Downloads/ClaudCode/squads/@gabriel/squad-editor/node_modules/puppeteer');
const fs=require('fs'),path=require('path');const A=__dirname;
const font='data:font/ttf;base64,'+fs.readFileSync(A+'/fonts/BreeSerif-Regular.ttf').toString('base64');
const [ref,html,out]=process.argv.slice(2);
(async()=>{
 const b=await puppeteer.launch({headless:'new',executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
 const p=await b.newPage(); await p.setViewport({width:1080,height:1350});
 const bg='data:image/jpeg;base64,'+fs.readFileSync(ref).toString('base64');
 await p.setContent(`<style>@font-face{font-family:Bree;src:url(${font})}body{margin:0;width:1080px;height:1350px;background:url(${bg});position:relative;font-family:Bree}.t{position:absolute;left:0;right:0;text-align:center;color:rgba(255,0,0,.55)}</style>${html}`);
 await p.evaluate(()=>document.fonts.ready); await p.screenshot({path:out}); await b.close();
})();
