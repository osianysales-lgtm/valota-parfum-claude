// ANÁLISE DE QUADROS POR FRASE — o que aparece na imagem enquanto cada frase é dita
//
// Gera folhas com o texto de cada frase e os quadros ao lado: 1 quadro (meio da frase) nas frases comuns e 3 (começo,
// meio, fim) nas que pedem comparação — regravação/suspeita ou --completo. Menos imagens = Fred lê as folhas mais rápido.
// O Fred/Velma abrem as folhas com o Read e anotam em significado.json, campo "imagem":
//   - take: olho fechado, olhar perdido, mão na frente do rosto, cabeça cortada, fora de foco, energia baixa
//   - gestos e objetos: aponta para cima, mostra o celular, conta nos dedos → momento para zoom/elemento
//
// Uso:
//   node tools/quadros.js --significado output/vN/significado.json --analise output/vN/analise.json --out output/vN/quadros
//   node tools/quadros.js --significado output/vN/significado_editado.json --video output/vN/video.mp4 --out output/vN/quadros
//   --todas     inclui frases com "manter": false (padrão: todas no 1º passe, quando "manter" ainda está vazio)
//   --completo  3 quadros em TODAS as frases (use se o take/enquadramento muda muito dentro das frases)

'use strict';
const fs = require('fs');
const path = require('path');
const { montarPaineis, extrairQuadro, ffmpegBin } = require('./painel');

const argv = process.argv.slice(2);
const opt = {};
for (let i = 0; i < argv.length; i++) if (argv[i].startsWith('--')) {
  const k = argv[i].slice(2);
  opt[k] = (i + 1 < argv.length && !argv[i + 1].startsWith('--')) ? argv[++i] : true;
}
const lerJSON = p => JSON.parse(fs.readFileSync(p, 'utf8').replace(/^﻿/, ''));

(async () => {
  try { require('./setup').garantir(['pacotes', 'ffmpeg']); } catch (e) { console.error('[Quadros] ' + e.message); process.exit(1); }
  if (!opt.significado || !(opt.analise || opt.video)) {
    console.error('Uso: node tools/quadros.js --significado sig.json (--analise analise.json | --video video.mp4) --out pasta');
    process.exit(1);
  }
  const sig = lerJSON(opt.significado);
  const out = path.resolve(opt.out || path.join(path.dirname(opt.significado), 'quadros'));
  const tmp = path.join(out, '.png');
  const FF = ffmpegBin();

  let videoDe;
  if (opt.video) { const v = path.resolve(opt.video); videoDe = () => v; }
  else {
    const a = lerJSON(opt.analise);
    const mapa = {};
    a.clipes.forEach((c, i) => {
      const cand = [c.normalizadoPath, c.arquivo].filter(Boolean).find(p => fs.existsSync(p));
      mapa[c.indice || i + 1] = cand;
    });
    videoDe = f => mapa[f.clipe];
  }

  const frases = sig.frases.filter(f => opt.todas || f.manter !== false);
  const itens = [];
  for (const f of frases) {
    const v = videoDe(f);
    if (!v) { console.warn(`[Quadros] ${f.id}: vídeo do clipe ${f.clipe} não encontrado`); continue; }
    const d = f.fim - f.inicio;
    const tres = opt.completo || !!f.suspeita;
    const ts = tres ? [f.inicio + Math.min(0.15, d / 4), (f.inicio + f.fim) / 2, f.fim - Math.min(0.15, d / 4)] : [(f.inicio + f.fim) / 2];
    const imagens = ts.map((t, k) => ({ src: extrairQuadro(FF, v, t, path.join(tmp, `${f.id}_${k}.png`), 200), legenda: `${t.toFixed(2)}s` }));
    const tags = [];
    if (f.funcao) tags.push(f.funcao);
    (f.palavras_chave || []).forEach(k => tags.push({ texto: k, tipo: 'k' }));
    if (f.suspeita) tags.push({ texto: f.suspeita, tipo: 'alerta' });
    if (f.manter === false) tags.push({ texto: 'fora do corte', tipo: 'alerta' });
    itens.push({ cabecalho: `${f.id}  ·  ${f.clipe != null ? 'clipe ' + f.clipe + '  ·  ' : ''}${f.inicio.toFixed(2)}–${f.fim.toFixed(2)}s`, texto: f.texto, tags, imagens });
  }
  // frases comuns: grade de 8 por folha (1 quadro grande cada); frases para comparar: linhas com 3 quadros
  const comparar = itens.filter(i => i.imagens.length > 1), comuns = itens.filter(i => i.imagens.length <= 1);
  const titulo = `Quadros por frase — ${path.basename(opt.significado)}`;
  const arquivos = [];
  if (comuns.length) arquivos.push(...await montarPaineis(comuns, path.join(out, 'quadros'), { titulo, modo: 'grade', colunas: 4, porPagina: 8 }));
  if (comparar.length) arquivos.push(...await montarPaineis(comparar, path.join(out, 'quadros_comparar'), { titulo: titulo + ' — comparar takes', modo: 'linhas', porPagina: 5 }));
  fs.rmSync(tmp, { recursive: true, force: true });
  console.log(`[Quadros] ${itens.length} frases (${comparar.length} para comparar takes, com 3 quadros) em ${arquivos.length} folha(s):`);
  arquivos.forEach(a => console.log('  ' + a));
  console.log('[Quadros] Abra cada folha e anote em significado.json → "imagem" (take bom/ruim, gesto, objeto).');
})().catch(e => { console.error('[Quadros] ERRO: ' + e.message); process.exit(1); });
