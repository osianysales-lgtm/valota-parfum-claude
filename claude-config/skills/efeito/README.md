# /efeito: efeitos de vídeo criados pelo Claude

Arraste seu vídeo para o Claude, digite `/efeito` e o nome do efeito. O Claude cria o efeito **do zero** para o seu vídeo, confere o resultado e te entrega o MP4 pronto, com o seu áudio original.

## Onde funciona
- **Claude do navegador ou do app** (claude.ai), com a opção de execução de código ligada.
- **Claude Code**, no Mac (testado) ou no Linux. No Windows, pelo WSL.
- O Claude instala sozinho o que precisa (de 2 a 5 minutos): no Claude Code, só na primeira vez; no navegador, no começo de cada conversa nova.

## Instalar no Claude do navegador
1. No Claude (claude.ai), clique em **Configurações**.
2. Abra **Skills**.
3. Suba o arquivo `efeito.zip` como ele veio, sem descompactar.

Se travar na preparação, veja em Configurações se a execução de código está ligada.

O chat aceita vídeos de até cerca de **30 MB**. Se o seu for maior, mande só o trecho em que quer o efeito (corte no celular) ou exporte em 1080p.

## Instalar no Claude Code
**Jeito mais fácil:** abra o Claude Code, arraste o `efeito.zip` para o chat e escreva:

> Instala essa skill pra mim em ~/.claude/skills/efeito

**Pelo Terminal:** com o `efeito.zip` na pasta Downloads, cole:

```bash
mkdir -p ~/.claude/skills && unzip -o ~/Downloads/efeito.zip -d ~/.claude/skills/
```

Depois **feche e abra o Claude Code de novo**.

## Usar
1. Abra uma conversa no Claude (navegador, app ou Claude Code).
2. Arraste seu vídeo para o chat (vertical, você aparecendo, funciona melhor).
3. Digite o efeito:

```
/efeito vox
/efeito órbita dos 3 aos 6 segundos
/efeito ranking: melhores cafés da cidade
/efeito checklist quando eu falar "olha isso"
/efeito widgets-flutuantes, meu @ é @seuperfil
```

O Claude instala o que falta sozinho, depois prepara o vídeo, cria o efeito, confere alguns quadros (para não cobrir seu rosto nem cortar texto) e te entrega `seuvideo_efeito.mp4` para baixar (no Claude Code, ele fica ao lado do original).

## Os 7 estilos

| digite | o que acontece |
|---|---|
| `widgets-flutuantes` | cards de vidro fosco, como os widgets do iPhone, flutuam em volta da sua cabeça |
| `ranking` | uma tier list S-D sobe e cada item voa para a sua fileira; o campeão cai no S por último |
| `órbita` | seus vídeos giram em volta de você, passando na frente e por trás |
| `mural-de-reels` | uma frase grande no topo e seus reels flutuando atrás de você |
| `checklist` | um painel do Claude marca 5 etapas, e cada uma acontece na tela |
| `interface-de-app` | UI clara: pílulas azuis, cards com grade e um cursor clicando em Seguir |
| `vox` | colagem de papel estilo Vox: você recortado em P&B, marca-texto e caneta vermelha |

Também dá para pedir **qualquer outro efeito** com suas palavras ("/efeito neon com a palavra FOCO atrás de mim"). O Claude cria seguindo as mesmas regras de design.

## Dicas
- Efeitos de 3 a 5 segundos ficam melhores. Diga o trecho ("dos 2 aos 5 segundos") ou a palavra ("quando eu falar 'agora'").
- Para usar **seus reels** na órbita ou no mural, mande prints junto. Sem prints, o Claude usa momentos do próprio vídeo.
- Ranking, números e nomes devem ser os seus: diga quais são.
- Quer outro efeito no mesmo vídeo? É só pedir em seguida.
- Não gostou de algo? Diga o que viu ("cobre meu rosto", "muito rápido", "muda a cor") e o Claude refaz.

## Sinceridade
- Cada efeito é criado na hora, então **nenhum fica igual ao outro**.
- É uma primeira versão feita por IA: **assista antes de postar**.
- A skill não coloca música, legenda nem efeito sonoro. Adicione no editor que você usa.

## Créditos
Recorte da pessoa e detecção de rosto: [MediaPipe](https://github.com/google-ai-edge/mediapipe) (Apache 2.0). Desenho: [@napi-rs/canvas](https://github.com/Brooooooklyn/canvas) (MIT). Transcrição: [faster-whisper](https://github.com/SYSTRAN/faster-whisper) (MIT). Fontes: Inter, Instrument Serif, Archivo Black e IBM Plex Mono (SIL OFL), e Permanent Marker (Apache 2.0); as licenças estão em `modelo/fontes/`.
