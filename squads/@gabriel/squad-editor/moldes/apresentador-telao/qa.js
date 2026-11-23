// v62: QA de encaixe — varre a cada 0,2 s: fora da área, fora do centro (sem par simétrico), elementos colados/batendo (<10 px)
const puppeteer=require('puppeteer'),path=require('path'),fs=require('fs');
const amb=JSON.parse(fs.readFileSync(path.join(__dirname,'../../.ambiente.json')));
(async()=>{const b=await puppeteer.launch({executablePath:amb.navegador,args:['--allow-file-access-from-files']});
 const p=await b.newPage();await p.setViewport({width:1080,height:1920});
 await p.goto('file://'+path.join(__dirname,'index.html'),{waitUntil:'networkidle0'});await p.evaluate(()=>document.fonts.ready);
 const r=await p.evaluate(()=>{const out=new Map(),END=window.D.END,GAP=10;
  const bbox=el=>{const rs=[];const w=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);let nd;while(nd=w.nextNode()){if(!nd.textContent.trim())continue;const rg=document.createRange();rg.selectNodeContents(nd);rs.push(...rg.getClientRects())}
   [el,...el.querySelectorAll('*')].forEach(x=>{const cs=getComputedStyle(x);if(x.tagName==='svg'||cs.backgroundImage!=='none'||cs.backgroundColor!=='rgba(0, 0, 0, 0)'||parseFloat(cs.borderTopWidth)>0)rs.push(x.getBoundingClientRect())});
   let a=1e9,b=1e9,c=-1e9,d=-1e9;for(const q of rs){if(q.width<2||q.height<2)continue;a=Math.min(a,q.left);b=Math.min(b,q.top);c=Math.max(c,q.right);d=Math.max(d,q.bottom)}return c<a?null:{x0:a,y0:b,x1:c,y1:d}};
  const nome=o=>(o.d.innerText||o.d.innerHTML).replace(/\s+/g,' ').slice(0,28);
  for(let t=0;t<END;t+=0.2){window.render(t);
   const ok=o=>!['big','spray','nevoa','voa','walk'].includes(o.fx)&&!o.nq;
   const mexendo=o=>(o.mv&&t>=o.mv[0]-0.05&&t<o.mv[0]+0.5)||(o.row!=null&&window.__L.some(x=>x.row===o.row&&t>=x.t0&&t<x.t0+0.45));
   const todos=window.__L.filter(o=>ok(o)&&t>=o.t0&&t<o.t1).map(o=>({o,r:bbox(o.d)})).filter(v=>v.r);
   const vis=todos.filter(v=>t>=v.o.t0+0.5&&t<v.o.t1-0.25&&!mexendo(v.o));
   const add=(k)=>{if(!out.has(k))out.set(k,t.toFixed(1))};
   for(const v of vis){const r=v.r,cx=(r.x0+r.x1)/2;
    if(r.x0<60||r.x1>1020||r.y0<36||r.y1>1140)add(`FORA DA ÁREA: "${nome(v.o)}" x${r.x0|0}–${r.x1|0} y${r.y0|0}–${r.y1|0}`);
    if(Math.abs(cx-540)>8&&!todos.some(w=>w!==v&&Math.abs((w.r.x0+w.r.x1)/2+cx-1080)<=14))add(`FORA DO CENTRO: "${nome(v.o)}" centro ${cx|0}`);}
   for(let i=0;i<vis.length;i++)for(let j=i+1;j<vis.length;j++){const a=vis[i],c=vis[j];if(a.o.sobre||c.o.sobre)continue;
    const A=a.r,B=c.r;if(A.x0<B.x1+GAP&&B.x0<A.x1+GAP&&A.y0<B.y1+GAP&&B.y0<A.y1+GAP)add(`COLADO: "${nome(a.o)}" × "${nome(c.o)}"`);}
  }return [...out].map(([k,t])=>`${t}s  ${k}`)});
 console.log(r.length?'PROBLEMAS:\n'+r.join('\n'):'QA OK');await b.close()})();
