// MARCA — salva a marca para as próximas execuções (e para outros computadores)
//
//   node tools/marca.js salvar --ficha output/vN/ficha.json --marca "MINHA MARCA" [--perfil output/vN/step-01-perfil-empresa.md]
//   node tools/marca.js conferir --marca minha-marca
//
// salvar:   cria marcas/<marca>/ com ficha.json (+ perfil.md) e COPIA as fontes e os logos citados na ficha para
//           marcas/<marca>/arquivos/. A ficha salva aponta para essas cópias com caminho relativo à squad
//           ("marcas/minha-marca/arquivos/Fonte.ttf"): a marca funciona em qualquer computador, sem a fonte instalada.
//           Rodar de novo atualiza a marca (correções valem para os próximos vídeos).
// conferir: lista os arquivos da ficha salva e diz quais estão faltando.

'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { carregarFicha, resolver, RAIZ } = require('./ficha');

const argv = process.argv.slice(2);
const cmd = argv[0];
const opt = {};
for (let i = 1; i < argv.length; i++) if (argv[i].startsWith('--')) {
  const k = argv[i].slice(2);
  opt[k] = (i + 1 < argv.length && !argv[i + 1].startsWith('--')) ? argv[++i] : true;
}
const EXT = /\.(ttf|otf|woff2?|png|jpe?g|webp|svg|gif|avif|mp4|mov|webm)$/i;
const slug = s => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'marca';
const rel = p => path.relative(RAIZ, p).split(path.sep).join('/');
const hash = p => crypto.createHash('sha1').update(fs.readFileSync(p)).digest('hex');

function salvar() {
  if (!opt.ficha) throw new Error('Uso: node tools/marca.js salvar --ficha output/vN/ficha.json --marca "Nome"');
  const ficha = carregarFicha(opt.ficha);
  const nome = opt.marca || ficha.marca;
  if (!nome) throw new Error('Informe --marca "Nome" (ou o campo "marca" na ficha).');
  const dir = path.join(RAIZ, 'marcas', slug(nome));
  const dirArq = path.join(dir, 'arquivos');
  fs.mkdirSync(dirArq, { recursive: true });
  const copiados = [], faltando = [];
  const mapa = new Map();
  const copiar = p => {
    if (mapa.has(p)) return mapa.get(p);
    let dest = path.join(dirArq, path.basename(p));
    if (path.resolve(p) !== path.resolve(dest)) {
      // mesmo nome com conteúdo diferente: não sobrescreve, cria um nome novo
      for (let n = 2; fs.existsSync(dest) && hash(dest) !== hash(p); n++) dest = path.join(dirArq, path.basename(p, path.extname(p)) + `_${n}` + path.extname(p));
      if (!fs.existsSync(dest)) { fs.copyFileSync(p, dest); copiados.push(path.basename(dest)); }
    }
    const r = rel(dest);
    mapa.set(p, r);
    return r;
  };
  const trocar = o => {
    if (typeof o === 'string') {
      if (!EXT.test(o) || /^(https?:|data:)/i.test(o)) return o;
      if (fs.existsSync(o)) return copiar(o);
      faltando.push(o); return o;
    }
    if (Array.isArray(o)) return o.map(trocar);
    if (o && typeof o === 'object') { const r = {}; for (const [k, v] of Object.entries(o)) r[k] = trocar(v); return r; }
    return o;
  };
  const salva = trocar(ficha);
  salva.marca = salva.marca || nome;
  fs.writeFileSync(path.join(dir, 'ficha.json'), JSON.stringify(salva, null, 2) + '\n', 'utf8');
  if (opt.perfil && fs.existsSync(opt.perfil)) fs.copyFileSync(opt.perfil, path.join(dir, 'perfil.md'));
  console.log(`[Marca] ${nome} salva em ${rel(dir)}/`);
  console.log(`[Marca] ${mapa.size} arquivo(s) de fonte/logo na pasta da marca${copiados.length ? ` (${copiados.length} copiado(s) agora: ${copiados.join(', ')})` : ''}.`);
  if (faltando.length) console.log(`[Marca] ATENÇÃO — não encontrados (a ficha mantém o caminho, confira): ${[...new Set(faltando)].join(' | ')}`);
}

function conferir() {
  const dir = path.join(RAIZ, 'marcas', slug(opt.marca || ''));
  const f = path.join(dir, 'ficha.json');
  if (!fs.existsSync(f)) throw new Error(`Marca não encontrada: ${rel(dir)}`);
  const bruta = JSON.parse(fs.readFileSync(f, 'utf8').replace(/^﻿/, ''));
  const ok = [], falta = [];
  const andar = o => {
    if (typeof o === 'string') { if (EXT.test(o)) { const r = resolver(o, dir); (fs.existsSync(r) ? ok : falta).push(o); } }
    else if (o && typeof o === 'object') Object.values(o).forEach(andar);
  };
  andar(bruta);
  console.log(`[Marca] ${rel(dir)}: ${ok.length} arquivo(s) ok${falta.length ? `, FALTANDO: ${falta.join(' | ')}` : ''}`);
  if (falta.length) process.exitCode = 2;
}

try {
  if (cmd === 'salvar') salvar();
  else if (cmd === 'conferir') conferir();
  else { console.error('Uso: node tools/marca.js salvar --ficha ficha.json --marca "Nome" [--perfil perfil.md] | conferir --marca nome'); process.exit(1); }
} catch (e) { console.error('[Marca] ERRO: ' + e.message); process.exit(1); }
