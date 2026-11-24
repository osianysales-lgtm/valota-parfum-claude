// Máscara geométrica do Club de Nuit Elite (tampa prateada some no fundo branco → recorte por cor serrilha)
// Coordenadas medidas direto em ../frascos-orig/elite-f.png (602x1038)
const sharp=require('/Users/osianysales/Downloads/ClaudCode/squads/@gabriel/squad-editor/node_modules/sharp');
(async()=>{const W=602,H=1038;
const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><g fill="#fff">
<rect x="175" y="110" width="253" height="185" rx="5"/>
<rect x="208" y="290" width="180" height="20"/>
<rect x="177.5" y="306" width="241" height="40" rx="3"/>
<path d="M 53 372 Q 53 353 72 352 L 150 347 L 450 347 L 531 352 Q 550 353 550.5 372 L 550.5 953 Q 550.5 967.5 536 967.5 L 67 967.5 Q 52.5 967.5 52.5 953 Z"/></g></svg>`;
const m=await sharp(Buffer.from(svg)).extractChannel(0).raw().toBuffer();
const src=await sharp('../frascos-orig/elite-f.png').removeAlpha().raw().toBuffer();
const o=Buffer.alloc(W*H*4);for(let i=0;i<W*H;i++){o[i*4]=src[i*3];o[i*4+1]=src[i*3+1];o[i*4+2]=src[i*3+2];o[i*4+3]=m[i]}
await sharp(o,{raw:{width:W,height:H,channels:4}}).trim({threshold:1}).png().toFile('elite.png');console.log('ok')})();
