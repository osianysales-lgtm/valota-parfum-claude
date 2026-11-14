const sharp = require('../../node_modules/sharp'); const path = require('path');
const ks = process.argv[3].split(','); const dir = process.argv[2]; const H = 420, CW = 300;
(async () => {
  const comps = [];
  for (const [j, k] of ks.entries()) {
    const b = await sharp(path.join(__dirname, dir, k + '.png')).trim({ threshold: 1 }).resize({ height: H, width: CW - 20, fit: 'inside' }).png().toBuffer();
    const m = await sharp(b).metadata();
    comps.push({ input: b, left: j * CW + Math.round((CW - m.width) / 2), top: 20 + H - m.height });
  }
  await sharp({ create: { width: CW * ks.length, height: H + 40, channels: 3, background: '#0F2E33' } }).composite(comps).jpeg({ quality: 90 }).toFile(process.argv[4]);
})();
