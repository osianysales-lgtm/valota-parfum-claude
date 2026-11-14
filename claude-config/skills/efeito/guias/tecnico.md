# Guia técnico: como escrever `efeito.js`

O motor (`scripts/renderizar.cjs` + `modelo/base.js`) já cuida de carregar os quadros, o recorte e o rosto. Você só escreve o desenho. Ele desenha com `@napi-rs/canvas`: a mesma API do canvas do navegador, rodando no Node, sem navegador.

```js
const EFEITO = {
  imagens: { foto: 'imagens/foto.jpg', reels: ['amostras/a02.jpg', 'amostras/a05.jpg'] },  // carregadas antes do 1º quadro
  desenhar(g, k) {
    g.drawImage(k.quadro, 0, 0);          // 1. o vídeo
    // 2. o que fica ATRÁS da pessoa
    pessoa(g, k.recorte);                 // 3. a pessoa por cima (só se algo precisar ficar atrás dela)
    // 4. o que fica NA FRENTE
  },
};
```

- Tela de **1080 × 1920**, 30 fps. `g` é um `CanvasRenderingContext2D` comum.
- `k.t` vai de 0 até `k.d` (a duração do trecho). `k.p = k.t / k.d`.
- `k.quadro` e `k.recorte` têm o tamanho da tela. O recorte é a pessoa com fundo transparente: desenhar ele por cima "devolve" a pessoa para a frente de tudo que veio antes.
- `k.rosto = { x, y, w, h, cx, cy, topo, queixo }`: a caixa vai da sobrancelha ao queixo. `topo` é o alto da cabeça (cabelo) e `queixo` a base do queixo. É suavizada, então dá para "grudar" coisas no rosto sem tremer.
- `k.img` tem as imagens de `EFEITO.imagens` (string, array ou objeto de caminhos relativos à pasta de trabalho).
- `k.i` é o número do quadro (use como semente de coisas que mudam por quadro, como grão e tremidas).
- Canvas extra (camadas, texturas guardadas): `novoCanvas(largura, altura)`. `W` e `H` (1080, 1920) são globais.

## Ferramentas prontas (globais)

**Tempo:** `clamp(x, a=0, b=1)`, `lerp(a, b, p)`, `range(t, t0, t1)` (0..1 dentro do intervalo), `E.outCubic / inCubic / inOut / outBack / outExpo`, `pop(t, t0, dur=0.32)` (escala de entrada que passa um pouco de 1 e volta), `passo(t, fps=12)` (relógio "stop motion"), `rnd(semente)` (gera números de 0 a 1; crie com semente fixa a cada quadro, nunca `Math.random`).

**Desenho:**
- `rr(g, x, y, w, h, r)`: caminho de retângulo arredondado (depois `g.fill()` / `g.stroke()` / `g.clip()`).
- `emVolta(g, cx, cy, escala, fn, rot=0)`: roda `fn` escalado/girado em volta de um ponto (use com `pop`).
- `texto(g, s, x, y, { fonte, peso, tam, cor, alinhar, italico, espaco, sombra, base })`.
- `medir(g, s, opts)` → largura. `caber(g, s, larguraMax, opts)` → o `tam` que faz caber.
- `sombraTopo(g, altura=600, forca=.55)`: escurece o topo para o título ler sobre qualquer fundo.

**Receitas:**
- `vidro(g, k.quadro, x, y, w, h, raio, { tinta, borda, blur })`: card de vidro fosco (desfoca o que está atrás).
- `pessoa(g, k.recorte, filtro?)`: a pessoa por cima. Ex.: `pessoa(g, k.recorte, 'grayscale(1) contrast(1.3)')`.
- `pessoaAdesivo(g, k.recorte, { borda: 12, filtro, reticula: .4, sombra })`: a pessoa como adesivo de papel, com borda branca e sombra.
- `reticula(g, x, y, w, h, alpha)`: pontinhos de impressão por cima de uma área.
- `grao(g, k, forca=.5, modo='overlay')`: grão de filme estável por quadro.
- `cartao(g, imagem, cx, cy, largura, { rot, escala, prop: 16/9, raio, borda, sombra })`: card de imagem (reel, print).
- `marcaTexto(g, x, y, w, h, p, cor)`: faixa de marca-texto que cresce (desenhe antes do texto).
- `tracoMao(g, [[x, y], ...], p, { cor, largura })`: traço de caneta que se desenha (círculos, setas, sublinhados).
- `check(g, cx, cy, raio, p, cor)`: círculo de check que se desenha (`p <= 0` = círculo vazio).

