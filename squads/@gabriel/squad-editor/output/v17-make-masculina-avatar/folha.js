const sharp = require('../../node_modules/sharp'); const fs=require('fs'); const path=require('path');
(async()=>{ const fs_=fs.readdirSync('fotos').filter(f=>f.endsWith('.png')); const W=300,H=420; const comp=[];
for(const [i,f] of fs_.entries()){ const b=await sharp('fotos/'+f).resize({width:W-20,height:H-60,fit:'inside'}).png().toBuffer();
 const m=await sharp(b).metadata(); comp.push({input:b,left:(i%5)*W+Math.round((W-m.width)/2),top:Math.floor(i/5)*H+10});
 comp.push({input:Buffer.from(`<svg width="${W}" height="40"><text x="${W/2}" y="28" font-size="24" text-anchor="middle" fill="#F2E8D8" font-family="Arial">${f} ${(await sharp('fotos/'+f).metadata()).width}x${(await sharp('fotos/'+f).metadata()).height}</text></svg>`),left:(i%5)*W,top:Math.floor(i/5)*H+H-45}); }
await sharp({create:{width:W*5,height:H*Math.ceil(fs_.length/5),channels:4,background:'#0F2E33'}}).composite(comp).jpeg().toFile('qa/folha_fotos.jpg'); console.log(fs_);})();
