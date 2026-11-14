// base.js: ferramentas de desenho que o efeito.js recebe prontas (globais). NÃO EDITE.
// Usado por scripts/renderizar.cjs, que desenha com @napi-rs/canvas (a mesma API do canvas do navegador).
module.exports = function criarBase({ createCanvas, W, H }) {
  // ---------------------------------------------------------------- tempo e movimento
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const lerp = (a, b, p) => a + (b - a) * p;
  const range = (t, t0, t1) => clamp((t - t0) / (t1 - t0));          // 0..1 dentro de [t0, t1]
  const E = {
    outCubic: (x) => 1 - Math.pow(1 - clamp(x), 3),
    inCubic: (x) => Math.pow(clamp(x), 3),
    inOut: (x) => { x = clamp(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; },
    outBack: (x) => { x = clamp(x); const c = 1.9; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); },
    outExpo: (x) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * clamp(x))),
  };
  const pop = (t, t0, d = 0.32) => (t < t0 ? 0 : E.outBack(range(t, t0, t0 + d)));   // escala que passa de 1 e volta
  const passo = (t, fps = 12) => Math.floor(t * fps) / fps;          // relógio "stop motion"
  function rnd(seed) {                                               // aleatório com semente (nunca Math.random)
    let a = seed | 0;
    return function () {
      a = (a + 0x6D2B79F5) | 0;
      let x = Math.imul(a ^ (a >>> 15), 1 | a);
      x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
      return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
    };
  }
  const novoCanvas = (w = W, h = H) => createCanvas(w, h);          // canvas extra (camadas, texturas)

  // ---------------------------------------------------------------- desenho básico
  function rr(g, x, y, w, h, r) { g.beginPath(); g.roundRect(x, y, w, h, r); }
  function emVolta(g, cx, cy, s, fn, rot = 0) {                     // escala/gira fn em volta de (cx, cy)
    g.save(); g.translate(cx, cy); if (rot) g.rotate(rot); g.scale(s, s); g.translate(-cx, -cy); fn(); g.restore();
  }
  function fonte(o) { return `${o.italico ? 'italic ' : ''}${o.peso ?? 700} ${o.tam ?? 60}px "${o.fonte ?? 'Inter'}"`; }
  function texto(g, s, x, y, o = {}) {
    g.save();
    g.font = fonte(o); g.fillStyle = o.cor ?? '#fff'; g.textAlign = o.alinhar ?? 'left'; g.textBaseline = o.base ?? 'alphabetic';
    g.letterSpacing = (o.espaco ?? 0) + 'px';
    if (o.sombra) { g.shadowColor = 'rgba(0,0,0,.45)'; g.shadowBlur = o.sombra; g.shadowOffsetY = o.sombra / 4; }
    g.fillText(s, x, y);
    g.restore();
  }
  function medir(g, s, o = {}) { g.save(); g.font = fonte(o); g.letterSpacing = (o.espaco ?? 0) + 'px'; const w = g.measureText(s).width; g.restore(); return w; }
  function caber(g, s, larguraMax, o = {}) {                         // devolve o tamanho de fonte que cabe
    const w = medir(g, s, o), tam = o.tam ?? 60;
    return w > larguraMax ? Math.floor(tam * larguraMax / w) : tam;
  }
  function sombraTopo(g, altura = 600, forca = 0.55) {               // escurece o topo para título ler bem
    const gr = g.createLinearGradient(0, 0, 0, altura);
    gr.addColorStop(0, `rgba(0,0,0,${forca})`); gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr; g.fillRect(0, 0, W, altura);
  }

  // ---------------------------------------------------------------- receitas prontas
  // vidro fosco: o que está atrás, desfocado, com tinta e borda clara
  function vidro(g, fundo, x, y, w, h, r, o = {}) {
    g.save(); rr(g, x, y, w, h, r); g.clip();
    g.filter = `blur(${o.blur ?? 22}px) saturate(1.3)`;
    const pad = 60, sx = Math.max(0, x - pad), sy = Math.max(0, y - pad);
    const sw = Math.min(W, x + w + pad) - sx, sh = Math.min(H, y + h + pad) - sy;
    if (sw > 0 && sh > 0) g.drawImage(fundo, sx, sy, sw, sh, sx, sy, sw, sh);
    g.filter = 'none';
    g.fillStyle = o.tinta ?? 'rgba(255,255,255,.14)'; g.fillRect(x, y, w, h);
    const hl = g.createLinearGradient(x, y, x, y + h);
    hl.addColorStop(0, 'rgba(255,255,255,.16)'); hl.addColorStop(0.4, 'rgba(255,255,255,0)');
    g.fillStyle = hl; g.fillRect(x, y, w, h);
    g.restore();
    g.save(); rr(g, x + 1, y + 1, w - 2, h - 2, r); g.strokeStyle = o.borda ?? 'rgba(255,255,255,.38)'; g.lineWidth = 2; g.stroke(); g.restore();
  }
  // a pessoa por cima de tudo (o que foi desenhado antes fica "atrás" dela)
  function pessoa(g, recorte, filtro) { g.save(); if (filtro) g.filter = filtro; g.drawImage(recorte, 0, 0, W, H); g.restore(); }
  // a pessoa como adesivo de papel: borda branca em volta da silhueta, filtro e retícula opcionais, sombra
  const adesivo = createCanvas(W, H), AG = adesivo.getContext('2d');
  function pessoaAdesivo(g, recorte, o = {}) {
    const b = o.borda ?? 12;
    AG.save(); AG.globalCompositeOperation = 'source-over'; AG.clearRect(0, 0, W, H);
    AG.filter = o.filtro ?? 'none'; AG.drawImage(recorte, 0, 0, W, H); AG.filter = 'none';
    if (o.reticula) { AG.globalCompositeOperation = 'source-atop'; AG.globalAlpha = o.reticula; AG.fillStyle = padraoPontos(AG); AG.fillRect(0, 0, W, H); AG.globalAlpha = 1; }
    AG.globalCompositeOperation = 'destination-over';                // a borda vai por trás da pessoa
    AG.filter = 'brightness(0) invert(1)';
    for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; AG.drawImage(recorte, Math.cos(a) * b, Math.sin(a) * b, W, H); }
    AG.restore();
    g.save();
    if (o.sombra !== false) { g.shadowColor = 'rgba(30,20,10,.38)'; g.shadowBlur = 30; g.shadowOffsetY = 16; }
    g.drawImage(adesivo, 0, 0); g.restore();
  }
  // retícula de pontos (efeito de impressão)
  let PONTOS = null;
  function padraoPontos(g, passoPx = 9) {
    if (!PONTOS) {
      PONTOS = createCanvas(passoPx, passoPx);
      const x = PONTOS.getContext('2d'); x.fillStyle = 'rgba(22,22,22,.6)'; x.beginPath(); x.arc(passoPx / 2, passoPx / 2, passoPx * 0.19, 0, 7); x.fill();
    }
    return g.createPattern(PONTOS, 'repeat');
  }
  function reticula(g, x, y, w, h, alpha = 0.2) { g.save(); g.globalAlpha = alpha; g.fillStyle = padraoPontos(g); g.fillRect(x, y, w, h); g.restore(); }
  // grão de filme com semente por quadro
  const GRAO = [];
  function grao(g, k, forca = 0.5, modo = 'overlay') {
    const n = k.i % 4;
    if (!GRAO[n]) {
      const c = createCanvas(256, 256), x = c.getContext('2d'), d = x.createImageData(256, 256), r = rnd(1000 + n);
      for (let p = 0; p < d.data.length; p += 4) { const v = r() * 255; d.data[p] = d.data[p + 1] = d.data[p + 2] = v; d.data[p + 3] = 40; }
      x.putImageData(d, 0, 0); GRAO[n] = c;
    }
    const r = rnd(k.i * 7 + 3), ox = Math.floor(r() * 256), oy = Math.floor(r() * 256);
    g.save(); g.globalCompositeOperation = modo; g.globalAlpha = forca;
    for (let y = -oy; y < H; y += 256) for (let x = -ox; x < W; x += 256) g.drawImage(GRAO[n], x, y);
    g.restore();
  }
  // card de imagem (reels, prints): cantos redondos, borda clara, sombra; prop = altura/largura
  function cartao(g, imagem, cx, cy, w, o = {}) {
    const h = w * (o.prop ?? 16 / 9), r = o.raio ?? w * 0.08;
    g.save(); g.translate(cx, cy); if (o.rot) g.rotate(o.rot); if (o.escala) g.scale(o.escala, o.escala);
    if (o.sombra !== false) { g.shadowColor = 'rgba(0,0,0,.45)'; g.shadowBlur = 30; g.shadowOffsetY = 14; }
    rr(g, -w / 2, -h / 2, w, h, r); g.fillStyle = '#111'; g.fill(); g.shadowColor = 'transparent';
    g.save(); g.clip();
    if (imagem) { const iw0 = imagem.naturalWidth || imagem.width, ih0 = imagem.naturalHeight || imagem.height;
      const s = Math.max(w / iw0, h / ih0), iw = iw0 * s, ih = ih0 * s; g.drawImage(imagem, -iw / 2, -ih / 2, iw, ih); }
    g.restore();
    if (o.borda !== false) { rr(g, -w / 2, -h / 2, w, h, r); g.strokeStyle = o.borda ?? 'rgba(255,255,255,.55)'; g.lineWidth = 3; g.stroke(); }
    g.restore();
  }
  // marca-texto: faixa inclinada que cresce da esquerda para a direita (desenhe ANTES do texto)
  function marcaTexto(g, x, y, w, h, p, cor = '#FFDD3C') {
    if (p <= 0) return;
    g.save(); g.translate(x, y); g.rotate(-0.02); g.transform(1, 0, -0.1, 1, 0, 0);
    g.globalCompositeOperation = 'multiply'; g.fillStyle = cor;
    rr(g, 0, 0, w * clamp(p), h, [6, 14, 8, 16]); g.fill(); g.restore();
  }
  // traço à mão: desenha p (0..1) de uma linha que passa pelos pontos
  function tracoMao(g, pontos, p, o = {}) {
    if (p <= 0 || pontos.length < 2) return;
    const seg = []; let tot = 0;
    for (let i = 1; i < pontos.length; i++) { const d = Math.hypot(pontos[i][0] - pontos[i - 1][0], pontos[i][1] - pontos[i - 1][1]); seg.push(d); tot += d; }
    let rest = tot * clamp(p);
    g.save(); g.strokeStyle = o.cor ?? '#E2382B'; g.lineWidth = o.largura ?? 9; g.lineCap = 'round'; g.lineJoin = 'round';
    g.beginPath(); g.moveTo(pontos[0][0], pontos[0][1]);
    for (let i = 1; i < pontos.length && rest > 0; i++) {
      const f = Math.min(1, rest / seg[i - 1]);
      g.lineTo(lerp(pontos[i - 1][0], pontos[i][0], f), lerp(pontos[i - 1][1], pontos[i][1], f)); rest -= seg[i - 1];
    }
    g.stroke(); g.restore();
  }
  // círculo de check que se desenha (p 0..1); p <= 0 desenha o círculo vazio
  function check(g, cx, cy, r, p, cor = '#D97757') {
    g.save();
    if (p <= 0) { g.beginPath(); g.arc(cx, cy, r - 1.5, 0, 7); g.strokeStyle = 'rgba(255,255,255,.45)'; g.lineWidth = 3; g.stroke(); g.restore(); return; }
    const s = E.outBack(clamp(p * 1.6));
    g.translate(cx, cy); g.scale(s, s);
    g.beginPath(); g.arc(0, 0, r, 0, 7); g.fillStyle = cor; g.fill();
    g.beginPath(); g.moveTo(-r * 0.45, 0); g.lineTo(-r * 0.12, r * 0.33); g.lineTo(r * 0.48, -r * 0.35);
    g.strokeStyle = '#fff'; g.lineWidth = r * 0.22; g.lineCap = 'round'; g.lineJoin = 'round';
    const len = r * 1.5; g.setLineDash([len]); g.lineDashOffset = len * (1 - clamp(p * 1.4 - 0.3)); g.stroke();
    g.restore();
  }

  return { clamp, lerp, range, E, pop, passo, rnd, novoCanvas, rr, emVolta, texto, medir, caber, sombraTopo,
    vidro, pessoa, pessoaAdesivo, reticula, grao, cartao, marcaTexto, tracoMao, check };
};
