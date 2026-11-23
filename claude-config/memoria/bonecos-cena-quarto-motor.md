---
name: bonecos-cena-quarto-motor
description: "21/11 motor do Animador Zero ganhou cena:'quarto' (quarto do Rafa: cama, criado-mudo c/ gaveta, porta, mural de barbante, cafés); projeto parceria-paga-quarto"
metadata:
  type: project
---

Em 21/11/2026, no episódio "Parceria paga · O mural da conspiração", ela pediu o QUARTO do Rafa no lugar do escritório ([[bonecos-direcao-cena]]). Ganhou `cena: 'quarto'` no motor `~/.claude/skills/animador-zero/motor/src/motor.js` (backup antes: `backup-antes-quarto-2111/`), com cores da paleta:
- Base: parede creme, cama com edredom petróleo e cabeceira cedro, arrumada e com barbante, tesoura e fotos em cima. Tem criado-mudo cedro com gaveta âmbar que abre (`V.quarto.gaveta`) e abajur. A porta na parede direita abre (`V.quarto.porta`) pra um corredor. Também tem guarda-roupa, prateleira de frascos, quadro, mesinha com notebook embaixo da janela e tapete âmbar. O céu é de manhã.
- Cafés: 2 na mão da Bia; um passa pro Rafa (`entrega`) e depois fica no criado-mudo (`pousa`).
- Mural: quadro de cortiça âmbar desenhado em canvas, com 4 polaroids de bonecos genéricos, etiquetas legíveis e barbante 3D pimenta até a foto do centro, "O FAMOSO". `destaque: [[t0, t1, idx]]` acende a foto mencionada (9 = centro). `prende` faz o barbante seguir a mão até a hora de prender. `fotoMao`/`fotoPin`/`fotoX` = foto separada pregada fora do mural.
- Movimento reaproveitado da praça (`mov`, `estado` 'senta', `yaw`), com `sentaDy` pra sentar na beirada da cama. Ações novas: aponta, prende, entrega, bebe, gaveta.
- Planos: PORTA, EST, MURALW, MURALF, MC, M1–M4, CHR/CHL, CBIA, DUO, DUOW, GAV, BED/BEDW/BEDH/BEDA, FOTO, CTA, SCR.

**Lições da prévia:** câmera atrás do Rafa (GAV/FOTO) mostrava só a nuca, então a câmera fica do lado pra onde ele olha. Personagens a menos de ~1,2 de distância na diagonal se sobrepõem no DUO. A tela do celular do Rafa sentado pegava os fios da cama na frente, então o review passou pro celular da Bia.

Projeto: `squads/@gabriel/squad-editor/output/parceria-paga-quarto/`. `montar.py` foi restaurado do git em `squad-editor/output/montar.py` (a pasta `output` tinha sido esvaziada). Em 21/11 os créditos do ElevenLabs acabaram (cota de 40 mil) e as falas 19 (conclusão) e 20 (CTA) ficaram sem voz. As 18 primeiras estão no cache `falas/`; pra completar, rodar dialogo.js com `dialogo.json` (20 falas), depois montar.py 1.25 e renderizar o trecho final.
