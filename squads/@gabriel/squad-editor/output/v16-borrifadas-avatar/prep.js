// node prep.js → hf/assets/img/*.png (frascos recortados, sem borda transparente)
const sharp = require('../../node_modules/sharp');
const path = require('path');
const O = p => path.join(__dirname, 'hf/assets/img', p + '.png');
const R = p => path.join(__dirname, p);
const cut = ['acqua', 'c212', 'lightblue', 'versace', 'bleu', 'aventus', 'terre', 'lemale', 'elixir', 'swy', 'spicebomb'].map(k => [k, `fotos/recortes2/${k}.png`]);
cut.push(['sauvage', '../v14-checkup-avatar/hf/assets/img/sauvage.png']);
(async () => {
  for (const [k, f] of cut) {
    const buf = await sharp(R(f)).trim({ threshold: 1 }).png().toBuffer();
    let s = sharp(buf); const m = await s.metadata();
    if (m.height > 700 || m.width > 700) s = s.resize({ width: 700, height: 700, fit: 'inside' });
    const r = await s.png().toFile(O(k)); console.log(k, r.width, r.height);
  }
})();
