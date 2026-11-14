// RECORTE — tira o fundo de fotos (frasco de perfume, pessoa, produto) → PNG com transparência
//
// Uso:
//   node tools/recorte.js --entrada foto.jpg [--out output/vN/recortes]
//   node tools/recorte.js --entrada <pasta_com_fotos> --out output/vN/recortes [--modelo onnx-community/BiRefNet_lite-ONNX]
//
// Roda 100% local em Node (transformers.js + onnxruntime), sem Python. Na 1ª vez baixa o modelo (fica em cache).
// Modelo padrão: BiRefNet lite (licença MIT, uso comercial liberado).
// O PNG recortado entra nas cenas da Velma (<img> com fundo transparente) e nas cenas 3D (textura em tools/3d).

'use strict';
const fs = require('fs');
const path = require('path');

const argv = process.argv.slice(2);
const opt = {};
for (let i = 0; i < argv.length; i++) if (argv[i].startsWith('--')) {
  const k = argv[i].slice(2);
  opt[k] = (i + 1 < argv.length && !argv[i + 1].startsWith('--')) ? argv[++i] : true;
}
if (!opt.entrada) { console.error('Uso: node tools/recorte.js --entrada <foto|pasta> [--out pasta]'); process.exit(1); }
const EXT = /\.(jpe?g|png|webp|avif|tiff?)$/i;

(async function main() {
  const { pipeline, env } = await import('@huggingface/transformers');
  env.cacheDir = path.join(__dirname, '..', '.cache', 'modelos');
  const modelo = opt.modelo || 'onnx-community/BiRefNet_lite-ONNX';
  const ent = path.resolve(opt.entrada);
  const fotos = fs.statSync(ent).isDirectory() ? fs.readdirSync(ent).filter(f => EXT.test(f)).map(f => path.join(ent, f)) : [ent];
  const out = path.resolve(opt.out || path.join(path.dirname(fotos[0]), 'recortes'));
  fs.mkdirSync(out, { recursive: true });

  console.log(`[Recorte] Modelo ${modelo} (1ª vez baixa e guarda em .cache/modelos)`);
  const remover = await pipeline('background-removal', modelo, { dtype: opt.dtype || 'fp32' });
  for (const f of fotos) {
    const t0 = Date.now();
    const r = await remover(f); const img = Array.isArray(r) ? r[0] : r;
    const dest = path.join(out, path.basename(f).replace(EXT, '') + '_recorte.png');
    await img.save(dest);
    console.log(`  + ${path.relative(process.cwd(), dest)} (${((Date.now() - t0) / 1000).toFixed(1)} s)`);
  }
})().catch(e => { console.error('[Recorte] ' + (e.stack || e.message)); process.exit(1); });
