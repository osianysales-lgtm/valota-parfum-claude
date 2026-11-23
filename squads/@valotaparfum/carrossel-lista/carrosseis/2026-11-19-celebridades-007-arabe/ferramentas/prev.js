// prévia de recorte sobre petróleo (e magenta) em tamanho grande: node prev.js <png> <saida.jpg>
const s = require('sharp');
(async () => {
  const [inp, out] = process.argv.slice(2);
  const b = await s(inp).trim({ threshold: 1 }).png().toBuffer(); const m = await s(b).metadata();
  const pet = await s({ create: { width: m.width + 80, height: m.height + 80, channels: 3, background: '#0F2E33' } }).composite([{ input: b, left: 40, top: 40 }]).png().toBuffer();
  const mag = await s({ create: { width: m.width + 80, height: m.height + 80, channels: 3, background: '#FF00FF' } }).composite([{ input: b, left: 40, top: 40 }]).png().toBuffer();
  const h = 900, w = Math.round((m.width + 80) * h / (m.height + 80));
  const a1 = await s(pet).resize({ height: h }).toBuffer(), a2 = await s(mag).resize({ height: h }).toBuffer();
  await s({ create: { width: w * 2, height: h, channels: 3, background: '#000' } }).composite([{ input: a1, left: 0, top: 0 }, { input: a2, left: w, top: 0 }]).jpeg({ quality: 92 }).toFile(out);
  console.log(inp.split('/').pop(), m.width, m.height);
})();
