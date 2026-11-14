// Serie de bonecos "Cobrar pra cheirar?" · PARTE 3 "O Seu Valdir se explica" (ROTEIRO FINAL 14/11/2026)
// Loja; a plaquinha ja esta la e vira "CHEIRAR E GRATIS" depois do "eu voltei, nao voltei?".
import { TW, TH, MF } from '/src/cartoes.js';
import { criaRoteiro } from '/src/bonecos.js';
import { DUR, FALAS } from '/projeto/tempos.js';

const { ini, fim, tw, blocos } = criaRoteiro(FALAS, {
  fortes: ['conversar', 'aluguel', 'imposto', 'luz', 'internet', 'espanta', 'graça', 'decant', 'amostrinha', 'atende', 'bem', 'plaquinha', 'voltei', 'terceiro', 'melhor', 'final', 'roubada', 'milenar', 'valota', 'parfum'],
});

const tTroca = fim(6) + 0.55;
const tInternet = tw(1, 'todo'), tEspanta = tw(2, 'só'), tAmostra = tw(4, 'porque'), tMilenar = tw(10, 'então');
const CREME = '#F3E9DA', PETROLEO = '#0F2E33', AMBAR = '#D49A4E', VERMELHO = '#b8322a', BERGAMOTA = '#B8BC5C';

export default {
  dur: DUR,
  heroi: { capuz: '#1fa79c', capuzEscuro: '#178178', pele: '#f3bea6', nariz: '#e2a48e', cabelo: '#141414', calca: '#1c1c26', fone: false },
  elenco: { h: 'Rafa', a: { nome: 'Seu Valdir', pele: '#e9b693', camisa: '#D49A4E', parede: '#0A1F23', cabelo: '#cfcac2', calca: '#3b3a45', idoso: true, bigode: true } },
  cena: 'loja',
  placa: { t0: -1, troca: tTroca, torta: -0.13 },
  props: { frasco: [[fim(9) - 0.3, DUR]] },

  lines: [
    ...blocos(0, { e: 'happy', ar: 'sus' }),
    ...blocos(1, { e: 'off', hr: 'sad' }),
    ...blocos(2, { g: 'one', e: 'happy', ar: 'conf' }),
    ...blocos(3, { g: 'shrug', e: 'sad', hr: 'conf' }),
    ...blocos(4, { g: 'point', e: 'happy', ar: 'conf' }),
    ...blocos(5, { e: 'sus', hr: 'happy' }),
    ...blocos(6, { g: 'shrug', e: 'proud', ar: 'happy' }),
    ...blocos(7, { g: 'point', e: 'happy', ar: 'happy' }),
    ...blocos(8, { e: 'sus', hr: 'happy' }),
    ...blocos(9, { e: 'proud', ar: 'happy' }),
    ...blocos(10, { e: 'happy' }),
  ],

  acoes: [
    [0, ini(3), 'bracos', 'a'],
    [ini(3), fim(3), 'pensa', 'a'],
    [fim(6) + 0.05, tTroca + 0.4, 'arranca', 'a'],
    [tTroca + 0.4, DUR, 'sorriso', 'a'],
    [ini(10) - 0.1, DUR, 'olhaCamera', 'h'],
  ],

  cuts: [
    [0, 'EST'], [ini(0) + 2.0, 'CH'],
    [ini(1) - 0.05, 'CV'], [tInternet - 0.05, 'LOWV'],
    [ini(2) - 0.05, 'CH'], [tEspanta - 0.05, 'OTS'],
    [ini(3) - 0.05, 'MOUTHV'],
    [ini(4) - 0.05, 'LOWH'], [tAmostra - 0.05, 'W2'],
    [ini(5) - 0.05, 'CV'],
    [ini(6) - 0.05, 'MOUTH'],
    [fim(6) + 0.05, 'OTS'], [tTroca + 0.15, 'SCR'],
    [ini(7) + 1.4, 'CH'],
    [ini(8) - 0.05, 'MOUTHV'],
    [ini(9) - 0.05, 'ORB'],
    [ini(10) - 0.1, 'CAMH'],
  ],

  cards: [
    [0, CREME, (t, h) => {
      const x = h.x;
      h.box(26, 26, TW - 52, TH - 52, 28, null, PETROLEO, 10);
      h.fnt(84, 900, MF); h.txt('EXPERIÊNCIA', TW / 2, 200, PETROLEO, 'center'); h.txt('OLFATIVA', TW / 2, 295, PETROLEO, 'center');
      h.box(TW / 2 - 330, 345, 660, 210, 30, AMBAR);
      h.fnt(170, 900, MF); h.txt('R$ 29,90', TW / 2, 510, PETROLEO, 'center');
      h.fnt(48, 700, MF); h.txt('se não comprar', TW / 2, 640, VERMELHO, 'center');
      x.save(); x.globalAlpha = 0.18; x.fillStyle = PETROLEO; for (let i = 0; i < 40; i++) x.fillRect((i * 97) % TW, (i * 53) % TH, 3, 3); x.restore();
    }],
    [tTroca, CREME, (t, h) => {
      h.box(26, 26, TW - 52, TH - 52, 28, null, PETROLEO, 10);
      h.fnt(150, 900, MF); h.txt('CHEIRAR', TW / 2, 300, PETROLEO, 'center');
      h.box(TW / 2 - 300, 360, 600, 200, 30, BERGAMOTA);
      h.fnt(150, 900, MF); h.txt('É GRÁTIS', TW / 2, 515, PETROLEO, 'center');
      h.fnt(46, 700, MF); h.txt('pode cheirar à vontade 🙂', TW / 2, 650, PETROLEO, 'center');
    }],
  ],

  textos: {
    gancho: { linhas: ['O DONO DA LOJA<br>SE EXPLICOU', ''], t1: 8.0 },
    selo: { texto: 'PARTE 3', t0: 0 },
    fim: { linhas: ['PRÓXIMA<br>HISTÓRIA', 'no próximo episódio dos bonecos 🎬'], t0: ini(10) },
  },
};
