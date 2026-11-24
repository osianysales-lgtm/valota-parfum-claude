// folha de conferência AMPLIADA no fundo petróleo: node folha.js saida.jpg pasta nome1 nome2 ...
const sharp=require('/Users/osianysales/Downloads/ClaudCode/squads/@gabriel/squad-editor/node_modules/sharp');
(async()=>{const [out,dir,...L]=process.argv.slice(2);const comp=[];const cols=Math.min(4,L.length);
for(let i=0;i<L.length;i++){const b=await sharp(`${dir}/${L[i]}.png`).trim({threshold:2}).resize({height:900}).png().toBuffer();const m=await sharp(b).metadata();
comp.push({input:b,left:(i%cols)*520+Math.max(0,Math.round((520-m.width)/2)),top:Math.floor(i/cols)*960+30})}
await sharp({create:{width:cols*520,height:Math.ceil(L.length/cols)*960,channels:3,background:'#0F2E33'}}).composite(comp).jpeg({quality:92}).toFile(out)})();