**Fontes já carregadas:** `Inter` (100–900, interface e títulos), `Instrument Serif` (normal e itálico, títulos elegantes), `Archivo Black` (títulos pesados), `Permanent Marker` (escrita à mão), `Plex Mono` (700, etiquetas). Use no máximo duas por efeito.

## Padrões que funcionam

**Entrada de elemento:**
```js
const s = pop(k.t, 0.4);                               // aparece aos 0,4 s com um "pulo"
if (s > 0) emVolta(g, cx, cy, s, () => { /* desenha o elemento */ });
```

**Título que "bate" palavra por palavra:**
```js
const a = range(k.t, 0.2, 0.32);
if (a > 0) emVolta(g, 540, 300, lerp(1.4, 1, E.outCubic(a)), () => texto(g, 'Título', 540, 330, { tam: 110, peso: 800, alinhar: 'center' }));
```

**Algo atrás da pessoa:** desenhe o quadro, depois o elemento, depois `pessoa(g, k.recorte)`.

**Coisa grudada no rosto:** use `k.rosto.cx`, `k.rosto.topo`, `k.rosto.queixo`. Para algo "flutuando", some `Math.sin(k.t * 2 + fase) * 6`.

**Tremida de colagem (stop motion):** `const n = Math.floor(k.t * 12); const r = rnd(n + 900);` e use `r() - 0.5` para pequenos deslocamentos e rotações.

**Zoom de câmera:** `emVolta(g, k.rosto.cx, k.rosto.cy, 1 + 0.06 * E.inOut(k.p), () => { g.drawImage(k.quadro, 0, 0); ... })`. Aplique o mesmo zoom ao recorte, senão a pessoa "descola".

## Armadilhas conhecidas
- **Emoji** não tem fonte colorida no render. Desenhe ícones com formas simples, ou use texto.
- **Não existe DOM:** nada de `document`, `window`, `Image`, `fetch` ou `requestAnimationFrame`. Imagens entram por `EFEITO.imagens`; canvas extra por `novoCanvas()`.
- **Nada de estado entre quadros:** cada quadro é desenhado do zero e pode ser pedido fora de ordem.
- **`g.filter` e `g.shadowColor`** continuam ligados até você desligar. Use `g.save()` / `g.restore()` em volta.
- **`g.letterSpacing`** precisa de string com `px`. `texto()` já cuida disso.
- **Texto que não cabe:** use `caber()` e quebre em duas linhas. Nunca deixe sair da tela.
- **Outras pessoas no fundo** (plateia, telão, foto na parede) podem entrar no recorte. Olhe `visao.jpg`; se acontecer, prefira um trecho em que a pessoa esteja sozinha, ou um efeito que não troque o fundo inteiro.
- **Recorte com borda tremida:** se o fundo for parecido com a roupa ou o cabelo, prefira efeitos que não dependam tanto do recorte (texto acima da cabeça em vez de atrás).
- **Desempenho:** `blur` grande e `shadowBlur` em tela cheia deixam o render lento. Use em áreas pequenas.

## Comandos
```bash
bash scripts/efeito renderizar PASTA --folha              # 8 momentos -> checagem/folha.jpg
bash scripts/efeito renderizar PASTA --quadros 0.8,2.4    # quadros soltos -> checagem/
bash scripts/efeito renderizar PASTA --final              # vídeo inteiro com o efeito e o áudio original
```
Um erro no `efeito.js` aparece na saída do comando, com a linha e o instante. Corrija e rode de novo.
