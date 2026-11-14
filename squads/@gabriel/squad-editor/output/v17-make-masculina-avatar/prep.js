// node prep.js → hf/assets/img/*.png (frascos recortados, sem borda transparente)
const sharp = require('../../node_modules/sharp');
const path = require('path');
const O = p => path.join(__dirname, 'hf/assets/img', p + '.png');
const R = p => path.join(__dirname, p);
const cut = [['hawasblack', 'fotos/recortes2/hawasblack.png', 0.065], ['hacivat', 'fotos/recortes2/hacivat.png', 0],
  ['khamrah', 'fotos/khamrah.png', 0], ['fahad', 'fotos/fahad.png', 0], ['maahir', 'fotos/maahir.png', 0], ['elite', 'fotos/elite.png', 0], ['cdnim', 'fotos/cdnim.png', 0]];
(async () => {
  for (const [k, f, corte] of cut) {
    let buf = await sharp(R(f)).trim({ threshold: 1 }).png().toBuffer();
    if (corte) { const m = await sharp(buf).metadata(); buf = await sharp(buf).extract({ left: 0, top: 0, width: m.width, height: Math.round(m.height * (1 - corte)) }).trim({ threshold: 1 }).png().toBuffer(); }
    let s = sharp(buf); const m = await s.metadata();
    if (m.height > 700 || m.width > 700) s = s.resize({ width: 700, height: 700, fit: 'inside' });
    const r = await s.png().toFile(O(k)); console.log(k, r.width, r.height);
  }
})();
