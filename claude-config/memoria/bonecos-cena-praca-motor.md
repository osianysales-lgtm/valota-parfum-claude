---
name: bonecos-cena-praca-motor
description: "18/11 motor do Animador Zero ganhou cena:'praca' (ao ar livre) + pernas com joelho (anda/corre/senta/ajoelha), planos que seguem o boneco; projeto Bidaya episodio unico"
metadata:
  node_type: memory
  type: project
  originSessionId: 23d202c6-6d2c-4226-afc3-c99adff19e2a
  modified: 2026-11-18T22:14:30.924Z
---

Em 18/11/2026, pro episódio único da Bidaya (versão 2 ácida), ela pediu cenário ao ar livre com "mais paisagens, mais movimentação" e cuidado pra não cortar mostrando só cabeça/nuca. Construí no motor (`~/.claude/skills/animador-zero/motor/src/motor.js`, backup antes em `backup-antes-praca-1811/`):

- `cena: 'praca'`: céu com nuvens, gramado, caminho de pedra (eixo x, z 0.45), praça redonda com chafariz com água animada, banco principal em (0, -1.45), postes, ~110 árvores low poly balançando, canteiros, prédios no horizonte com neblina, carrinho de pipoca + pipoqueiro (`pipocaOlha` = janelas em que ele para e olha), 5 pessoas passando no fundo, pombos ciscando.
- Pernas com joelho em todos os bonecos (troca as pernas retas): `estado: { h: [[t0,t1,'senta'|'ajoelha'|'reverencia']] }`, andar com perna balançando via `mov: { h: { ini:[x,z], m:[[t0,t1,x,z]...] } }`, `yaw: [[t0,t1,ang,quem]]`.
- Planos com `rel: 'h'|'a'|'par'` acompanham o boneco. Planos da praça: DRONE, ALTARW, ALTAR, CHR, CBIA, CBIAW, DUO, OTSR/OTSA, BANCO/BANCOH/BANCOA, LOWSKY, PAIS, PIPO, POMBO, FRENTE, WIDE, TRAV/TRAVW, CTA, ORBP.

**Lição de câmera (nuca):** quem anda pra longe da câmera (pro banco, z negativo) fica de costas → nesses trechos cortar pra ALTARW (atrás do banco). Andando no caminho (+x), câmera na frente-direita (TRAV/CBIAW). Conferir prévia quadro a quadro antes de mostrar.

Projeto: `squads/@gabriel/squad-editor/output/bidaya-episodio-unico-praca/` (dialogo.json, roteiro.js, montar.py fator 1.25, voz 2:15). Gancho escrito "ELE AJOELHOU / PRA UM PERFUME" (ela pediu "pra um" escrito por extenso; na fala informal ok). Ver [[bonecos-direcao-cena]], [[bonecos-estrutura-absurdo-conflito-revelacao]], [[serie-bonecos-vozes-elenco]].

**Atualização 18/11 (versão final "tapete persa", projeto `output/bidaya-tapete-persa/`):** motor ganhou `tapete: {x,z,w,d}`, `altar: [x,y,z]` (frasco no chão), estados `chao` (sentado no chão, JOELHOS DOBRADOS — perna esticada aparecia gigante na frente da câmera) e `deita` (recostado), planos CHAOH/CHAOA/CTAH/DUOCH/TAPW/CBIAR. Vozes no **eleven_v3 "natural" (stability 0.5)** com tags de emoção ([whispers], [gasps], [sarcastic]...) — ela escolheu ouvindo teste A/B; `tools/dialogo.js` aceita `"modelo": "eleven_v3"` no dialogo.json e tira as tags das palavras/legenda. Voz ficou 1:21 no fator 1,25.
