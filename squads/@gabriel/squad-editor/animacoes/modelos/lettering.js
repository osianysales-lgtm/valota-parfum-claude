/* LETTERING — cenas só de tipografia (módulo reutilizável, sem identidade fixa)
 *
 * Cores e fontes vêm da ficha da marca (a Dafne injeta --cor-*, --fonte-* e window.FICHA).
 * Papéis de cor usados:  --cor-fundo (principal) · --cor-destaque · --cor-texto (terceira cor) · --cor-apoio (opcional)
 *
 * Uso no HTML (dentro de animacoes/ ou com o caminho relativo certo):
 *   <div id="let"></div>
 *   <script src="modelos/lettering.js"></script>
 *   const cena = Lettering.montar(document.getElementById('let'), LINHAS, { alinhar: 'left' });
 *   window.render = t => Lettering.animar(cena, t - INICIO_DA_CENA, DURACAO_DA_CENA);
 *
 * LINHAS: [texto | [[segmento, estilo, escala?], ...], tamanho_px, estilo, tecnica, atraso_s]
 *   O texto das linhas, juntado, é a frase do roteiro — nenhuma palavra a mais.
 *
 * ESTILOS:  solido (peso 900, cor do texto) · leve (peso 300, cor de apoio) · destaque (gradiente da cor de destaque
 *           com brilho percorrendo) · contorno (só o traço na cor de destaque)
 * TÉCNICAS: mascara  — a linha sobe de trás de uma máscara
 *           letras   — letra a letra, subindo com leve giro
 *           escala   — entra grande e desfocada e assenta
 *           deslizar — espaçamento entre letras fechando
 *           corte    — chega cortada ao meio (metades desencontradas) e se encaixa (ideia de "editar/cortar")
 *           eco      — a palavra se desdobra em cópias de contorno (ideia de "clone/multiplicar/escala")
 *           pulso    — letras pulsando como voz (ideia de "falar/som/ritmo")
 * OPÇÕES de montar: alinhar ('left'|'center'), largura (px úteis, padrão = largura do container), onda (barras de áudio
 *           embaixo), seta (seta para baixo no fim, para CTA), linhaCorte (risco na tela quando o corte se encaixa)
 * animar(cena, lt, dur, { final }) — final: true não faz a saída (última cena antes da assinatura).
 */
