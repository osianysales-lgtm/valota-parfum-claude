// Apaga a cadeira do recorte do avatar com uma máscara desenhada à mão (quadro 1080x1920).
const puppeteer = require('puppeteer'); const fs = require('fs');
const [src, dst, polisJson] = process.argv.slice(2);
(async () => {
  const b = await puppeteer.launch({headless: 'new'}); const p = await b.newPage();
  const data = 'data:image/png;base64,' + fs.readFileSync(src).toString('base64');
  const out = await p.evaluate(async (data, polis) => {
    const img = new Image(); img.src = data; await img.decode();
    const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
    const x = c.getContext('2d'); x.drawImage(img, 0, 0);
    const sx = img.width / 1080, sy = img.height / 1920;
    x.globalCompositeOperation = 'destination-out'; x.filter = 'blur(2.5px)'; x.fillStyle = '#000';
    for (const pol of polis) { x.beginPath(); pol.forEach(([a, b], i) => i ? x.lineTo(a*sx, b*sy) : x.moveTo(a*sx, b*sy)); x.closePath(); x.fill(); }
    return c.toDataURL('image/png');
  }, data, JSON.parse(polisJson));
  fs.writeFileSync(dst, Buffer.from(out.split(',')[1], 'base64')); await b.close(); console.log('ok');
})();
