// recorta frasco OPACO em fundo branco liso: flood fill do branco a partir das bordas + borda suavizada
// uso: node recortar_branco.js entrada.jpg saida.png [tolerancia=22]
const sharp=require('/Users/osianysales/Downloads/ClaudCode/squads/@gabriel/squad-editor/node_modules/sharp');
(async()=>{const [,,inp,out,tl]=process.argv;const TOL=+(tl||22);
const {data,info}=await sharp(inp).removeAlpha().raw().toBuffer({resolveWithObject:true});const {width:W,height:H}=info;
const bg=new Uint8Array(W*H),q=[];const isW=i=>255-Math.min(data[i*3],data[i*3+1],data[i*3+2])<=TOL;
for(let x=0;x<W;x++){q.push(x,(H-1)*W+x)}for(let y=0;y<H;y++){q.push(y*W,y*W+W-1)}
while(q.length){const i=q.pop();if(bg[i]||!isW(i))continue;bg[i]=1;const x=i%W,y=(i/W)|0;if(x>0)q.push(i-1);if(x<W-1)q.push(i+1);if(y>0)q.push(i-W);if(y<H-1)q.push(i+W)}
let a=Buffer.alloc(W*H);for(let i=0;i<W*H;i++)a[i]=bg[i]?0:255;
// encolhe 1 px e suaviza
a=await sharp(a,{raw:{width:W,height:H,channels:1}}).blur(1.2).linear(1.25,-40).extractChannel(0).raw().toBuffer();
const rgba=Buffer.alloc(W*H*4);for(let i=0;i<W*H;i++){rgba[i*4]=data[i*3];rgba[i*4+1]=data[i*3+1];rgba[i*4+2]=data[i*3+2];rgba[i*4+3]=a[i]}
await sharp(rgba,{raw:{width:W,height:H,channels:4}}).trim({threshold:1}).png().toFile(out);console.log('ok',out)})();