(function () {
  const E = x => Math.max(0, Math.min(1, x));
  const eo = x => 1 - Math.pow(1 - E(x), 3);
  const eo5 = x => 1 - Math.pow(1 - E(x), 5);
  const back = x => { x = E(x); const c = 1.6; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
  const lerp = (a, b, x) => a + (b - a) * x;

  // cores derivadas da cor de destaque (qualquer marca)
  function hex(h) { h = String(h || '').trim().replace('#', ''); if (h.length === 3) h = h.split('').map(c => c + c).join(''); const n = parseInt(h || '999999', 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
  const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
  const css = c => `rgb(${c.join(',')})`;
  function cores() {
    const cs = getComputedStyle(document.documentElement);
    const F = window.FICHA || {}; const fc = F.cores || {};
    const pega = (v, k, pad) => (cs.getPropertyValue(v).trim() || fc[k] || pad);
    const dest = hex(pega('--cor-destaque', 'destaque', '#E8C97A'));
    const texto = pega('--cor-texto', 'texto', '#FFFFFF');
    const apoio = pega('--cor-apoio', 'apoio', '') || css(mix(hex(texto), hex(pega('--cor-fundo', 'fundo', '#000')), 0.25));
    return { dest: css(dest), escuro: css(mix(dest, [0, 0, 0], 0.32)), claro: css(mix(dest, [255, 255, 255], 0.65)), texto, apoio };
  }

  let estiloInjetado = false;
  function injetarCSS() {
    if (estiloInjetado) return; estiloInjetado = true;
    const C = cores();
    const s = document.createElement('style');
    s.textContent = `
      .lt-cena{display:flex;flex-direction:column;justify-content:center;gap:10px;transform-origin:50% 50%}
      .lt-cena .ln{position:relative;line-height:1.02;white-space:nowrap}
      .lt-cena .ln.m{overflow:hidden;padding:.06em 0 .1em;margin:-.06em 0 -.1em}
      .lt-cena .in{display:inline-block;position:relative}
      .lt-cena .wd{display:inline-block;white-space:nowrap}
      .lt-cena .lt{display:inline-block;will-change:transform;font-family:var(--fonte-titulo, var(--fonte-texto, sans-serif))}
      .lt-cena .solido{color:${C.texto}}
      .lt-cena .leve{font-weight:300;color:${C.apoio};font-family:var(--fonte-texto, var(--fonte-titulo, sans-serif))}
      .lt-cena .destaque{color:transparent;-webkit-background-clip:text;background-clip:text;background-repeat:repeat-x;
        background-image:linear-gradient(100deg,${C.escuro} 0%,${C.dest} 18%,${C.claro} 28%,${C.dest} 38%,${C.dest} 62%,${C.escuro} 100%)}
      .lt-cena .contorno{color:transparent;-webkit-text-stroke:3px ${C.dest}}`;
    document.head.appendChild(s);
  }

  const PESO = { leve: 300, solido: 900, destaque: 900, contorno: 900 };
  function segHTML(texto, estilo, letras) {
    const cls = ['destaque', 'contorno', 'leve'].includes(estilo) ? estilo : 'solido';
    return texto.split(/( )/).map(p => p === ' ' ? ' ' : `<span class="wd">${letras
      ? [...p].map(ch => `<span class="lt ${cls}" style="font-weight:${PESO[cls]}">${ch}</span>`).join('')
      : `<span class="lt ${cls}" style="font-weight:${PESO[cls]}">${p}</span>`}</span>`).join('');
  }

  function montar(el, linhas, op = {}) {
    injetarCSS();
    el.classList.add('lt-cena');
    el.style.alignItems = op.alinhar === 'center' ? 'center' : 'flex-start';
    el.style.textAlign = op.alinhar || 'left';
    const C = cores();
    el.innerHTML = linhas.map(([txt, tam, estilo, tec]) => {
      const segs = Array.isArray(txt) ? txt : [[txt, estilo]];
      const letras = ['letras', 'pulso'].includes(tec);
      const inner = segs.map(([t, e, esc]) => esc ? `<span style="font-size:${esc}em;display:inline-block">${segHTML(t, e, letras)}</span>` : segHTML(t, e, letras)).join('');
      const m = ['mascara', 'letras', 'corte', 'pulso'].includes(tec) ? ' m' : '';
      const copia = tec === 'corte' ? `<div class="in cp" style="position:absolute;left:0;top:0">${inner}</div>` : '';
      const ecos = tec === 'eco' ? [1, 2, 3].map(() => `<div class="in eco" style="position:absolute;left:0;top:0;opacity:0">${segHTML(segs.map(s => s[0]).join(''), 'contorno', false)}</div>`).join('') : '';
      return `<div class="ln${m}" data-base="${tam}" style="font-size:${tam}px">${ecos}<div class="in pr">${inner}</div>${copia}</div>`;
    }).join('')
      + (op.onda ? '<div class="lt-onda" style="display:flex;gap:10px;align-items:center;height:120px;margin-top:26px"></div>' : '')
      + (op.seta ? `<div class="lt-seta" style="margin-top:46px;width:120px;height:120px;border-radius:50%;background:${C.dest};display:flex;align-items:center;justify-content:center"><svg width="66" height="66" viewBox="0 0 24 24"><path d="M12 4v15M5 12l7 7 7-7" fill="none" stroke="var(--cor-fundo,#000)" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg></div>` : '');
    if (op.linhaCorte) { const lc = document.createElement('div'); lc.className = 'lt-corte'; el.appendChild(lc); }
    return { el, linhas, op, cor: C };
  }

  // Medidas a cada quadro: a largura real só existe depois que a fonte carrega
  function medir(cena) {
    const max = cena.op.largura || cena.el.clientWidth || 912;
    [...cena.el.querySelectorAll('.ln')].forEach(ln => {
      const pr = ln.querySelector('.pr'), ls = pr.style.letterSpacing;
      pr.style.letterSpacing = '0';
      const atual = parseFloat(ln.style.fontSize), base = +ln.dataset.base;
      const natural = pr.scrollWidth * base / atual;
      const novo = natural > max ? base * max / natural : base;
      if (Math.abs(novo - atual) > 0.2) ln.style.fontSize = novo.toFixed(1) + 'px';
      pr.style.letterSpacing = ls;
    });
    [...cena.el.querySelectorAll('.wd')].forEach(wd => {
      const ls = [...wd.querySelectorAll('.lt.destaque')]; if (!ls.length) return;
      const W = wd.offsetWidth, x0 = ls[0].offsetLeft;
      ls.forEach(l => { l.style.backgroundSize = `${W * 2}px 100%`; l.dataset.x = l.offsetLeft - x0; l.dataset.w = W; });
    });
  }

  function animar(cena, lt, dur, { final = false } = {}) {
    const { el, linhas, op } = cena;
    medir(cena);
    const saida = final ? 0 : E((lt - (dur - 0.32)) / 0.32);
    el.style.transform = `scale(${1 + 0.025 * E(lt / dur)}) translateY(${-saida * 40}px)`;
    el.style.opacity = 1 - saida;
    [...el.querySelectorAll('.ln')].forEach((ln, i) => {
      const tec = linhas[i][3], a = lt - linhas[i][4];
      const pr = ln.querySelector('.pr'), lts = [...pr.querySelectorAll('.lt')];
      if (tec === 'mascara') pr.style.transform = `translateY(${(1 - eo5(a / 0.55)) * 115}%)`;
      if (tec === 'escala') { const p = eo5(a / 0.6); pr.style.transform = `scale(${lerp(1.9, 1, p)})`; pr.style.filter = `blur(${(1 - p) * 14}px)`; pr.style.opacity = E(a / 0.25); pr.style.transformOrigin = op.alinhar === 'center' ? '50% 60%' : '0 60%'; }
      if (tec === 'deslizar') { const p = eo5(a / 0.8); pr.style.letterSpacing = `${(1 - p) * 0.55}em`; pr.style.opacity = E(a / 0.3); }
      if (tec === 'letras' || tec === 'pulso') lts.forEach((l, j) => {
        const b = a - j * 0.04, p = eo5(b / 0.5);
        const sy = tec === 'pulso' && b > 0.5 ? 1 + 0.22 * Math.abs(Math.sin(lt * 9 + j * 0.9) * Math.sin(lt * 3.1 + j * 0.4)) : 1;
        l.style.transform = `translateY(${(1 - p) * 105}%) rotate(${(1 - p) * 10}deg) scaleY(${sy})`; l.style.transformOrigin = '50% 100%';
      });
      if (tec === 'corte') {
        const p = eo5(a / 0.7), cp = ln.querySelector('.cp'), off = (1 - p) * 140;
        pr.style.clipPath = 'inset(0 -20px 50% -20px)'; cp.style.clipPath = 'inset(calc(50% - .06em) -20px 0 -20px)';
        pr.style.transform = `translateX(${-off}px)`; cp.style.transform = `translateX(${off}px)`;
        pr.style.opacity = cp.style.opacity = E(a / 0.15);
      }
      if (tec === 'eco') {
        const p = back(a / 0.6);
        pr.style.transform = `scale(${lerp(0.6, 1, p)})`; pr.style.opacity = E(a / 0.2); pr.style.transformOrigin = '50% 60%';
        [...ln.querySelectorAll('.eco')].forEach((e, k) => {
          const q = eo((a - 0.45 - k * 0.12) / 0.6), dx = (k + 1) * 34 * q + Math.sin(lt * 2 + k) * 4 * q;
          e.style.opacity = q * (0.55 - k * 0.15); e.style.transform = `translate(${dx}px,${-dx * 0.35}px)`; e.style.zIndex = -1;
        });
      }
      lts.filter(l => l.classList.contains('destaque')).forEach(l => {   // brilho percorrendo o destaque
        const W = +l.dataset.w || 400, x = +l.dataset.x || 0, br = Math.max(0, ((a - 0.6) % 2.6) / 2.6);
        l.style.backgroundPosition = `${-x - lerp(W, -W * 0.6, E(br))}px 0`;
      });
    });
    const onda = el.querySelector('.lt-onda');
    if (onda) onda.innerHTML = Array.from({ length: 26 }, (_, i) => { const h = 18 + 92 * Math.abs(Math.sin(lt * 7 + i * 0.6) * Math.sin(lt * 2.2 + i * 0.25)) * E((lt - 0.2) / 0.4);
      return `<div style="width:12px;height:${h.toFixed(1)}px;border-radius:6px;background:${cena.cor.dest};opacity:${i % 5 === 0 ? 1 : 0.45}"></div>`; }).join('');
    const seta = el.querySelector('.lt-seta');
    if (seta) seta.style.transform = `translateY(${Math.sin(lt * 5) * 14}px) scale(${back((lt - 2.5) / 0.5)})`;
    const lc = el.querySelector('.lt-corte');
    if (lc) { const p = E((lt - 0.95) / 0.45);
      lc.style.cssText = `position:absolute;left:-100px;right:-100px;top:50%;height:4px;background:linear-gradient(90deg,transparent,${cena.cor.dest},transparent);transform:scaleX(${p});opacity:${(1 - E((lt - 1.4) / 0.4)) * (p > 0 ? 1 : 0)}`; }
  }

  window.Lettering = { montar, animar, cores };
})();
