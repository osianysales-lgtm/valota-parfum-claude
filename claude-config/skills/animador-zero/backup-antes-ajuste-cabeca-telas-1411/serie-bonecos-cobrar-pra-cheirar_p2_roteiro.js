// Serie de bonecos "Cobrar pra cheirar?" · PARTE 2 "Isso aconteceu de verdade" (ROTEIRO FINAL 14/11/2026)
// Escritorio, Rafa + Bia. Os cards aparecem no celular da Bia (a tela entra grande na frente).
import { TW, TH, MF } from '/src/cartoes.js';
import { criaRoteiro } from '/src/bonecos.js';
import { DUR, FALAS } from '/projeto/tempos.js';

const { ini, fim, tw, blocos } = criaRoteiro(FALAS, {
  fortes: ['vinte', 'nove', 'noventa', 'verdade', 'campo', 'grande', 'trinta', 'procon', 'abusivo', 'certo', 'direito', 'dois', 'sete', 'oito', 'paraguai', 'restaurante', 'marmita', 'pouquinho', 'quem', 'valota', 'parfum', 'respondeu'],
});

const tOlha = tw(1, 'olha'), tCobraram = tw(1, 'cobraram'), tProcon = tw(3, 'procon'), tAbusivo = tw(3, 'abusivo');
const tEnquanto = tw(5, 'enquanto'), tSabe = tw(7, 'que');
const CREME = '#F2E8D8', PETROLEO = '#0F2E33', NOITE = '#0A1F23', AMBAR = '#D49A4E', PIMENTA = '#9C452A';

