// node recorte_branco.js <tolerancia> → fotos/recortes2/*.png
// Recorte por fundo branco: remove só o branco CONECTADO à borda (flood fill), mantém o vidro inteiro.
// Borda suave: pixels de fronteira ganham alfa proporcional ao quanto diferem do branco.
const sharp = require('../../node_modules/sharp');
const fs = require('fs'), path = require('path');
const TOL = +(process.argv[2] || 14);           // distância máx. do branco puro para ser "fundo"
const IN = path.join(__dirname, 'fotos/brutas'), OUT = path.join(__dirname, 'fotos/recortes2');
fs.mkdirSync(OUT, { recursive: true });
(async () => {
  for (const f of fs.readdirSync(IN).filter(x => /\.jpg$/.test(x))) {
    const { data, info } = await sharp(path.join(IN, f)).removeAlpha().raw().toBuffer({ resolveWithObject: true });
    const { width: w, height: h } = info; const N = w * h;
    const dist = new Float32Array(N);
    for (let i = 0; i < N; i++) { const r = data[i * 3], g = data[i * 3 + 1], b = data[i * 3 + 2]; dist[i] = Math.max(255 - r, 255 - g, 255 - b); }
    const bg = new Uint8Array(N); const q = new Int32Array(N); let qh = 0, qt = 0;
    const push = i => { if (!bg[i] && dist[i] <= TOL) { bg[i] = 1; q[qt++] = i; } };
    for (let x = 0; x < w; x++) { push(x); push((h - 1) * w + x); }
    for (let y = 0; y < h; y++) { push(y * w); push(y * w + w - 1); }
    while (qh < qt) { const i = q[qh++]; const x = i % w, y = (i / w) | 0;
      if (x > 0) push(i - 1); if (x < w - 1) push(i + 1); if (y > 0) push(i - w); if (y < h - 1) push(i + w); }
    const out = Buffer.alloc(N * 4);
    for (let i = 0; i < N; i++) {
      out[i * 4] = data[i * 3]; out[i * 4 + 1] = data[i * 3 + 1]; out[i * 4 + 2] = data[i * 3 + 2];
      let a = bg[i] ? 0 : 255;
      if (!bg[i]) { // fronteira: vizinho de fundo → alfa suave
        const x = i % w, y = (i / w) | 0;
        const viz = (x > 0 && bg[i - 1]) || (x < w - 1 && bg[i + 1]) || (y > 0 && bg[i - w]) || (y < h - 1 && bg[i + w]);
        if (viz) a = Math.round(255 * Math.min(1, Math.max(0.35, dist[i] / (TOL * 4))));
      }
      out[i * 4 + 3] = a;
    }
    const nome = f.replace('.jpg', '');
    await sharp(out, { raw: { width: w, height: h, channels: 4 } }).png().toFile(path.join(OUT, nome + '.png'));
    console.log(nome, w, h, 'fundo', (bg.reduce((s, v) => s + v, 0) / N * 100).toFixed(0) + '%');
  }
})();
