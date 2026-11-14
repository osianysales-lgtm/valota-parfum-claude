# Formato do roteiro.js

O `roteiro.js` fica na pasta do projeto e é um módulo JavaScript que exporta um objeto. O motor lê esse arquivo para saber o que cada personagem faz, onde a câmera está, o que aparece na tela do computador e quais textos sobem por cima do vídeo. Comece sempre copiando `exemplos/blender/roteiro.js`.

```js
import { TW, TH, MF, G, INK, MUT, ACC, RED, YEL, CY, PK, avatar, stamp, rowCheck, badge, grid, bills, money } from '/src/cartoes.js';

export default {
  dur: 37.5,
  heroi: { ... }, robo: { ... },
  lines: [ ... ],
  cuts: [ ... ],
  cards: [ ... ],
  feio: [8.88, 14.12],      // opcional
  acoes: [ ... ],           // opcional
  claude: { ... },          // opcional
  textos: { ... },          // opcional
};
```

Todos os tempos são em segundos a partir do início do áudio, com duas casas (os mesmos do `falas.txt`).

## dur

A duração total do `info.txt` (o áudio já tem 1,5 s de folga no fim). O vídeo escurece sozinho no último segundo.

## lines (falas e legendas)

```js
[início, fim, quem, 'legenda', { g: 'gesto', e: 'expressão', hr: 'reação do personagem', ar: '' }]
```

- **quem**: `'h'` personagem principal, `'c'` robô.
- **legenda**: HTML curto. `<br>` quebra linha (no máximo 2 linhas, até uns 28 caracteres cada), `<b>` destaca (amarelo nas falas do personagem, branco nas do robô, que aparecem em itálico laranja).
- **g** (gesto do personagem, só quando ele fala): `up` (braços pra cima, comemorando), `point` (aponta), `shrug` (ombros), `no` (balança a cabeça), `chest` (mão no peito), `think` (mão no queixo), `beg` (implorando), `annoy` (bravo, braços cruzados), `shock` (susto), `one` (dedo pra cima, "uma coisa").
- **e** (expressão): `happy`, `proud`, `conf` (confuso), `sus` (desconfiado), `off` (de mau humor), `sad`.
- **hr** (expressão do personagem enquanto o robô fala): os mesmos valores de `e`.

Quebre frases longas em duas entradas, usando o tempo das palavras do `falas.txt`. A boca mexe sozinha com o volume da voz de quem está falando naquele intervalo.

## cuts (câmera)

```js
[[0, 'EST'], [2.05, 'LOWH'], [5.0, 'CC'], ...]
```

Cada entrada diz a partir de quando vale aquele plano. Os planos já têm movimento (aproximação lenta, órbita, leve câmera na mão).

| Plano | O que mostra | Quando usar |
|---|---|---|
| `EST` | Plano geral do quarto com lente aberta, aproximando | Abertura, título |
| `CH` | Close médio do personagem | Ele falando |
| `LOWH` | Personagem visto de baixo (poderoso) | Frase de impacto dele |
| `MOUTH` | Close bem fechado no rosto | Detalhe, piada, "a boca mexe" |
| `CC` | Close do robô | Robô falando |
| `OTS` | Os dois de lado, pela direita | Conversa, reação |
| `ORB` / `ORB2` | Câmera girando em volta dos dois | Momento grande, lista de coisas |
| `W2` | Os dois de corpo inteiro, lente aberta | Respiro, comparação |
| `REV` | Plano geral que avança rápido | Logo depois de uma revelação |
| `SCR` | A tela do computador (personagens somem) | Quando o cartão da tela é o assunto |
| `SCRE` | A tela aproximando devagar | Final com a chamada para ação |
| `UG` / `UGH` / `UGC` | Planos parados (geral, personagem, robô) | Dentro do trecho `feio` |

Regra boa: um corte a cada fala, nunca o mesmo plano duas vezes seguidas, `SCR` sempre que o cartão tiver texto importante (fica pelo menos 1,5 s para dar tempo de ler).

## cards (tela do computador)

```js
[início, 'cor de fundo', (t, h) => { ...desenho... }]
```

A tela é um canvas de 1100 x 770 (`TW`, `TH`). Cada cartão vale do seu início até o próximo; o primeiro precisa começar em 0. Use um cartão novo em cada `SCR`. Ferramentas do `h`:

