// TRANSCRIÇÃO COM SIGNIFICADO — divide a fala em frases com tempo e prepara o significado.json
//
// O script faz a parte mecânica (frases + tempos + suspeitas de regravação).
// O Fred preenche o significado de cada frase (função, ideia, palavras-chave, visual, manter).
//
// Uso:
//   node tools/frases.js --analise output/vN/analise.json   --out output/vN/significado.json   (gravado, antes do corte)
//   node tools/frases.js --editada output/vN/transcricao_editada.json --out ...           (vídeo já cortado)
//   node tools/frases.js --roteiro roteiro.txt [--ritmo 2.6] --out ...                     (motion sem gravação)
//
//   --referencia roteiro.txt   (com --analise) marca quanto de cada frase está no roteiro escrito;
//                              frases fora do roteiro viram candidatas a sair (improviso, erro, regravação)
//
//   node tools/frases.js --validar output/vN/significado.json
//        confere se todas as frases foram preenchidas e mostra o resumo
//   node tools/frases.js --cortes output/vN/significado.json --out output/vN/cortes.json
//        gera cortes.json a partir das frases com "manter": true (na ordem de "ordem", se houver)
//
// Campos que o Fred preenche em cada frase:
//   funcao        gancho | contexto | problema | passo | prova | dado | exemplo | virada | cta | repeticao | enrolacao
//   ideia         a ideia em poucas palavras ("IA gera o vídeo sozinha")
//   palavras_chave  1 a 3 palavras/expressões DA PRÓPRIA FALA que carregam a ideia (viram destaque na legenda)
//   visual        o conceito visual que explica a frase (ver dicionário na Velma): "fila de pedidos chegando"
//   manter        true/false (gravado: entra no corte?)
//   ordem         opcional: posição no vídeo final (para trazer um gancho do meio para o começo)

'use strict';
const fs = require('fs');
const path = require('path');

const argv = process.argv.slice(2);
const opt = {};
for (let i = 0; i < argv.length; i++) if (argv[i].startsWith('--')) {
  const k = argv[i].slice(2);
  opt[k] = (i + 1 < argv.length && !argv[i + 1].startsWith('--')) ? argv[++i] : true;
}
const lerJSON = p => JSON.parse(fs.readFileSync(p, 'utf8').replace(/^﻿/, ''));
const r2 = x => Math.round(x * 100) / 100;
const norm = s => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\w%]+/g, ' ').trim();

const PAUSA_FRASE = 0.6;   // pausa que separa frases mesmo sem pontuação
const VIRGULA_APOS = 10;  // frase longa: quebra na próxima vírgula
const MAX_PALAVRAS = 26;  // limite duro

function dividir(palavras, prefixo, clipe) {
  const frases = [];
  let atual = [];
  const fechar = () => {
    if (!atual.length) return;
    frases.push({
      id: `${prefixo}f${frases.length + 1}`,
      ...(clipe != null ? { clipe } : {}),
      inicio: r2(atual[0].start), fim: r2(atual[atual.length - 1].end),
      texto: atual.map(w => String(w.word).trim()).join(' ').replace(/\s+([,.!?;:])/g, '$1'),
      funcao: '', ideia: '', palavras_chave: [], visual: '', manter: null,
    });
    atual = [];
  };
  palavras.forEach((w, i) => {
    const prox = palavras[i + 1];
    atual.push(w);
    const txt = String(w.word).trim();
    const fimPont = /[.!?…]["”']?$/.test(txt);
    const virgula = /[,;:]$/.test(txt) && atual.length >= VIRGULA_APOS;
    const pausa = prox ? prox.start - w.end : 0;
    if (fimPont || virgula || pausa > PAUSA_FRASE || atual.length >= MAX_PALAVRAS) fechar();
  });
  fechar();
  return frases;
}

// Frases muito parecidas (o take refeito): sugere qual provavelmente sobra
function marcarRegravacoes(frases) {
  const toks = frases.map(f => new Set(norm(f.texto).split(' ').filter(t => t.length > 2)));
  for (let i = 0; i < frases.length; i++) for (let j = i + 1; j < frases.length; j++) {
    const a = toks[i], b = toks[j];
    if (a.size < 3 || b.size < 3) continue;
    const inter = [...a].filter(t => b.has(t)).length;
    const sim = inter / Math.min(a.size, b.size);
    if (sim >= 0.6) {
      frases[i].suspeita = `parecida com ${frases[j].id} (${Math.round(sim * 100)}%) — confira se é regravação (take mais antigo)`;
      frases[j].suspeita = frases[j].suspeita || `parecida com ${frases[i].id} (${Math.round(sim * 100)}%) — confira se é regravação (take mais recente)`;
    }
  }
}

function tabela(sig) {
  const l = [`# Significado — ${sig.fonte}`, '',
    '| id | tempo | fala | função | ideia | palavras-chave | visual | manter |',
    '|---|---|---|---|---|---|---|---|'];
  for (const f of sig.frases) l.push(`| ${f.id} | ${f.clipe != null ? 'c' + f.clipe + ' ' : ''}${f.inicio.toFixed(2)}–${f.fim.toFixed(2)} | ${f.texto}${f.suspeita ? ' ⚠ ' + f.suspeita : ''} | ${f.funcao || '—'} | ${f.ideia || '—'} | ${(f.palavras_chave || []).join(', ') || '—'} | ${f.visual || '—'} | ${f.manter == null ? '—' : f.manter ? 'sim' : 'não'} |`);
  return l.join('\n') + '\n';
}

function salvar(sig, out) {
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify(sig, null, 2), 'utf8');
  fs.writeFileSync(out.replace(/\.json$/i, '.md'), tabela(sig), 'utf8');
  console.log(`[Frases] ${sig.frases.length} frases → ${out} (+ ${path.basename(out.replace(/\.json$/i, '.md'))})`);
  const sus = sig.frases.filter(f => f.suspeita).length;
  if (sus) console.log(`[Frases] ${sus} frase(s) parecidas entre si (prováveis regravações) — marcadas com "suspeita".`);
}

