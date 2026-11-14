const puppeteer = require('../../node_modules/puppeteer');
(async () => {
  const b = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const p = await b.newPage(); await p.setViewport({ width: 1080, height: 1920 });
  await p.goto('http://localhost:8791/qa_overflow.html', { waitUntil: 'load' });
  const r = await p.evaluate(() => window.auditar());
  console.log(r.length ? r.join('\n') : 'OK: nenhum texto fora da caixa');
  await b.close();
})();
