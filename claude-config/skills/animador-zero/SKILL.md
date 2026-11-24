---
name: animador-zero
description: Transforma o áudio de uma conversa (gerado no ElevenLabs ou gravado) em um vídeo vertical 3D cinematográfico, com personagem low poly e um robô assistente conversando num quarto realista iluminado pelo sol, boca mexendo com a voz, cortes de câmera a cada fala, telas animadas, legenda e trilha sonora original. Use sempre que a pessoa pedir para animar um áudio, fazer um vídeo 3D, um reels com personagem, "um vídeo igual aos do perfil", "transforma esse áudio em vídeo", ou mencionar o Animador Zero. Também use para escrever o roteiro da conversa para o ElevenLabs e para instalar ou conferir a instalação ("instala o Animador Zero").
---

# Animador Zero

Você vai fazer o trabalho de um animador 3D: pegar o áudio de uma conversa entre o personagem e o robô, montar a cena, dirigir a câmera, a luz e as telas, renderizar e entregar o vídeo pronto para postar.

Quem usa esta skill normalmente não sabe programar. Fale em português simples, sem jargão, e nunca peça para a pessoa rodar comando ou editar arquivo: você faz tudo.

## Combinados que não mudam

1. **O personagem é escolhido pela pessoa** (Passo 1). Nunca comece a animar sem ter perguntado.
2. **Nada é renderizado sem a pessoa ver a prévia.** O render inteiro leva minutos; a prévia leva segundos.
3. **Diga a verdade sobre o resultado.** Se a transcrição errou uma palavra, se um plano ficou estranho, se algo falhou, avise. Não prometa views nem ganhos.
4. **Sem marcas de terceiros.** Não coloque logos de empresas, marcas ou personagens de outras pessoas nas telas do vídeo. O robô é um personagem original; pode ser chamado de "Claude" nas falas e legendas, mas não use o logo da Anthropic.
5. **Legenda é obrigatória.** Todo vídeo com fala sai com legenda na tela, do começo ao fim de cada fala. Confira na prévia e no vídeo final; sem legenda não entrega.

## Onde ficam as coisas

Tudo fica na pasta desta skill. Use sempre o caminho completo. Rode Python com `python` (Windows) ou `python3` (Mac/Linux).

| O quê | Para quê |
|---|---|
| `scripts/setup.py` | Confere e instala o que falta (`--instalar`) |
| `scripts/novo.py <áudio>` | Cria a pasta do projeto, limpa o áudio e transcreve com o tempo de cada palavra |
| `scripts/previa.py <projeto> <tempos...>` | Gera quadros de prévia e a folha `previa.jpg` |
| `motor/render.mjs` | Renderiza o vídeo: `node motor/render.mjs <projeto> video` |
| `scripts/finalizar.py <projeto>` | Compõe a trilha, mixa com a voz e gera os arquivos finais |
| `exemplos/blender/` | Um projeto completo de exemplo (`roteiro.js` + `trilha.json`) para copiar e adaptar |
| `references/` | Formato do roteiro, personagens, como escrever a conversa, problemas comuns |

A pasta do projeto (`animador-<nome>/`) fica ao lado do áudio original.

## Passo 0: conferir a instalação

Na primeira vez (ou se algum script reclamar), rode `scripts/setup.py`. Ele lista o que está OK e o que FALTA.

- Falta o motor 3D ou o transcritor: rode `setup.py --instalar` (instala as dependências do motor e cria um ambiente próprio em `~/.animador-zero`, sem mexer no resto do computador). Leva alguns minutos.
- Falta Node.js, ffmpeg ou Chrome: o `setup.py` mostra o comando de instalação. Avise a pessoa do que vai ser instalado, peça o ok e rode você mesmo. No Windows, depois de instalar Node ou ffmpeg pode ser preciso fechar e abrir o Claude.

Problemas: `references/solucao-de-problemas.md`.

## Passo 1: escolher o personagem (sempre perguntar)

