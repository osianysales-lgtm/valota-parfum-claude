// Serie de bonecos "Cobrar pra cheirar?" · PARTE 1 "Vai levar?" (ROTEIRO FINAL 14/11/2026)
import { TW, TH, MF } from '/src/cartoes.js';
import { criaRoteiro } from '/src/bonecos.js';
import { DUR, FALAS } from '/projeto/tempos.js';

const { ini, fim, tw, achar, blocos } = criaRoteiro(FALAS, {
  fortes: ['levar', 'terceiro', 'cansa', 'oito', 'onde', 'cartão', 'virar', 'vinte', 'nove', 'noventa', 'experiência', 'olfativa', 'plaquinha', 'ar', 'brincadeira', 'paga', 'decant', 'procon', 'valota', 'parfum', 'verdade'],
});

const tPlaca = tw(4, 'vinte'), tExp = tw(4, 'experiencia'), tProcon = tw(7, 'procon'), tLigar = tw(7, 'ligar');
const tCansa = tw(1, 'aí'), tSemana = tw(2, 'cheirou'), tCartao = tw(3, 'aí');
const tTa = tw(4, 'ta', achar(4, 'experiencia'));   // "...olfativa, TÁ ali na plaquinha"
const CREME = '#F3E9DA', PETROLEO = '#0F2E33', AMBAR = '#D49A4E', VERMELHO = '#b8322a';

export default {
  dur: DUR,
  heroi: { capuz: '#1fa79c', capuzEscuro: '#178178', pele: '#f3bea6', nariz: '#e2a48e', cabelo: '#141414', calca: '#1c1c26', fone: false },
  elenco: { h: 'Rafa', a: { nome: 'Seu Valdir', pele: '#e9b693', camisa: '#D49A4E', parede: '#0A1F23', cabelo: '#cfcac2', calca: '#3b3a45', idoso: true, bigode: true } },
  cena: 'loja',
  // o Seu Valdir pega a placa debaixo do balcao, anda ate a parede, pendura e volta
  placaSeq: { aparece: ini(4) + 0.6, pendura: tPlaca - 0.1 }, placaTorta: -0.13,
  anda: [[ini(4) + 0.55, tPlaca - 1.2, 'parede'], [tPlaca + 0.4, tPlaca + 1.0, 'lado'], [tTa - 0.1, tTa + 1.3, 'casa']],
  props: { frasco: [[0, ini(4)]] },

  lines: [
    ...blocos(0, { e: 'sus', hr: 'happy' }),
    ...blocos(1, { e: 'happy', ar: 'sus' }),
    ...blocos(2, { e: 'sus', hr: 'conf' }),
    ...blocos(3, { e: 'happy', ar: 'off' }),
    ...blocos(4, { e: 'proud', hr: 'conf' }),
    ...blocos(5, { g: 'shrug', e: 'off', ar: 'proud' }),
    ...blocos(6, { e: 'off', hr: 'off' }),
    ...blocos(7, { e: 'sus', ar: 'proud' }),
    ...blocos(8, { e: 'proud', hr: 'sus' }),
    ...blocos(9, { e: 'happy' }),
  ],

  acoes: [
    [0, ini(1) + 0.6, 'cheira', 'h'],
    [ini(1) + 0.6, ini(4) - 0.1, 'segura', 'h'],
    [tLigar - 0.4, ini(9) - 0.2, 'celular', 'h'],
    [ini(9) - 0.1, DUR, 'olhaCamera', 'h'],
    [0, ini(4), 'bracos', 'a'],
    [ini(6), ini(8), 'bracos', 'a'],
    [ini(8) - 0.1, DUR, 'debocha', 'a'],
  ],

  cuts: [
    [0, 'EST'], [ini(1) - 0.05, 'W2'],          // gancho na tela ate 8 s: so planos abertos
    [8.0, 'CH'], [tCansa - 0.05, 'LOWH'],
    [ini(2) - 0.05, 'OTS'], [tSemana - 0.05, 'CV'],
    [ini(3) - 0.05, 'CH'], [tCartao - 0.05, 'OTSV'],
    [ini(4) - 0.05, 'CV'], [ini(4) + 0.5, 'ANDA'], [tExp - 0.1, 'SCR'], [tTa - 0.05, 'ANDA'],
    [ini(5) - 0.05, 'MOUTH'], [ini(5) + 2.0, 'LOWH'],
    [ini(6) - 0.05, 'CV'], [ini(6) + 2.6, 'W2'],
    [ini(7) - 0.05, 'CH'], [tProcon - 0.1, 'ORB'],
    [ini(8) - 0.05, 'CV'],
    [ini(9) - 0.1, 'CAMH'],
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
  ],

  textos: {
    gancho: { linhas: ['COBRARAM R$ 29', 'SÓ PRA CHEIRAR PERFUME 😳'], t1: 8.0 },
    selo: { texto: 'PARTE 1', t0: 0 },
    fim: { linhas: ['PARTE 2', 'no próximo episódio dos bonecos 🎬<br>comenta o que você acha 👇'], t0: ini(9) },
  },
};