const FUNCOES = ['gancho', 'contexto', 'problema', 'passo', 'prova', 'dado', 'exemplo', 'virada', 'cta', 'repeticao', 'enrolacao'];

function validar(p) {
  const sig = lerJSON(p);
  const erros = [], avisos = [];
  const gravado = sig.tipo === 'gravado';
  for (const f of sig.frases) {
    if (!FUNCOES.includes(f.funcao)) erros.push(`${f.id}: "funcao" vazia ou inválida (${FUNCOES.join(', ')})`);
    if (!f.ideia) erros.push(`${f.id}: "ideia" vazia`);
    if (gravado && typeof f.manter !== 'boolean') erros.push(`${f.id}: "manter" precisa ser true ou false`);
    const mantida = !gravado || f.manter;
    if (mantida && !['repeticao', 'enrolacao'].includes(f.funcao)) {
      if (!f.visual) avisos.push(`${f.id}: sem "visual" (o que mostrar enquanto essa frase é dita?)`);
      for (const k of f.palavras_chave || []) if (!norm(f.texto).includes(norm(k))) erros.push(`${f.id}: palavra-chave "${k}" não aparece na fala`);
      for (const k of f.palavras_chave || []) if (String(k).length > 16) avisos.push(`${f.id}: palavra-chave "${k}" longa (${String(k).length} letras) — na legenda pode quebrar em 2 linhas; prefira 1–2 palavras`);
    }
    if (gravado && f.manter && ['repeticao', 'enrolacao'].includes(f.funcao)) avisos.push(`${f.id}: marcada como ${f.funcao} mas "manter": true`);
  }
  const mantidas = sig.frases.filter(f => !gravado || f.manter);
  if (!mantidas.some(f => f.funcao === 'gancho')) avisos.push('Nenhuma frase mantida é "gancho". O vídeo precisa abrir com um.');
  const primeira = [...mantidas].sort((a, b) => (a.ordem ?? 1e9) - (b.ordem ?? 1e9))[0];
  if (primeira && primeira.funcao !== 'gancho') avisos.push(`O vídeo começa com "${primeira.funcao}" (${primeira.id}), não com o gancho. Use "ordem" se o gancho estiver no meio.`);
  if (!mantidas.some(f => f.funcao === 'cta')) avisos.push('Nenhuma frase de CTA mantida.');
  const dur = fs => fs.reduce((s, f) => s + (f.fim - f.inicio), 0);
  console.log(`\n# Validação — ${path.basename(p)}`);
  if (gravado) console.log(`- Mantidas: ${mantidas.length}/${sig.frases.length} frases | fala mantida ≈ ${dur(mantidas).toFixed(1)}s (cortada ≈ ${(dur(sig.frases) - dur(mantidas)).toFixed(1)}s)`);
  const cont = {}; mantidas.forEach(f => { cont[f.funcao] = (cont[f.funcao] || 0) + 1; });
  console.log('- Funções: ' + Object.entries(cont).map(([k, v]) => `${k} ${v}`).join(' · '));
  console.log(`\n## Erros (${erros.length})\n` + (erros.map(e => '- ' + e).join('\n') || '- nenhum'));
  console.log(`\n## Avisos (${avisos.length})\n` + (avisos.map(e => '- ' + e).join('\n') || '- nenhum'));
  fs.writeFileSync(p.replace(/\.json$/i, '.md'), tabela(sig), 'utf8');
  process.exit(erros.length ? 2 : 0);
}