Antes de qualquer coisa, veja se existe `~/.animador-zero/personagem.json`. Se existir, mostre o visual salvo e pergunte se quer manter ou mudar. Se não existir, pergunte. Use a ferramenta de perguntas com opções se ela estiver disponível; se não, pergunte em texto, uma coisa por vez, sempre oferecendo opções prontas:

1. **Ponto de partida**: um dos visuais prontos (Clipador, Streamer, Hacker, Solar, Fogo) ou montar do zero.
2. **Tom de pele**: clara, média, morena ou negra.
3. **Cor do moletom**: verde-água, roxo, preto, amarelo, vermelho, azul ou outra cor que a pessoa disser.
4. **Cabelo**: castanho escuro, preto, loiro, ruivo ou outra cor.
5. **Acessórios** (pode marcar vários): boné, óculos, sem fone de ouvido.
6. **Cor do robô**: coral (padrão), azul, verde, roxo, amarelo ou branco.

Agrupe as perguntas para não cansar: ponto de partida e cores juntos, acessórios e robô juntos.

A tabela de cores de cada opção e dos visuais prontos está em `references/personagens.md`. Depois de escolher, grave em `~/.animador-zero/personagem.json` (os mesmos campos `heroi` e `robo` do roteiro) e use no roteiro de todos os vídeos dessa pessoa até ela pedir para mudar.

Assim que tiver o áudio e o projeto (Passos 2 e 3), gere **um quadro de prévia** com o personagem escolhido e mostre a imagem para confirmar o visual antes de seguir.

## Passo 2: o áudio

A pessoa precisa de um áudio com a conversa entre o personagem e o robô (MP3 ou WAV). O jeito mais comum é gerar no ElevenLabs.

- Se ela já tem o áudio, peça o arquivo (ou o caminho).
- Se ela ainda não tem, ofereça escrever o roteiro da conversa pronto para colar no ElevenLabs. Siga `references/roteiros.md`: entregue o bloco completo, com uma tag de emoção por frase, e as falas do robô em sussurro.

Lembre uma vez: a voz precisa ser de uma ferramenta ou pessoa que ela tenha direito de usar.

## Passo 3: preparar o projeto

```
python scripts/novo.py "C:/caminho/audio.mp3" --nome nome-curto
```

Isso cria a pasta do projeto com `voz.wav`, `env.json` (a boca mexe com ele), `falas.json`, `falas.txt` e `info.txt` (duração total). Leia `falas.txt`: cada frase tem o tempo de início e fim, e cada palavra tem o tempo exato entre colchetes.

Confira a transcrição com o roteiro que a pessoa usou (se você escreveu, compare com o seu texto). Corrija as palavras nas legendas; os tempos da transcrição continuam valendo.

## Passo 4: dirigir o vídeo (escrever o roteiro.js e o trilha.json)

Copie `exemplos/blender/roteiro.js` e `exemplos/blender/trilha.json` para a pasta do projeto e reescreva para o áudio novo. O formato completo de cada campo está em `references/roteiro.md`. O essencial:

- **dur**: a `duracao_total` do `info.txt`.
- **lines**: uma entrada por frase, com início e fim tirados do `falas.txt`, quem fala (`h` = personagem, `c` = robô), a legenda (até 2 linhas curtas, `<br>` para quebrar, `<b>` nas palavras fortes) e gesto ou expressão.
- **cuts**: troque de plano a cada fala ou a cada 1 a 3 segundos. Comece num plano geral (`EST`), alterne closes de quem fala (`CH`, `CC`), use `SCR` quando a tela do computador mostrar algo importante, `ORB`/`W2`/`REV` nos momentos grandes e `SCRE` no final com a chamada.
- **cards**: o que aparece na tela do computador em cada momento (textos, números subindo, listas, código, o pedido sendo digitado). Cada cartão é uma função de desenho; copie os do exemplo e adapte.
- **heroi** e **robo**: o visual escolhido no Passo 1.
- **feio**, **textos**, **acoes**, **claude**: opcionais, para antes/depois, título na tela, comentários flutuando, etiquetas, flashes, luz piscando, acenos e reações.
- **trilha.json**: os tempos da trilha (revelação, impactos nas palavras-chave, respiro, final).

