// Serie de bonecos "O perfume mais viajado do Rafa" (Bidaya) · PARTE 1 "Tradicao milenar de um aninho" (ROTEIRO FINAL 14/11/2026)
// Escritorio, Rafa + Bia. Cards no celular da Bia. Sem criticar a marca.
import { TW, TH, MF } from '/src/cartoes.js';
import { criaRoteiro } from '/src/bonecos.js';
import { DUR, FALAS } from '/projeto/tempos.js';

const { ini, fim, tw, blocos, cortes } = criaRoteiro(FALAS, {
  fortes: ['milenar', 'sheik', 'bidaya', 'dubai', 'família', 'geração', '2025', 'aninho', 'árabe', 'começo', 'p*rn', 'estilo', 'sobremesa', 'país', 'valota', 'parfum', 'escala'],
});

const CREME = '#F2E8D8', PETROLEO = '#0F2E33', NOITE = '#0A1F23', AMBAR = '#D49A4E', CEDRO = '#6B4430', ROSA = '#E6AEB9', AMARELO = '#FFC93C';
const i1 = tw(3, 'nasceu') - 0.1, i2 = tw(5, 'comeco') - 0.2, i3 = tw(7, 'tem'), i4 = tw(9, 'tem') - 0.1;
const INS = [[i1, i1 + 2.6, 'SCR'], [i2, i2 + 2.3, 'SCR'], [i3, Math.min(fim(7), i3 + 3.6), 'SCR'], [i4, Math.min(fim(9), i4 + 2.2), 'SCR']];

export default {
  dur: DUR,
  heroi: { capuz: '#1fa79c', capuzEscuro: '#178178', pele: '#f3bea6', nariz: '#e2a48e', cabelo: '#141414', calca: '#1c1c26', fone: false },
  elenco: { h: 'Rafa', a: { nome: 'Bia', pele: '#c48a66', camisa: '#E6AEB9', cabelo: '#2a1a14', calca: '#0F2E33', idoso: false, bigode: false, cabeloLongo: true, parede: '#DCD6E2' } },
  cena: 'escritorio',
  telaCelular: true,
  props: { frasco: [[0, fim(2)]], celularA: INS.map(([a, b]) => [a - 0.6, b + 0.3]) },

  lines: [
    ...blocos(0, { e: 'proud', ar: 'conf' }),
    ...blocos(1, { e: 'sus', hr: 'proud' }),
    ...blocos(2, { e: 'proud', ar: 'sus' }),
    ...blocos(3, { e: 'happy', hr: 'conf' }),
    ...blocos(4, { g: 'shock', ar: 'happy' }),
    ...blocos(5, { e: 'happy', hr: 'conf' }),
    ...blocos(6, { g: 'point', e: 'proud', ar: 'sus' }),
    ...blocos(7, { g: 'one', e: 'proud', hr: 'conf' }),
    ...blocos(8, { e: 'proud', ar: 'sus' }),
    ...blocos(9, { e: 'sus', hr: 'conf' }),
    ...blocos(10, { g: 'shock', ar: 'sus' }),
    ...blocos(11, { e: 'happy' }),
  ],

  acoes: [
    [0, ini(1) + 1.0, 'segura', 'h'],
    [ini(1), ini(1) + 1.6, 'inclina', 'a'],
    [ini(3), ini(4), 'debocha', 'a'],
    ...INS.map(([a, b]) => [a - 0.5, b + 0.2, 'mostraCelular', 'a']),
    [ini(4), fim(4), 'bracos', 'h'],
    [ini(11) - 0.1, DUR, 'olhaCamera', 'a'],
  ],

  cuts: cortes({ inserts: INS, final: 'CAMA' }),

  cards: [
    [0, CREME, (t, h) => {         // a marca nasceu em 2025
      h.fnt(46, 800, MF); h.txt('BIDAYA', TW / 2, 130, CEDRO, 'center');
      h.fnt(40, 700, MF); h.txt('a marca nasceu em', TW / 2, 220, NOITE, 'center');
      const k = h.pop(t, i1 + 0.4, 0.3); h.x.save(); h.x.translate(TW / 2, 420); h.x.scale(k, k); h.box(-280, -130, 560, 220, 30, AMBAR); h.fnt(190, 900, MF); h.txt('2025', 0, 60, PETROLEO, 'center'); h.x.restore();
      if (t > i1 + 1.2) { h.fnt(44, 800, MF); h.txt('tradição milenar? 🤔', TW / 2, 650, CEDRO, 'center'); }
    }],
    [i2 - 0.05, PETROLEO, (t, h) => {        // Bidaya = comeco
      h.fnt(40, 700, MF); h.txt('em árabe', TW / 2, 150, CREME, 'center');
      h.x.font = '700 170px "Geeza Pro", "Arial", sans-serif'; h.x.textAlign = 'center'; h.x.fillStyle = AMARELO; h.x.fillText('بداية', TW / 2, 380); h.x.textAlign = 'left';
      const k = h.pop(t, i2 + 0.7, 0.3); h.x.save(); h.x.translate(TW / 2, 560); h.x.scale(k, k); h.fnt(110, 900, MF); h.txt('= COMEÇO', 0, 30, CREME, 'center'); h.x.restore();
    }],
    [i3 - 0.05, CREME, (t, h) => {          // os dois estilos de arabe
      h.fnt(44, 900, MF); h.txt('PERFUME ÁRABE HOJE', TW / 2, 110, PETROLEO, 'center');
      h.box(70, 160, 450, 520, 28, '#ffffff', CEDRO, 6); h.box(580, 160, 450, 520, 28, '#ffffff', ROSA, 6);
      h.fnt(36, 900, MF); h.txt('DE TRADIÇÃO', 295, 230, CEDRO, 'center'); h.txt('OS NOVOS', 805, 230, '#b05a6e', 'center');
      h.fnt(90, 700); h.txt('🪵', 295, 360, CEDRO, 'center'); h.txt('🍰', 805, 360, CEDRO, 'center');
      h.fnt(34, 700, MF); ['madeira escura', 'rosa', 'açafrão'].forEach((s, k) => h.txt(s, 295, 460 + k * 56, NOITE, 'center'));
      if (t > i3 + 1.6) { ['cheiro de', 'sobremesa', '(o do Rafa)'].forEach((s, k) => h.txt(s, 805, 460 + k * 56, NOITE, 'center')); }
    }],
    [i4 - 0.05, PETROLEO, (t, h) => {       // o pais misterioso
      h.fnt(44, 800, MF); h.txt('ONDE MAIS VENDE BIDAYA?', TW / 2, 150, CREME, 'center');
      const k = h.pop(t, i4 + 0.4, 0.3); h.x.save(); h.x.translate(TW / 2, 430); h.x.scale(k, k); h.fnt(260, 900, MF); h.txt('?', 0, 90, AMARELO, 'center'); h.x.restore();
      h.fnt(40, 700, MF); h.txt('um país aqui do lado 👀', TW / 2, 660, CREME, 'center');
    }],
  ],

  textos: {
    gancho: { linhas: ['O PERFUME<br>MAIS VIAJADO', 'DO ESCRITÓRIO ✈️'], t1: 8.0 },
    selo: { texto: 'PARTE 1', t0: 0 },
    fim: { linhas: ['PARTE 2', 'no próximo episódio dos bonecos 🎬'], t0: ini(11) },
  },
};