function gerarCortes(p, out) {
  const sig = lerJSON(p);
  const PAD_I = 0.12, PAD_F = 0.2;
  const mantidas = sig.frases.map((f, i) => ({ ...f, _i: i })).filter(f => f.manter)
    .sort((a, b) => (a.ordem ?? 1e9) - (b.ordem ?? 1e9) || a._i - b._i);
  const cortes = [];
  for (const f of mantidas) {
    const ult = cortes[cortes.length - 1];
    // frases seguidas do mesmo clipe viram um corte só (o Salsicha ainda tira pausas internas)
    if (ult && ult.clipe === f.clipe && ult._ultimoI === f._i - 1) {
      ult.fim = r2(f.fim + PAD_F); ult.frases.push(f.id); ult._ultimoI = f._i;
    } else cortes.push({ clipe: f.clipe, inicio: r2(Math.max(0, f.inicio - PAD_I)), fim: r2(f.fim + PAD_F), frases: [f.id], nota: f.funcao, _ultimoI: f._i });
  }
  cortes.forEach(c => { delete c._ultimoI; c.nota = c.nota + ' — ' + c.frases.join(','); });
  fs.writeFileSync(out, JSON.stringify({ origem: path.basename(p), cortes }, null, 2), 'utf8');
  console.log(`[Frases] ${cortes.length} corte(s) a partir de ${mantidas.length} frase(s) mantidas → ${out}`);
  console.log('[Frases] Confira e acrescente "zoom"/"enfases" em cada corte antes do plano.');
}

// ─────────────────────────────────────────────────────────────────────────────
if (opt.validar) validar(path.resolve(opt.validar));
else if (opt.cortes) {
  if (!opt.out) { console.error('Use --out output/vN/cortes.json'); process.exit(1); }
  gerarCortes(path.resolve(opt.cortes), path.resolve(opt.out));
} else {
  const out = path.resolve(opt.out || 'significado.json');
  let sig;
  if (opt.analise) {
    const a = lerJSON(opt.analise);
    const frases = [];
    a.clipes.forEach((c, i) => {
      const n = c.indice || i + 1;
      const pal = (c.transcricao?.segments || []).flatMap(s => s.words || []);
      frases.push(...dividir(pal, `c${n}`, n));
    });
    marcarRegravacoes(frases);
    if (opt.referencia) {
      // cobertura por pares de palavras: quanto da frase aparece, na mesma ordem, no roteiro escrito
      const ref = norm(fs.readFileSync(opt.referencia, 'utf8').replace(/^\uFEFF/, '')).split(' ').filter(Boolean);
      const pares = new Set(ref.slice(1).map((w, i) => ref[i] + ' ' + w));
      for (const f of frases) {
        const ws = norm(f.texto).split(' ').filter(Boolean);
        const ps = ws.slice(1).map((w, i) => ws[i] + ' ' + w);
        const cob = ps.length ? ps.filter(p => pares.has(p)).length / ps.length : (ref.includes(ws[0]) ? 1 : 0);
        f.no_roteiro = Math.round(cob * 100) / 100;
        if (cob < 0.5) f.suspeita = (f.suspeita ? f.suspeita + '; ' : '') + `fora do roteiro (${Math.round(cob * 100)}%) — improviso, erro ou sobra?`;
      }
    }
    sig = { fonte: path.basename(opt.analise), tipo: 'gravado', tempos: 'segundos de cada clipe original', frases };
  } else if (opt.editada) {
    const e = lerJSON(opt.editada);
    const frases = dividir(e.palavras || [], 'e');
    sig = { fonte: path.basename(opt.editada), tipo: 'editado', tempos: 'segundos do vídeo editado', limites: e.limites || [], frases };
  } else if (opt.roteiro) {
    const ritmo = parseFloat(opt.ritmo || '2.6'); // palavras por segundo (fala natural em PT-BR)
    const txt = fs.readFileSync(opt.roteiro, 'utf8').replace(/^﻿/, '');
    let t = 0;
    const pal = txt.split(/\s+/).filter(Boolean).map(w => { const d = Math.max(0.18, w.length * 0.055) * (2.6 / ritmo); const o = { word: w, start: t, end: t + d }; t += d + 0.04; if (/[.!?]$/.test(w)) t += 0.35; return o; });
    sig = { fonte: path.basename(opt.roteiro), tipo: 'roteiro', tempos: `estimados (${ritmo} palavras/s) — ajuste ao narrar/gravar`, frases: dividir(pal, 'r') };
  } else {
    console.error('Use --analise, --editada ou --roteiro (ou --validar / --cortes). Veja o cabeçalho do arquivo.');
    process.exit(1);
  }
  salvar(sig, out);
}
