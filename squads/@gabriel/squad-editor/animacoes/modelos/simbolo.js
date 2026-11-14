/* SÍMBOLO DA MARCA AO FUNDO — sempre em movimento, só em algumas cenas (módulo reutilizável)
 *
 * Regra da squad: a marca não fica parada na tela do começo ao fim. O símbolo aparece ao fundo em
 * ALGUMAS cenas (de preferência as de lettering), grande, transparente e se movendo.
 *
 * Uso:
 *   <img id="simbolo" style="position:absolute;left:0;top:0;opacity:0">
 *   <script src="modelos/simbolo.js"></script>
 *   Simbolo.animar(document.getElementById('simbolo'), lt, dur, { modo: 'balanco', x: 800, y: 1480, tam: 1000 });
 *   Simbolo.esconder(el)   // nas cenas sem símbolo
 *
 * modo:  balanco (pêndulo pendurado no alto) · flutua (sobe/desce inclinando) · gira (rotação lenta) ·
 *        respira (pulsa — combina com cenas de voz/ritmo)
 * x, y:  centro em px · tam: largura em px · giro: inclinação de entrada (graus) · opacidade: padrão 0.10
 * final: true não faz a saída
 * A imagem padrão é FICHA.logos.simbolo (versão para o fundo principal da marca).
 */
(function () {
  const E = x => Math.max(0, Math.min(1, x));
  const eo = x => 1 - Math.pow(1 - E(x), 3);
  const lerp = (a, b, x) => a + (b - a) * x;
  const url = p => !p ? '' : /^(https?|data|file):/i.test(p) ? p : (p.startsWith('/') ? 'file://' : 'file:///') + p.replace(/\\/g, '/');

  function animar(el, lt, dur, o = {}) {
    const F = window.FICHA || {};
    if (!el.getAttribute('src')) el.src = url(o.imagem || (F.logos && (F.logos.simbolo || F.logos.marca_dagua)));
    const m = Object.assign({ modo: 'flutua', x: 540, y: 1400, tam: 1000, giro: 0, opacidade: 0.10 }, o);
    const ent = eo(lt / 0.9), sai = m.final ? 0 : E((lt - (dur - 0.35)) / 0.35);
    let giro = m.giro * (1 - ent), dx = 0, dy = 0, esc = lerp(1.25, 1, ent), origem = '50% 50%';
    if (m.modo === 'balanco') { giro += Math.sin(lt * 2.0) * 7 * ent; origem = '50% -40%'; }
    if (m.modo === 'flutua') { dy = Math.sin(lt * 1.8) * 34; dx = Math.sin(lt * 0.9) * 16; giro += Math.sin(lt * 1.8 + 0.8) * 4; }
    if (m.modo === 'gira') { giro += lt * 9; esc *= 1 + 0.05 * Math.sin(lt * 1.5); }
    if (m.modo === 'respira') { esc *= 1 + 0.06 * Math.abs(Math.sin(lt * 4.5)); giro += Math.sin(lt * 1.2) * 3; }
    el.style.position = 'absolute'; el.style.left = '0'; el.style.top = '0';
    el.style.width = m.tam + 'px';
    el.style.transformOrigin = origem;
    el.style.opacity = (m.opacidade * ent * (1 - sai)).toFixed(3);
    el.style.transform = `translate(${m.x - m.tam / 2 + dx}px,${m.y - m.tam * 0.33 + dy}px) rotate(${giro}deg) scale(${esc})`;
  }
  function esconder(el) { el.style.opacity = 0; }
  window.Simbolo = { animar, esconder };
})();
