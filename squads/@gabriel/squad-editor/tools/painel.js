// PAINEL — monta folhas de imagens com textos (quadros por frase, storyboard do plano)
// Usa o Chrome do puppeteer para compor (o drawtext do ffmpeg do winget falha por fontconfig).
//
//   montarPaineis(itens, destinoBase, { titulo, modo: 'linhas'|'grade', porPagina, colunas })
//   itens: [{ cabecalho, texto, tags: [..], imagens: [{ src: 'arquivo.png', legenda: '1.2s' }] }]
//   → destinoBase_01.jpg, destinoBase_02.jpg ...  (devolve a lista de arquivos)

'use strict';
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const dataUrl = p => {
  if (!p || !fs.existsSync(p)) return null;
  const ext = path.extname(p).toLowerCase().replace('.', '');
  return `data:image/${ext === 'jpg' ? 'jpeg' : ext};base64,${fs.readFileSync(p).toString('base64')}`;
};

function html(itens, { titulo, modo, colunas, pagina, paginas }) {
  const css = `
    *{box-sizing:border-box} body{margin:0;background:#16181c;color:#eee;font:15px/1.35 Arial,Helvetica,sans-serif;padding:22px;width:${modo === 'grade' ? 300 * colunas + 44 : 1240}px}
    h1{font-size:20px;margin:0 0 14px;color:#fff} h1 small{color:#999;font-weight:normal}
    .linha{display:flex;gap:14px;background:#22252b;border-radius:10px;padding:12px;margin-bottom:12px}
    .info{flex:1;min-width:0} .cab{font-weight:bold;font-size:16px;color:#fff;margin-bottom:6px}
    .txt{color:#ddd;font-size:15px;margin-bottom:8px} .tags span{display:inline-block;background:#33373f;color:#cfe;border-radius:5px;padding:2px 7px;margin:0 5px 5px 0;font-size:13px}
    .tags span.k{background:#3d3420;color:#ffd77a} .tags span.alerta{background:#4a2323;color:#ffb3b3}
    .ims{display:flex;gap:8px} .im{width:200px;text-align:center;font-size:12px;color:#aaa} .im img{width:200px;border-radius:6px;display:block;background:#000}
    .grade{display:grid;grid-template-columns:repeat(${colunas},284px);gap:14px}
    .card{background:#22252b;border-radius:10px;padding:10px} .card img{width:264px;border-radius:6px;display:block;background:#000;margin-bottom:8px}
    .card .vazio{width:264px;height:470px;border-radius:6px;background:#0d0e10;display:flex;align-items:center;justify-content:center;color:#666;margin-bottom:8px;text-align:center;padding:20px}`;
  const tags = t => (t || []).map(x => typeof x === 'string' ? `<span>${esc(x)}</span>` : `<span class="${x.tipo || ''}">${esc(x.texto)}</span>`).join('');
  let corpo;
  if (modo === 'grade') {
    corpo = `<div class="grade">${itens.map(it => {
      const im = it.imagens?.[0] && dataUrl(it.imagens[0].src);
      return `<div class="card">${im ? `<img src="${im}">` : `<div class="vazio">${esc(it.semImagem || 'sem quadro')}</div>`}
        <div class="cab">${esc(it.cabecalho)}</div><div class="txt">${esc(it.texto)}</div><div class="tags">${tags(it.tags)}</div></div>`;
    }).join('')}</div>`;
  } else {
    corpo = itens.map(it => `<div class="linha"><div class="info"><div class="cab">${esc(it.cabecalho)}</div>
      <div class="txt">${esc(it.texto)}</div><div class="tags">${tags(it.tags)}</div></div>
      <div class="ims">${(it.imagens || []).map(i => { const d = dataUrl(i.src); return d ? `<div class="im"><img src="${d}">${esc(i.legenda)}</div>` : ''; }).join('')}</div></div>`).join('');
  }
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${css}</style></head><body>
    <h1>${esc(titulo)} ${paginas > 1 ? `<small>— página ${pagina}/${paginas}</small>` : ''}</h1>${corpo}</body></html>`;
}

async function montarPaineis(itens, destinoBase, { titulo = '', modo = 'linhas', porPagina = 5, colunas = 4 } = {}) {
  const puppeteer = require('puppeteer');
  const browser = await puppeteer.launch({
    headless: true, executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--allow-file-access-from-files'],
  });
  const saidas = [];
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1300, height: 800, deviceScaleFactor: 1 });
    const paginas = Math.max(1, Math.ceil(itens.length / porPagina));
    for (let p = 0; p < paginas; p++) {
      const fatia = itens.slice(p * porPagina, (p + 1) * porPagina);
      await page.setContent(html(fatia, { titulo, modo, colunas, pagina: p + 1, paginas }), { waitUntil: 'load' });
      const dest = paginas > 1 ? `${destinoBase}_${String(p + 1).padStart(2, '0')}.jpg` : `${destinoBase}.jpg`;
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      const el = await page.$('body');
      await el.screenshot({ path: dest, type: 'jpeg', quality: 82 });
      saidas.push(dest);
    }
  } finally { await browser.close(); }
  return saidas;
}

// Extrai um quadro de vídeo (png pequeno) — usado por quadros.js e plano.js
function extrairQuadro(ffmpeg, video, t, dest, largura = 270) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  const hdr = require('./cor').filtroHDR(video, ffmpeg);   // gravação HDR (iPhone): sem isso o quadro sai lavado
  const r = spawnSync(ffmpeg, ['-y', '-loglevel', 'error', '-ss', String(Math.max(0, t)), '-i', video, '-frames:v', '1', '-vf', `${hdr ? hdr + ',' : ''}scale=${largura}:-2`, dest], { encoding: 'utf8' });
  return r.status === 0 && fs.existsSync(dest) ? dest : null;
}

function ffmpegBin() {
  try { const a = require('./setup').ambiente(); if (a.ffmpeg && fs.existsSync(a.ffmpeg)) return a.ffmpeg; } catch {}
  const r = spawnSync(process.platform === 'win32' ? 'where' : 'which', ['ffmpeg'], { encoding: 'utf8' });
  const p = (r.stdout || '').split(/\r?\n/)[0].trim();
  return p && fs.existsSync(p) ? p : 'ffmpeg';
}

module.exports = { montarPaineis, extrairQuadro, ffmpegBin };
