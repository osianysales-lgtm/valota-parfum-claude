// JOSÉ — inspetor de frascos recortados. Roda ANTES de qualquer frasco ir pra Osiany (vídeo, carrossel, capa).
// Gera a folha AMPLIADA (cada frasco a ~900 px no fundo da peça + magenta), o zoom 1:1 de tampa e base,
// e faz checagens automáticas de borda. Não substitui olhar a folha: o José (agente) SEMPRE abre as imagens.
//
// Uso: node tools/jose.js --fundo 0F2E33 --out <pasta> frasco1.png frasco2.png ...
//      (--fundo = cor do fundo onde o frasco vai aparecer; pode repetir separado por vírgula: 0F2E33,F2E8D8)
// Saída: <out>/jose-folha.png, <out>/jose-zoom-<nome>.png, <out>/jose-relatorio.json  e o veredito no terminal.
'use strict';
const path = require('path');
const fs = require('fs');
const sharp = require(path.join(__dirname, '..', 'node_modules', 'sharp'));

const argv = process.argv.slice(2);
const opt = { fundo: '0F2E33', out: '.' }; const arqs = [];
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === '--fundo') opt.fundo = argv[++i];
  else if (argv[i] === '--out') opt.out = argv[++i];
  else arqs.push(argv[i]);
}
if (!arqs.length) { console.error('uso: node tools/jose.js --fundo 0F2E33 --out pasta frasco.png ...'); process.exit(1); }
fs.mkdirSync(opt.out, { recursive: true });
const hex = h => ({ r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16), alpha: 1 });
const FUNDOS = opt.fundo.split(',').map(hex).concat([hex('FF00FF')]);

async function checar(f) {
  const { data, info } = await sharp(f).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height, A = i => data[i * 4 + 3];
  const prob = [];
  if (H < 600) prob.push(`resolução baixa (${W}x${H}); buscar foto maior se o frasco for aparecer grande`);
  // 1. corte reto: frasco encostado na borda da imagem numa linha longa (tampa/pingente/base cortados)
  const lados = { topo: 0, base: 0, esquerda: 0, direita: 0 };
  for (let x = 0; x < W; x++) { if (A(x) > 200) lados.topo++; if (A((H - 1) * W + x) > 200) lados.base++; }
  for (let y = 0; y < H; y++) { if (A(y * W) > 200) lados.esquerda++; if (A(y * W + W - 1) > 200) lados.direita++; }
  for (const [k, n] of Object.entries(lados)) {
    const tot = (k === 'topo' || k === 'base') ? W : H;
    if (n / tot > 0.25 && k !== 'base') prob.push(`corte reto no lado ${k} (${Math.round(n / tot * 100)}% da borda opaca): pedaço do frasco pode ter sido cortado`);
  }
  // 2. halo: na faixa de 3 px da borda do alfa, pixel claro e sem cor = sobra do fundo branco
  let borda = 0, halo = 0;
  for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
    const i = y * W + x; if (A(i) < 128) continue;
    let perto = false;
    for (let d = 1; d <= 3 && !perto; d++) if (A(i - d) < 20 || A(i + d) < 20 || (y - d >= 0 && A(i - d * W) < 20) || (y + d < H && A(i + d * W) < 20)) perto = true;
    if (!perto) continue; borda++;
    const r = data[i * 4], g = data[i * 4 + 1], b = data[i * 4 + 2];
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
    if (mx > 225 && (mx - mn) / (mx || 1) < 0.08) halo++;
  }
  const pHalo = borda ? halo / borda : 0;
  if (pHalo > 0.12) prob.push(`possível halo branco na borda (${Math.round(pHalo * 100)}% da borda clara e sem cor); rodar defringe.js 4 + alisar.js 2 (vidro transparente pode dar falso alarme: olhar o zoom)`);
  // 3. ilhas soltas: pixels opacos isolados longe do corpo (resto de caixa/fundo)
  const vis = new Uint8Array(W * H); const tamanhos = [];
  for (let s = 0; s < W * H; s++) {
    if (vis[s] || A(s) < 60) continue; let n = 0; const pilha = [s]; vis[s] = 1;
    while (pilha.length) { const i = pilha.pop(); n++; const x = i % W, y = (i / W) | 0;
      for (const j of [x > 0 ? i - 1 : -1, x < W - 1 ? i + 1 : -1, y > 0 ? i - W : -1, y < H - 1 ? i + W : -1]) if (j >= 0 && !vis[j] && A(j) >= 60) { vis[j] = 1; pilha.push(j); } }
    tamanhos.push(n);
  }
  tamanhos.sort((a, b) => b - a);
  const soltas = tamanhos.slice(1).filter(n => n > 30 && n < tamanhos[0] * 0.05).length;
  if (soltas) prob.push(`${soltas} pedacinho(s) solto(s) fora do frasco (resto de fundo/caixa?)`);
  return { arquivo: f, largura: W, altura: H, halo_pct: Math.round(pHalo * 100), problemas: prob };
}

async function caixa(buf, bg, alt) {
  const im = await sharp(buf).resize({ height: alt }).toBuffer(); const m = await sharp(im).metadata();
  return { buf: await sharp({ create: { width: m.width + 40, height: alt + 40, channels: 4, background: bg } }).composite([{ input: im, left: 20, top: 20 }]).png().toBuffer(), w: m.width + 40 };
}
async function lado(itens, alt, out) {
  let x = 0; const c = []; for (const it of itens) { c.push({ input: it.buf, left: x, top: 0 }); x += it.w + 8; }
  await sharp({ create: { width: x, height: alt + 40, channels: 3, background: '#ffffff' } }).composite(c).png().toFile(out);
}

(async () => {
  const rel = []; const folha = [];
  for (const f of arqs) {
    const r = await checar(f); rel.push(r);
    for (const bg of FUNDOS) folha.push(await caixa(f, bg, 900));
    // zoom 1:1 (ou ampliado) da tampa e da base, no 1º fundo e no magenta
    const m = await sharp(f).metadata(); const fat = Math.round(m.height * 0.28);
    const topo = await sharp(f).extract({ left: 0, top: 0, width: m.width, height: fat }).toBuffer();
    const base = await sharp(f).extract({ left: 0, top: m.height - fat, width: m.width, height: fat }).toBuffer();
    const z = [];
    for (const parte of [topo, base]) for (const bg of [FUNDOS[0], FUNDOS[FUNDOS.length - 1]]) z.push(await caixa(parte, bg, Math.max(400, Math.min(700, fat * 2))));
    await lado(z, Math.max(400, Math.min(700, fat * 2)), path.join(opt.out, `jose-zoom-${path.basename(f, '.png')}.png`));
  }
  await lado(folha, 900, path.join(opt.out, 'jose-folha.png'));
  fs.writeFileSync(path.join(opt.out, 'jose-relatorio.json'), JSON.stringify(rel, null, 1));
  console.log('JOSÉ · conferência automática (depois ABRIR jose-folha.png e jose-zoom-*.png e olhar um por um)');
  for (const r of rel) console.log(`${r.problemas.length ? '⚠️ ' : '✅'} ${path.basename(r.arquivo)} ${r.largura}x${r.altura}${r.problemas.map(p => '\n     - ' + p).join('')}`);
  console.log('folha:', path.join(opt.out, 'jose-folha.png'));
})();