- `h.x`: o contexto 2D do canvas (tudo do Canvas 2D funciona).
- `h.fnt(px, peso, família)`: define a fonte. Use `MF` (Montserrat) para títulos: `h.fnt(96, 900, MF)`.
- `h.txt(texto, x, y, cor, alinhamento)`: escreve. Alinhamento `'left'`, `'center'` ou `'right'`.
- `h.box(x, y, w, h, raio, preenchimento, borda, espessura)`: retângulo arredondado.
- `h.pop(t, t0, duração)`: de 0 a 1 com "pulo" a partir de `t0` (para escalar coisas aparecendo).
- `h.sm(a, b, t)`: de 0 a 1 suave entre `a` e `b` (para números subindo, barras enchendo, texto sendo digitado).

Ajudantes prontos em `/src/cartoes.js`: `avatar(h, x, y, r, 'h'|'c')` (rostinho do personagem ou do robô), `stamp(h, t, t0, 'TEXTO', x, y, tamanho, rotação)` (carimbo vermelho), `rowCheck(h, t, t0, 'item', y)` (linha de checklist que marca), `badge(h, n, 'título')`, `grid(h)`, `bills(h, t)` (notas caindo), `money(n)`. Cores: `G` verde, `INK` branco, `MUT` cinza, `ACC` laranja, `RED`, `YEL`, `CY` ciano, `PK` rosa.

Ideias que funcionam: pedido sendo digitado num chat, número de views subindo, barra de progresso com "LEVEL UP", lista com checks, palavra gigante a cada impacto, código aparecendo linha a linha, carimbo "NUNCA", a palavra da chamada para ação enorme no final. Os 10 cartões do exemplo cobrem quase tudo isso.

## heroi e robo

O visual escolhido pela pessoa. Campos e tabelas de cor: `references/personagens.md`.

## feio (opcional)

`[início, fim]`: o trecho "sem a skill". Tudo vira cinza chapado, sem luz, sem foco, sem trilha boa. Use quando o roteiro tem um antes/depois. Coloque um `flash` no início e outro no fim, e planos `UG`, `UGH`, `UGC` dentro dele.

## acoes (opcional)

`[início, fim, 'ação']` para o personagem: `acena`, `orgulho` (queixo erguido), `olhaClaude`, `olhaCamera`, `pula`, `comemora`, `triste`, `pensa`.

## claude (opcional)

```js
claude: { giros: [14.15], timido: [[11.7, 12.5]], risada: [[31.9, 32.6]], pula: [[20, 21]] }
```

`giros`: o robô dá uma volta inteira a partir daquele tempo (ótimo numa revelação). `timido`: abaixa o olhar e fecha os olhos. `risada`: treme rindo. `pula`: quica no ar.

## textos (opcional, por cima do vídeo)

```js
textos: {
  titulo: { texto: 'BLENDER', t0: 0.15, t1: 2.15, riscar: 0.95 },   // riscar: quando o risco vermelho passa (ou tire)
  comentarios: { itens: ['é Blender?', 'qual programa???'], t0: 2.1, t1: 5.0 },   // balões de comentário subindo (até 6)
  etiquetas: [[8.88, 14.12, 'SEM A SKILL', 'ruim'], [14.12, 16.4, 'COM A SKILL', 'bom']],
  flashes: [8.88, 14.12],     // clarão branco
  apagao: [22.56],            // as luzes piscam e voltam (ex.: na palavra "luz")
},
```

## trilha.json

```json
{ "dur": 37.5, "titulo": 0.28, "risco": 0.95, "digitando": [6.35, 7.95], "feio": [8.88, 14.12], "vergonha": [11.72],
  "revelacao": 14.12, "contador": [15.7, 17.7], "impactos": [21.9, 22.56, 23.18, 23.9], "viradas": [19.05, 24.4],
  "respiro": [29.1, 32.7], "final": 32.72 }
```

- `dur` igual ao do roteiro. `titulo`: impacto da abertura (ou `null`). `risco`: segundo impacto (quando o título é riscado).
- `digitando`: som de teclado. `contador`: tiques subindo (número de views).
- `feio` + `vergonha`: musiquinha barata e um "uoon" de vergonha.
- `revelacao`: a subida e o BOOM. Sem `feio`, use o momento da virada da história.
- `impactos`: uma pancada em cada palavra-chave (clique de câmera, interruptor, vento e um boom grave no último).
- `viradas`: um "vush" curto em cortes importantes.
- `respiro`: a trilha some e fica só um tapete suave (para uma frase emocional ou piada antes do final).
- `final`: o boom da chamada para ação.
