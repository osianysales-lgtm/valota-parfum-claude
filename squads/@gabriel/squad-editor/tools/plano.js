// PLANO + STORYBOARD + APROVAÇÃO — o "portão" obrigatório antes de qualquer render
//
// Nenhum vídeo é renderizado sem um plano aprovado pelo usuário. A Dafne e o Salsicha
// conferem a aprovação e se recusam a renderizar se ela não existir ou se o plano
// (ou os cortes/camadas) mudou depois de aprovado.
//
// Uso:
//   node tools/plano.js preparar   output/vN/plano.json   valida, completa e gera plano.md + storyboard.jpg
//   node tools/plano.js storyboard output/vN/plano.json   só refaz o storyboard
//   node tools/plano.js aprovar    output/vN/plano.json [--nota "texto"]   SÓ depois do "aprovado" do usuário
//   node tools/plano.js status     output/vN/plano.json
//
// Estrutura do plano.json (caminhos relativos à pasta do plano):
// {
//   "tipo": "motion" | "gravado" | "hibrido",
//   "titulo": "Reels ANI02",
//   "referencia": "o que veio da referência (ritmo, layout, estilo)",
//   "ficha": "ficha.json",
//   "significado": "significado.json",
//   "analise": "analise.json",            // gravado/híbrido: para achar os vídeos dos clipes
//   "cortes": "cortes.json",              // gravado/híbrido
//   "camadas": "camadas.json",            // híbrido (opcional)
//   "legenda": { "usar": true, "destaque": "chave", "palavras_chave": [] },   // vazio → vem do significado
//   "cenas": [
//     { "id": "s1", "inicio": 0, "fim": 3.2, "fala": "Imagina um vídeo...", "ideia": "IA grava sozinha",
//       "layout": "pessoa" | "cheia" | "topo" | "sobreposta",
//       "visual": "o que aparece na tela", "movimento": "como entra/sai",
//       "quadro": { "clipe": 1, "t": 1.2, "zoom": 1.08 } | { "video": "x.mp4", "t": 1.2 } | { "html": "../../animacoes/a.html", "t": 1.5 }
//                 (layout "topo": pode ter html + clipe → o storyboard monta a tela dividida)
//     }
//   ],
//   "encerramento": "descrição do CTA final",
//   "audio": { "narracao": "narracao.mp3", "trilha": "trilha.mp3", "efeitos": "whoosh nas transições, pop nas palavras-chave" } | "sem áudio",
//   "aprovacao": { ... preenchido por "aprovar" — nunca à mão ... }
// }

'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawnSync } = require('child_process');

const lerJSON = p => JSON.parse(fs.readFileSync(p, 'utf8').replace(/^﻿/, ''));
const canon = v => Array.isArray(v) ? `[${v.map(canon).join(',')}]`
  : v && typeof v === 'object' ? `{${Object.keys(v).sort().map(k => JSON.stringify(k) + ':' + canon(v[k])).join(',')}}`
  : JSON.stringify(v);
const rel = (plano, p) => p ? path.resolve(path.dirname(plano), p) : null;

// O que a aprovação cobre: o plano (sem o bloco de aprovação) + cortes + camadas
function impressao(planoPath) {
  const p = lerJSON(planoPath);
  delete p.aprovacao;
  let s = canon(p);
  for (const k of ['cortes', 'camadas']) {
    const f = rel(planoPath, p[k]);
    if (f && fs.existsSync(f)) s += '|' + k + ':' + canon(lerJSON(f));
  }
  return crypto.createHash('sha1').update(s).digest('hex').slice(0, 16);
}

