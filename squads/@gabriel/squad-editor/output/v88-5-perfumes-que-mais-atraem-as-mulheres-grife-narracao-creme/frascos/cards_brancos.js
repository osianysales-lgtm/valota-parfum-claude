// Card branco sem recorte: apara o branco em volta, deixa margem e grava frascos/cards/<nome>.jpg + ar.json (largura/altura)
const sharp=require('../../../node_modules/sharp'),fs=require('fs'),path=require('path');
(async()=>{const d=process.argv[2];const ar={};
for(const f of fs.readdirSync(d+'/frascos/entrada')){const n=f.replace(/\.\w+$/,'');
 const b=await sharp(d+'/frascos/entrada/'+f).flatten({background:'#fff'}).trim({threshold:18}).toBuffer({resolveWithObject:true});
 const {width:w,height:h}=b.info;const m=Math.round(Math.max(w,h)*0.06);
 const o=await sharp(b.data).extend({top:m,bottom:m,left:m,right:m,background:'#fff'}).resize({height:900,withoutEnlargement:false}).jpeg({quality:93}).toFile(d+'/frascos/cards/'+n+'.jpg');
 ar[n]=+(o.width/o.height).toFixed(4);}
fs.writeFileSync(d+'/frascos/ar.json',JSON.stringify(ar));console.log(ar);})();