export default {
  dur: DUR,
  heroi: { capuz: '#1fa79c', capuzEscuro: '#178178', pele: '#f3bea6', nariz: '#e2a48e', cabelo: '#141414', calca: '#1c1c26', fone: false },
  elenco: { h: 'Rafa', a: { nome: 'Bia', pele: '#c48a66', camisa: '#E6AEB9', cabelo: '#2a1a14', calca: '#0F2E33', idoso: false, bigode: false, cabeloLongo: true, parede: '#DCD6E2' } },
  cena: 'escritorio',
  telaCelular: true,
  props: { celularA: [[0, ini(4)], [ini(5), fim(5) + 0.3]] },

  lines: [
    ...blocos(0, { g: 'annoy', e: 'off', ar: 'conf' }),
    ...blocos(1, { e: 'happy', hr: 'conf' }),
    ...blocos(2, { g: 'shock', ar: 'happy' }),
    ...blocos(3, { e: 'proud', hr: 'sus' }),
    ...blocos(4, { g: 'up', e: 'happy', ar: 'conf' }),
    ...blocos(5, { g: 'one', e: 'sus', hr: 'conf' }),
    ...blocos(6, { g: 'shrug', ar: 'sus' }),
    ...blocos(7, { e: 'sus', hr: 'off' }),
    ...blocos(8, { g: 'no', e: 'off', ar: 'happy' }),
    ...blocos(9, { e: 'happy', hr: 'conf' }),
    ...blocos(10, { g: 'shock', ar: 'happy' }),
    ...blocos(11, { e: 'happy' }),
  ],

  acoes: [
    [tOlha - 0.4, ini(2) + 0.8, 'mostraCelular', 'a'],
    [ini(3), fim(3), 'mostraCelular', 'a'],
    [tEnquanto - 0.3, fim(5), 'mostraCelular', 'a'],
    [ini(5), fim(7), 'bracos', 'h'],
    [ini(9), ini(11) - 0.1, 'debocha', 'a'],
    [ini(11) - 0.1, DUR, 'olhaCamera', 'a'],
  ],

  cuts: [
    [0, 'EST'], [ini(0) + 1.9, 'CH'],
    [ini(1) - 0.05, 'CV'], [tCobraram - 0.05, 'OTS'], [tOlha - 0.1, 'SCR'],
    [ini(2) - 0.05, 'MOUTH'],
    [ini(3) - 0.05, 'CV'], [tProcon - 0.05, 'SCR'],
    [ini(4) - 0.05, 'LOWH'],
    [ini(5) - 0.05, 'CV'], [tEnquanto - 0.05, 'SCR'],
    [ini(6) - 0.05, 'MOUTH'],
    [ini(7) - 0.05, 'OTS'], [tSabe - 0.05, 'W2'],
    [ini(8) - 0.05, 'LOWH'],
    [ini(9) - 0.05, 'MOUTHV'],
    [ini(10) - 0.05, 'CH'],
    [ini(11) - 0.1, 'CAMA'],
  ],

  // o que aparece no celular da Bia
  cards: [
    [0, CREME, (t, h) => {
      h.box(60, 60, TW - 120, 80, 18, PETROLEO); h.fnt(40, 800, MF); h.txt('NOTÍCIA · 10/11/2026', TW / 2, 114, CREME, 'center');
      h.fnt(54, 900, MF); h.txt('Campo Grande (MS)', TW / 2, 250, PETROLEO, 'center');
      h.fnt(46, 700, MF); h.txt('Perfumaria cobra', TW / 2, 350, NOITE, 'center'); h.txt('“experiência olfativa”', TW / 2, 410, NOITE, 'center');
      h.box(TW / 2 - 300, 470, 600, 140, 26, AMBAR); h.fnt(96, 900, MF); h.txt('R$ 29,90', TW / 2, 575, PETROLEO, 'center');
      h.fnt(36, 700, MF); h.txt('de quem provou e não levou', TW / 2, 680, PIMENTA, 'center');
    }],
    [tProcon - 0.05, PETROLEO, (t, h) => {
      h.fnt(64, 900, MF); h.txt('PROCON', TW / 2, 200, CREME, 'center');
      h.fnt(44, 700, MF); h.txt('cobrar pra testar perfume é', TW / 2, 300, CREME, 'center');
      const k = h.pop(t, tAbusivo, 0.3); h.x.save(); h.x.translate(TW / 2, 470); h.x.rotate(-0.06); h.x.scale(k, k);
      h.box(-330, -95, 660, 170, 24, PIMENTA); h.fnt(120, 900, MF); h.txt('ABUSIVO', 0, 42, CREME, 'center'); h.x.restore();
      h.fnt(32, 700, MF); h.txt('Procon-MS · 10/11/2026', TW / 2, 680, AMBAR, 'center');
    }],
    [tEnquanto - 0.1, CREME, (t, h) => {
      h.fnt(46, 900, MF); h.txt('AS DUAS VERSÕES', TW / 2, 120, PETROLEO, 'center');
      h.box(70, 180, 450, 500, 28, '#ffffff', PETROLEO, 6); h.box(580, 180, 450, 500, 28, '#ffffff', PIMENTA, 6);
      h.fnt(40, 800, MF); h.txt('A CLIENTE', 295, 250, PETROLEO, 'center'); h.txt('O DONO', 805, 250, PIMENTA, 'center');
      h.fnt(150, 900, MF); h.txt('2', 295, 450, PETROLEO, 'center'); h.txt('7, 8', 805, 450, PIMENTA, 'center');
      h.fnt(34, 700, MF); h.txt('perfumes provados', 295, 530, NOITE, 'center'); h.txt('perfumes provados', 805, 530, NOITE, 'center');
      if (t > tEnquanto + 1.4) { h.fnt(30, 700, MF); h.txt('“ia comprar no Paraguai”', 805, 610, PIMENTA, 'center'); }
    }],
  ],

  textos: {
    gancho: { linhas: ['ISSO ACONTECEU<br>DE VERDADE 😳', 'numa perfumaria<br>de Campo Grande'], t1: 8.0 },
    selo: { texto: 'PARTE 2', t0: 0 },
    fim: { linhas: ['PARTE 3', 'no próximo episódio dos bonecos 🎬<br>comenta o que você acha 👇'], t0: ini(11) },
  },
};
