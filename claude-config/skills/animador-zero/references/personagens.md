# Personagens: opções e cores

O personagem principal é um jovem low poly de moletom com capuz. O parceiro é um robô flutuante com tela de olhos. Os campos abaixo vão no `roteiro.js` (`heroi` e `robo`) e no `~/.animador-zero/personagem.json`.

## Campos

```js
heroi: {
  capuz: '#1fa79c',        // cor do moletom
  capuzEscuro: '#178178',  // opcional: tom das sombras do moletom (se faltar, usa o mesmo do capuz)
  pele: '#f3bea6',
  nariz: '#e2a48e',        // opcional: um tom um pouco mais escuro que a pele
  cabelo: '#2b1b22',
  calca: '#242a4c',
  bone: '#1d1d28',         // opcional: coloca um boné dessa cor (tira a franja)
  oculos: true,            // opcional: true (armação preta) ou uma cor, ex. '#c9a24a'
  fone: false,             // opcional: false tira o fone de ouvido
},
robo: { cor: '#ea744b' },  // cor do corpo do robô
```

## Visuais prontos

| Nome | capuz | pele | cabelo | calca | extras |
|---|---|---|---|---|---|
| Clipador (padrão) | `#1fa79c` | `#f3bea6` | `#2b1b22` | `#242a4c` | fone |
| Streamer | `#7b3cff` | `#d9a07a` | `#141414` | `#1d1d28` | boné `#1d1d28` |
| Hacker | `#23232b` | `#f3bea6` | `#141414` | `#15151c` | óculos |
| Solar | `#f2b632` | `#c48a66` | `#2b1b22` | `#2c3e66` | — |
| Fogo | `#d23a3a` | `#8a5a3c` | `#141414` | `#1c1c26` | boné `#f5f4ef` |

## Tons de pele (com o nariz correspondente)

| Tom | pele | nariz |
|---|---|---|
| clara | `#f3bea6` | `#e2a48e` |
| média | `#d9a07a` | `#c48a66` |
| morena | `#c48a66` | `#ae7653` |
| negra | `#8a5a3c` | `#74492f` |

## Cores de moletom

verde-água `#1fa79c` · roxo `#7b3cff` · preto `#23232b` · amarelo `#f2b632` · vermelho `#d23a3a` · azul `#2f6fe0` · rosa `#ff5fa2` · branco `#e9e6df`

## Cabelo

castanho escuro `#2b1b22` · preto `#141414` · loiro `#d8b36a` · ruivo `#a8452e` · castanho claro `#6a4428`

## Robô

coral `#ea744b` (padrão) · azul `#4f8bff` · verde `#3fbf7f` · roxo `#9b6bff` · amarelo `#ffc24a` · branco `#e9e6df`

Se a pessoa disser uma cor com palavras ("vinho", "verde militar"), escolha um hexadecimal próximo e mostre na prévia.
