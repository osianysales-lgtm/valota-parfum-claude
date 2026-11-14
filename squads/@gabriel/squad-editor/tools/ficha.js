// FICHA — lê a ficha da marca resolvendo os caminhos de fontes e logos.
//
// As fichas salvas em marcas/<marca>/ficha.json guardam caminhos RELATIVOS à pasta da squad
// (ex.: "marcas/minha-marca/arquivos/Montserrat-SemiBold.ttf"), então funcionam em qualquer computador.
// Fichas antigas, com caminho absoluto de outra máquina, também funcionam: se o arquivo não existe
// no caminho gravado, procura um arquivo com o mesmo nome em marcas/*/arquivos/.

'use strict';
const fs = require('fs');
const path = require('path');

const RAIZ = path.resolve(__dirname, '..');
const EXT = /\.(ttf|otf|woff2?|png|jpe?g|webp|svg|gif|avif|mp4|mov|webm)$/i;

function acharEmMarcas(nome) {
  const base = path.join(RAIZ, 'marcas');
  let dirs = [];
  try { dirs = fs.readdirSync(base, { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name); } catch { return null; }
  for (const d of dirs) {
    const c = path.join(base, d, 'arquivos', nome);
    if (fs.existsSync(c)) return c;
  }
  return null;
}

/** Caminho de arquivo da ficha → caminho absoluto que existe (ou o original, se nada for encontrado). */
function resolver(p, baseFicha) {
  if (typeof p !== 'string' || !EXT.test(p) || /^(https?:|data:)/i.test(p)) return p;
  const cands = path.isAbsolute(p) || /^[a-z]:[\\/]/i.test(p) ? [p] : [path.join(RAIZ, p), baseFicha ? path.join(baseFicha, p) : null, path.resolve(p)];
  for (const c of cands) if (c && fs.existsSync(c)) return path.resolve(c);
  return acharEmMarcas(path.basename(p.replace(/\\/g, '/'))) || p;
}

function resolverTudo(o, base) {
  if (typeof o === 'string') return resolver(o, base);
  if (Array.isArray(o)) return o.map(x => resolverTudo(x, base));
  if (o && typeof o === 'object') { const r = {}; for (const [k, v] of Object.entries(o)) r[k] = resolverTudo(v, base); return r; }
  return o;
}

/** Lê a ficha (JSON, com ou sem BOM) e devolve com os caminhos resolvidos. */
function carregarFicha(arquivo) {
  const p = path.resolve(arquivo);
  const ficha = JSON.parse(fs.readFileSync(p, 'utf8').replace(/^﻿/, ''));
  return resolverTudo(ficha, path.dirname(p));
}

module.exports = { carregarFicha, resolver, RAIZ };
