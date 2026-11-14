# Solução de problemas

## "FALTA: Node.js" / "FALTA: ffmpeg"
Instale com o comando que o `setup.py` mostrou (peça o ok da pessoa e rode você mesmo). No Windows, depois de instalar, pode ser preciso fechar e abrir o Claude para o programa aparecer. Rode o `setup.py` de novo para confirmar.

## "FALTA: Google Chrome ou Microsoft Edge"
O motor usa o navegador de forma invisível para desenhar os quadros. No Windows o Edge já vem instalado; se ele não for encontrado, instale o Chrome. Se o navegador estiver num lugar diferente, defina a variável `CHROME_PATH` com o caminho do executável antes de rodar o `render.mjs`.

## "[ERRO NO ROTEIRO] ..." ou "A cena não carregou"
É quase sempre um erro de digitação no `roteiro.js`: vírgula faltando, aspas abertas, colchete sem fechar, nome de plano que não existe. Leia a mensagem (ela diz a linha), corrija e rode a prévia de novo. Para isolar, comente os cartões novos e teste.

## A prévia sai preta ou cinza
- Todo cinza: o tempo escolhido está dentro do trecho `feio`. Confira os tempos.
- Preto no começo e no fim: é o fade de entrada e saída (normal em 0 s e no último segundo).
- Preto o tempo todo: a placa de vídeo não foi usada. Atualize o driver de vídeo e feche outros programas pesados. Em notebooks com duas placas, defina o Chrome para usar a placa de alto desempenho nas configurações de gráficos do Windows.

## O render está muito lento
Cada quadro é desenhado 10 vezes para ter desfoque de movimento e sombras suaves, então o render pede uma placa de vídeo. Numa placa comum, conte uns 10 s por segundo de vídeo. Sem placa dedicada pode passar de 1 minuto por segundo de vídeo: avise a pessoa e deixe rodando em segundo plano. Se for interrompido, rode de novo (ele recomeça o vídeo).

## A boca não mexe ou mexe na hora errada
Confira os tempos de início e fim das `lines`: a boca só mexe dentro do intervalo de quem está falando. Os tempos precisam vir do `falas.txt`.

## A transcrição errou palavras
Corrija só o texto das legendas no `roteiro.js`; os tempos continuam valendo. Em áudio com muito eco ou música, rode o `novo.py` de novo com `--modelo large-v3` (mais lento e mais preciso).

## A trilha está alta ou baixa
`python scripts/finalizar.py <projeto> --volume-trilha -14` (mais baixa) ou `-8` (mais alta). Sem trilha: `--sem-trilha`.

## O personagem saiu com uma cor estranha
Confira os códigos hexadecimais em `heroi` e `robo` (precisam ter `#` e 6 dígitos). Gere um quadro de prévia para conferir antes de renderizar.