Pense como diretor: o gancho nos 2 primeiros segundos, um momento de virada, uma imagem forte para cada frase importante e a chamada clara no fim.

## Passo 5: prévia e aprovação

```
python scripts/previa.py <projeto> 0.5 3 6 9 12 15 20 25 30
```

Escolha de 6 a 10 tempos que cubram os planos diferentes. Olhe a `previa.jpg` você mesmo: confira se ninguém está cortado, se a tela está legível, se as legendas não cobrem nada importante. Corrija o que precisar e só então mostre a imagem para a pessoa, explicando em uma frase o que cada quadro mostra. Ajuste o que ela pedir.

### Bonecos (série 3D): checklist OBRIGATÓRIO antes do render

Um render de bonecos leva perto de 1h30 neste Mac (dividir em partes não acelera, a placa de vídeo é uma só). Cada erro que passa custa mais 1h30 dela. Por isso, antes de todo render, rode:

```
python3 scripts/qa_bonecos.py <projeto> <fins das caminhadas> <momentos em que os dois ficam perto> <ações com objeto>
```

Ele tira 1 quadro no meio de **cada corte**, mede o brilho e monta `previa/qa.jpg`. Olhe **todos** os quadros e só renderize se passar nos 4 pontos:

1. **Luz não "pisca".** Para ela, "piscando" é a diferença de brilho entre um corte e outro, não a luz mudando dentro do plano. Nenhum plano pode sair marcado em vermelho (fora de mediana ±12). No quarto, ajuste com `quarto.expShot`. Os closes do mural com spot saem quase o dobro mais claros que o quarto. Mantenha também `semSoco: true`, sem bloom, raios de sol e poeira.
2. **Ninguém anda por cima, atravessa, encosta ou entrelaça braço com ninguém**, nem em pé nem sentado. Deixe pelo menos ~1,1 de distância entre os dois (sentados na cama também), e os caminhos do `mov` não se cruzam.
3. **Nenhum plano mostra só um pedaço de corpo sem contexto**, como ombro, nuca, braço ou parede/móvel tampando. Se a câmera ficar atrás de um boneco ou dentro de um móvel, mude a câmera ou tire o boneco do caminho. Nos closes de objeto (fotos do mural), a câmera fica entre o objeto e o boneco, e ninguém aponta pra dentro do quadro.
4. **Objeto citado na fala aparece** no quadro, como o perfume na gaveta.

## Passo 6: renderizar

```
node motor/render.mjs <projeto> video
```

Rode **em segundo plano**. Leva perto de 10 segundos de render para cada segundo de vídeo numa placa de vídeo comum (um vídeo de 40 s fica pronto em uns 6 a 8 minutos; sem placa de vídeo dedicada pode demorar bem mais). Acompanhe pelo `progresso.txt` do projeto e avise a pessoa de tempos em tempos, sem encher a conversa.

Depois:

```
python scripts/finalizar.py <projeto>
```

Isso compõe a trilha original (sintetizada, sem música de terceiros), mixa com a voz (a trilha abaixa sozinha quando alguém fala) e grava em `prontos/`: o vídeo em alta qualidade, uma versão leve para celular e uma versão sem trilha. Se a pessoa achar a trilha alta ou baixa, rode de novo com `--volume-trilha -14` (mais baixa) ou `-8` (mais alta).

Antes de entregar, extraia um quadro do vídeo final e olhe: confira que saiu igual à prévia.

## Passo 7: entregar

Diga onde estão os arquivos e mande o vídeo se puder. Sugira uma legenda para o post e uma chamada nos comentários. Ofereça ajustes: trocar um plano, mudar uma legenda, outra cor de personagem, trilha mais baixa.