/** Usado pela Dafne e pelo Salsicha. Devolve { ok, motivo, plano }. */
function verificar(planoPath) {
  if (!planoPath || !fs.existsSync(planoPath)) {
    return { ok: false, motivo: 'Nenhum plano encontrado (plano.json na pasta de saída ou --plano). Monte o plano, mostre o storyboard ao usuário e aprove antes de renderizar.' };
  }
  const p = lerJSON(planoPath);
  if (!p.aprovacao || p.aprovacao.aprovado !== true) {
    return { ok: false, plano: planoPath, motivo: `Plano ainda NÃO aprovado (${planoPath}). Mostre plano.md + storyboard ao usuário e só rode "node tools/plano.js aprovar" depois do ok dele.` };
  }
  if (p.aprovacao.impressao !== impressao(planoPath)) {
    return { ok: false, plano: planoPath, motivo: 'O plano, os cortes ou as camadas MUDARAM depois da aprovação. Mostre a mudança ao usuário e aprove de novo.' };
  }
  return { ok: true, plano: planoPath };
}

/** Procura plano.json na pasta indicada e na pasta-mãe (ex.: output/vN/temp → output/vN). */
function acharPlano(dir) {
  for (let d = path.resolve(dir), i = 0; i < 3; i++, d = path.dirname(d)) {
    const c = path.join(d, 'plano.json');
    if (fs.existsSync(c)) return c;
  }
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
const LAYOUTS = ['pessoa', 'cheia', 'topo', 'sobreposta'];

function validar(planoPath) {
  const p = lerJSON(planoPath);
  const erros = [], avisos = [];
  if (!['motion', 'gravado', 'hibrido'].includes(p.tipo)) erros.push('"tipo" deve ser motion, gravado ou hibrido');
  if (!Array.isArray(p.cenas) || !p.cenas.length) erros.push('"cenas" vazio');
  if (p.tipo !== 'motion' && !p.cortes) erros.push('gravado/híbrido precisa de "cortes"');
  for (const k of ['ficha', 'significado', 'analise', 'cortes', 'camadas']) {
    const f = rel(planoPath, p[k]); if (p[k] && !fs.existsSync(f)) erros.push(`arquivo de "${k}" não existe: ${p[k]}`);
  }
  let fimAnt = 0;
  (p.cenas || []).forEach((c, i) => {
    const id = c.id || `cena ${i + 1}`;
    if (!(c.fim > c.inicio)) erros.push(`${id}: tempos inválidos`);
    if (!c.visual) erros.push(`${id}: "visual" vazio`);
    if (c.layout && !LAYOUTS.includes(c.layout)) erros.push(`${id}: layout "${c.layout}" (use ${LAYOUTS.join(', ')})`);
    const d = c.fim - c.inicio;
    if (c.layout !== 'pessoa' && d > 4.5 && i < p.cenas.length - 1) avisos.push(`${id}: ${d.toFixed(1)}s com a mesma tela de motion — a tela muda quando a ideia muda (2–4 s por cena)`);
    if (c.inicio < fimAnt - 0.05) avisos.push(`${id}: começa antes do fim da cena anterior`);
    if (!c.quadro) avisos.push(`${id}: sem "quadro" — o storyboard mostra um card vazio`);
    fimAnt = c.fim;
  });
  if (!p.encerramento) avisos.push('Sem "encerramento" (CTA final) descrito.');
  if (!p.audio) avisos.push('Áudio não definido ("audio": narração, trilha e efeitos — ou "sem áudio"). Confirme com o usuário antes de aprovar: vídeo sem som só com resposta clara.');
  // confere com a duração do vídeo editado (simulado ou real), quando existir
  const te = path.join(path.dirname(planoPath), 'transcricao_editada.json');
  if (p.tipo !== 'motion' && fs.existsSync(te)) {
    const dur = lerJSON(te).duracao;
    const ult = (p.cenas || [])[p.cenas.length - 1];
    if (ult && Math.abs(ult.fim - dur) > 0.3) avisos.push(`A última cena termina em ${ult.fim.toFixed(1)}s, mas o vídeo editado tem ${dur.toFixed(1)}s — refaça os tempos com --simular.`);
    const cam = rel(planoPath, p.camadas);
    if (cam && fs.existsSync(cam)) for (const c of (lerJSON(cam).camadas || [])) {
      if (c.fim > dur + 0.05) erros.push(`camada ${path.basename(c.arquivo)} termina em ${c.fim}s, depois do fim do vídeo (${dur.toFixed(2)}s)`);
      else if (c.layout === 'cheia' && c.legenda === false && dur - c.fim > 0.05 && dur - c.fim < 1.5) avisos.push(`encerramento ${path.basename(c.arquivo)} termina ${(dur - c.fim).toFixed(2)}s antes do fim — a pessoa reaparece no final. Use fim = ${dur.toFixed(2)}.`);
    }
  }
  return { p, erros, avisos };
}

function completarLegenda(planoPath, p) {
  p.legenda = p.legenda || { usar: true, destaque: 'chave' };
  if ((!p.legenda.palavras_chave || !p.legenda.palavras_chave.length) && p.significado) {
    const s = lerJSON(rel(planoPath, p.significado));
    p.legenda.palavras_chave = [...new Set(s.frases.filter(f => f.manter !== false).flatMap(f => f.palavras_chave || []))];
  }
  return p;
}

function tabelaMD(p) {
  const l = [`# Plano — ${p.titulo || p.tipo}`, '', `**Tipo:** ${p.tipo}`];
  if (p.referencia) l.push(`**Referência:** ${p.referencia}`);
  const dur = p.cenas.length ? p.cenas[p.cenas.length - 1].fim : 0;
  l.push(`**Duração estimada:** ${dur.toFixed(1)}s · **Cenas:** ${p.cenas.length}`);
  if (p.legenda?.usar !== false) l.push(`**Legenda:** destaque "${p.legenda?.destaque || 'falada'}"${p.legenda?.palavras_chave?.length ? ' · palavras-chave: ' + p.legenda.palavras_chave.join(', ') : ''}`);
  l.push('', '| cena | tempo | fala | ideia | tela | visual / movimento |', '|---|---|---|---|---|---|');
  for (const c of p.cenas) l.push(`| ${c.id} | ${c.inicio.toFixed(1)}–${c.fim.toFixed(1)}s | ${c.fala || '—'} | ${c.ideia || '—'} | ${c.layout || '—'} | ${c.visual}${c.movimento ? ' · ' + c.movimento : ''} |`);
  if (p.audio) l.push('', `**Áudio:** ${typeof p.audio === 'string' ? p.audio : [p.audio.narracao && 'narração: ' + path.basename(p.audio.narracao), p.audio.trilha && 'trilha: ' + path.basename(p.audio.trilha), p.audio.efeitos && 'efeitos: ' + p.audio.efeitos].filter(Boolean).join(' · ')}`);
  else l.push('', '**Áudio:** ⚠ não definido');
  if (p.encerramento) l.push('', `**Encerramento:** ${p.encerramento}`);
  const a = p.aprovacao;
  l.push('', a?.aprovado ? `**Aprovado em ${a.em}**${a.nota ? ' — ' + a.nota : ''}` : '**Status:** aguardando aprovação');
  return l.join('\n') + '\n';
}

// ─────────────────────────────────────────────────────────────────────────────
// Storyboard: 1 quadro por cena
// ─────────────────────────────────────────────────────────────────────────────
async function storyboard(planoPath) {
  const { montarPaineis, extrairQuadro, ffmpegBin } = require('./painel');
  const FF = ffmpegBin();
  const p = lerJSON(planoPath);
  const dir = path.dirname(planoPath);
  const tmp = path.join(dir, '.storyboard_tmp');
  fs.rmSync(tmp, { recursive: true, force: true });
  fs.mkdirSync(tmp, { recursive: true });

  // vídeos dos clipes (gravado/híbrido)
  const clipes = {};
  if (p.analise) lerJSON(rel(planoPath, p.analise)).clipes.forEach((c, i) => {
    clipes[c.indice || i + 1] = [c.normalizadoPath, c.arquivo].filter(Boolean).find(f => fs.existsSync(f));
  });

  // stills de motion: agrupa por HTML e pede à Dafne (modo --quadros, não é render)
  const porHtml = {};
  for (const c of p.cenas) if (c.quadro?.html) {
    const h = rel(planoPath, c.quadro.html);
    const alt = c.layout === 'topo' ? 960 : 1920;
    const alfa = c.layout === 'sobreposta' ? 'a' : '';
    const k = [h, alt, alfa, JSON.stringify(c.quadro.params || null)].join('|');
    (porHtml[k] = porHtml[k] || []).push(c);
  }
  const still = {};
  for (const [chave, cenas] of Object.entries(porHtml)) {
    const [h, alt, alfa, params] = chave.split('|');
    if (!fs.existsSync(h)) { console.warn(`[Plano] HTML não encontrado: ${h}`); continue; }
    const ts = cenas.map(c => c.quadro.t_html ?? c.quadro.t ?? 0.5);
    const pref = path.join(tmp, path.basename(h, '.html') + '_' + Object.keys(still).length + '_' + cenas[0].id);
    const args = [path.join(__dirname, '..', 'daphne.js'), h, String(Math.max(...ts) + 0.1), '--quadros', ts.join(','), '--out', pref, '--altura', alt];
    if (p.ficha) args.push('--ficha', rel(planoPath, p.ficha));
    if (alfa) args.push('--alpha');
    if (params !== 'null') args.push('--params', params);
    const r = spawnSync(process.execPath, args, { encoding: 'utf8' });
    if (r.status !== 0) console.warn(`[Plano] Dafne (quadros) falhou para ${path.basename(h)}:\n${(r.stderr || r.stdout || '').slice(-400)}`);
    cenas.forEach((c, i) => { const f = `${pref}_q${ts[i].toFixed(2)}.png`; if (fs.existsSync(f)) still[c.id] = f; });
  }

  const itens = [];
  for (const c of p.cenas) {
    const q = c.quadro || {};
    let img = null;
    const vid = q.video ? rel(planoPath, q.video) : (q.clipe != null ? clipes[q.clipe] : null);
    let pessoa = vid ? extrairQuadro(FF, vid, q.t ?? 0, path.join(tmp, `${c.id}_p.png`), 270) : null;
    if (pessoa && q.zoom > 1.001) { // mostra o enquadramento com zoom/ênfase (mesmo recorte do Salsicha: terço superior)
      const z = path.join(tmp, `${c.id}_z.png`);
      const r = spawnSync(FF, ['-y', '-loglevel', 'error', '-i', pessoa, '-vf', `crop=iw/${q.zoom}:ih/${q.zoom}:(iw-iw/${q.zoom})/2:(ih-ih/${q.zoom})*0.30,scale=270:-2`, z]);
      if (r.status === 0) pessoa = z;
    }
    if (c.layout === 'topo' && still[c.id] && pessoa) {
      // tela dividida: motion em cima, pessoa (faixa do rosto) embaixo
      const dest = path.join(tmp, `${c.id}_topo.png`);
      const r = spawnSync(FF, ['-y', '-loglevel', 'error', '-i', still[c.id], '-i', pessoa, '-filter_complex',
        '[0:v]scale=270:240,setsar=1[a];[1:v]scale=270:-2,crop=270:240:0:ih*0.14,setsar=1[b];[a][b]vstack', dest]);
      img = r.status === 0 ? dest : still[c.id];
    } else if (c.layout === 'sobreposta' && still[c.id] && pessoa) {
      // elemento transparente por cima da pessoa
      const dest = path.join(tmp, `${c.id}_sob.png`);
      const r = spawnSync(FF, ['-y', '-loglevel', 'error', '-i', pessoa, '-i', still[c.id], '-filter_complex',
        '[1:v]scale=270:-2[o];[0:v][o]overlay=0:0', dest]);
      img = r.status === 0 ? dest : still[c.id];
    } else img = still[c.id] || pessoa;
    const tags = [];
    if (c.layout) tags.push(c.layout);
    if (c.ideia) tags.push({ texto: c.ideia, tipo: 'k' });
    itens.push({
      cabecalho: `${c.id} · ${c.inicio.toFixed(1)}–${c.fim.toFixed(1)}s`,
      texto: `${c.fala ? '“' + c.fala + '”  →  ' : ''}${c.visual}${c.movimento ? ' (' + c.movimento + ')' : ''}`,
      tags, imagens: img ? [{ src: img }] : [], semImagem: c.visual,
    });
  }
  const arquivos = await montarPaineis(itens, path.join(dir, 'storyboard'), { titulo: `Storyboard — ${p.titulo || p.tipo}`, modo: 'grade', porPagina: 8, colunas: 4 });
  fs.rmSync(tmp, { recursive: true, force: true });
  return arquivos;
}

// ─────────────────────────────────────────────────────────────────────────────
async function cli() {
  const [cmd, alvo, ...resto] = process.argv.slice(2);
  const opt = {}; for (let i = 0; i < resto.length; i++) if (resto[i].startsWith('--')) opt[resto[i].slice(2)] = resto[i + 1] && !resto[i + 1].startsWith('--') ? resto[++i] : true;
  if (!cmd || !alvo) { console.log('Uso: node tools/plano.js preparar|storyboard|aprovar|status <plano.json> (ver cabeçalho do arquivo)'); process.exit(1); }
  const planoPath = path.resolve(alvo);
  if (!fs.existsSync(planoPath)) { console.error(`[Plano] Não encontrado: ${planoPath}`); process.exit(1); }

  if (cmd === 'preparar' || cmd === 'storyboard') {
    try { require('./setup').garantir(['pacotes', 'ffmpeg']); } catch (e) { console.error('[Plano] ' + e.message); process.exit(1); }
    if (cmd === 'preparar') {
      const v = validar(planoPath);
      if (v.erros.length) { console.log(`\n## Erros (${v.erros.length})\n` + v.erros.map(e => '- ' + e).join('\n')); process.exit(2); }
      let p = completarLegenda(planoPath, v.p);
      fs.writeFileSync(planoPath, JSON.stringify(p, null, 2), 'utf8');
      if (p.aprovacao?.aprovado && !verificar(planoPath).ok) {
        delete p.aprovacao; fs.writeFileSync(planoPath, JSON.stringify(p, null, 2), 'utf8');
        console.log('[Plano] O plano mudou depois da aprovação — a aprovação anterior foi removida.');
      }
      fs.writeFileSync(planoPath.replace(/\.json$/i, '.md'), tabelaMD(p), 'utf8');
      console.log(`[Plano] ${p.cenas.length} cenas · plano.md atualizado`);
      if (v.avisos.length) console.log(`\n## Avisos (${v.avisos.length})\n` + v.avisos.map(e => '- ' + e).join('\n') + '\n');
    }
    const arqs = await storyboard(planoPath);
    console.log('[Plano] Storyboard:'); arqs.forEach(a => console.log('  ' + a));
    console.log('\n[Plano] PRÓXIMO PASSO: mostre plano.md + storyboard ao usuário e PERGUNTE se aprova. Não renderize antes.');
  } else if (cmd === 'aprovar') {
    const v = validar(planoPath);
    if (v.erros.length) { console.error('[Plano] Plano com erros — rode "preparar" antes.'); process.exit(2); }
    const p = v.p;
    p.aprovacao = { aprovado: true, em: new Date().toISOString(), nota: opt.nota || '', impressao: impressao(planoPath) };
    fs.writeFileSync(planoPath, JSON.stringify(p, null, 2), 'utf8');
    fs.writeFileSync(planoPath.replace(/\.json$/i, '.md'), tabelaMD(p), 'utf8');
    console.log(`[Plano] Aprovado (${p.aprovacao.em}). Render liberado enquanto plano, cortes e camadas não mudarem.`);
  } else if (cmd === 'status') {
    const r = verificar(planoPath);
    console.log(r.ok ? '[Plano] Aprovado — render liberado.' : '[Plano] ' + r.motivo);
    process.exit(r.ok ? 0 : 3);
  } else { console.error('Comando desconhecido: ' + cmd); process.exit(1); }
}

module.exports = { verificar, acharPlano, impressao };
if (require.main === module) cli().catch(e => { console.error('[Plano] ERRO: ' + e.message); process.exit(1); });
