# Padrão de edição: notas em PNG (referência @matheusueta)

Referências passadas pela Osiany em 07/11/2026 (só para estudar o estilo, não copiar):
- https://vt.tiktok.com/ZSpkWMeJT/: Majesty, Maison Asrar (107s)
- https://vt.tiktok.com/ZSpkWSKBm/: X Treme Oud, Assala (99s)
- https://vt.tiktok.com/ZSpknWXBw/: 1 Million Black, Rabanne (97s)

Os quadros de cada vídeo estão nesta pasta, em folhas de 2 quadros por segundo.

## Formato
- Vídeo vertical 1080x1920, com a pessoa falando direto para a câmera e segurando o frasco.
- Cortes secos a cada 1–3 s, alternando plano aberto (corpo inteiro) e plano fechado (rosto e frasco perto da lente). É isso que dá o ritmo.

## Legenda
- Uma palavra por vez ou blocos de 1 a 3 palavras, sincronizados com a fala.
- Fonte sans pesada e pequena (estilo Poppins/Inter SemiBold), branca, sem caixa de fundo e com sombra leve.
- Fica centralizada, na altura do peito (cerca de 55–60% da altura da tela), e não no rodapé.

## Notas olfativas: a assinatura do estilo
- Quando a pessoa FALA o nome de uma nota, a imagem da nota aparece em PNG recortado (sem fundo), fotorrealista: toranja cortada, laranja, bergamota, abacaxi em rodelas, âmbar, mineral/talco etc.
- Posição: canto superior esquerdo ou direito, do lado oposto à cabeça, sem cobrir o rosto. Ocupa cerca de 30–40% da largura.
- Várias notas citadas em sequência ficam EMPILHADAS (por exemplo, laranja em cima e bergamota embaixo) e somem juntas quando o assunto muda.
- A nota entra com um pop/scale rápido (0,15 s, com um leve overshoot), fica 2–4 s e sai cortando ou com um fade rápido.
- Se uma nota for "protagonista" (por exemplo, o abacaxi no 1M Black), ela pode aparecer grande e cortada pela borda da tela, inteira.
- Plano B, quando não houver PNG bom: uma foto em card com cantos arredondados (como a madeira de oud no vídeo 2).

## Frascos citados
- Quando ele cita OUTRO perfume (a inspiração ou um concorrente), o PNG do frasco desse perfume aparece flutuando no topo da tela, em pé.
- Ao comparar dois perfumes, os dois frascos aparecem lado a lado e depois fica só o que está sendo comentado.

## Cartela de título (apresentação do perfume)
- Começa com um flash branco de cerca de 2 quadros e entra num plano do frasco na mão, com o fundo desfocado.
- O NOME do perfume aparece enorme no topo, numa fonte grotesca extra-bold, na COR do frasco (azul Majesty, dourado Tygar, verde Vibrato), com um leve glow.
- Logo abaixo vem a MARCA, em fonte branca (**na Valota: Figtree 600 creme #F2E8D8, nunca fina**, para ninguém ter dificuldade de ler).
- Dura de 1 a 1,5 s por perfume.

## Ênfase
- Frases de impacto em CAIXA ALTA, numa fonte condensada bold (estilo Bebas/Anton), em amarelo (**para a Valota: Amarelo Laudo #FFC93C**, identidade oficial de 09/11/2026; o #FFE600 era o da referência): "VALE O BLIND", "VAMOS BORRIFAR!", "IRRETOCÁVEL". Elas entram palavra por palavra.
- Momento "Vamos borrifar": um bloco fixo de borrifo no pulso, em plano aberto.

## Áudio
- Uma música de fundo baixinha e constante sob a voz (o chão de áudio nas pausas fica em -35 a -45 dB, então a voz domina).
- Mapa de SFX que adotamos (com a biblioteca_audio/efeitos):
  - nota ou frasco entrando: pop_leve.mp3 (em notas empilhadas, um pop por nota)
  - flash branco ou cartela de título: whoosh_rapido.mp3 + shine_brilho.mp3
  - palavra amarela de ênfase: impact_grave.mp3
  - "vamos borrifar": spray_perfume.mp3
  - corte de plano aberto para fechado: whoosh_suave.mp3 (com moderação)

## Fonte das notas
- Sempre que a Osiany pedir, buscar a pirâmide olfativa em https://www.fragrantica.com.br/ pelo navegador Playwright, porque curl e fetch levam 403 da Cloudflare.
- Busca: /busca/?query=<nome>, abrindo o link /perfume/<Marca>/<Nome>-<id>.html.
- Nas seções h4 "NOTAS DE TOPO / CORAÇÃO / BASE", as imagens têm alt = nome da nota, e as miniaturas ficam em fimgs.net/mdimg/sastojci/t.<id>.jpg. Elas são pequenas e servem só como referência, não para o vídeo.
- O PNG final de cada nota vem de uma foto real buscada no Google Imagens, com o fundo removido por tools/recorte.js.
