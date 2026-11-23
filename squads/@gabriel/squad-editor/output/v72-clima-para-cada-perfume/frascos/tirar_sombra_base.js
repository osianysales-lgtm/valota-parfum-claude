// corta a sombra que sai mais larga que o corpo embaixo do frasco: node tirar_sombra_base.js in out [frac_ref=0.8]
const sharp=require('sharp');const [inp,out,fr='0.8']=process.argv.slice(2);
(async()=>{const {data,info}=await sharp(inp).ensureAlpha().raw().toBuffer({resolveWithObject:true});const W=info.width,H=info.height;
const larg=y=>{let l=-1,r=-1;for(let x=0;x<W;x++)if(data[(y*W+x)*4+3]>128){if(l<0)l=x;r=x;}return [l,r];};
const [L0,R0]=larg(Math.round(H*+fr));let corte=H;
for(let y=Math.round(H*+fr);y<H;y++){const [l,r]=larg(y);if(l<0){corte=y;break;}if(l<L0-2||r>R0+2){corte=y;break;}}
// a partir do corte, a sombra: zera alfa das linhas de baixo
for(let y=corte;y<H;y++)for(let x=0;x<W;x++)data[(y*W+x)*4+3]=0;
// e fora das colunas do corpo nas últimas linhas
console.log('corpo',L0,R0,'corte na linha',corte,'de',H);
await sharp(data,{raw:{width:W,height:H,channels:4}}).trim().png().toFile(out);})();
