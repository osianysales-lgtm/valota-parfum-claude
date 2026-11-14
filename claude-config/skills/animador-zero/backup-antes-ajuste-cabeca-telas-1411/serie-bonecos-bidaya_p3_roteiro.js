// Serie de bonecos Bidaya · PARTE 3 "O teste do Rafa" (ROTEIRO FINAL 14/11/2026)
// Mesa da Bia (escritorio). Rafa com a caixa e o celular; o card da verificacao aparece grande. Final feliz: e original.
import { TW, TH, MF } from '/src/cartoes.js';
import { criaRoteiro } from '/src/bonecos.js';
import { DUR, FALAS } from '/projeto/tempos.js';

const { ini, fim, tw, blocos, cortes } = criaRoteiro(FALAS, {
  fortes: ['caixa', 'original', 'bidaya', 'código', 'escanear', 'nervosa', 'verdadeiro', 'p*rn', 'francesa', 'dubai', 'paraguai', 'paris', 'viajado', 'confiança', 'baixo', 'milenar', '2025', 'jovem', 'roubada', 'valota', 'parfum'],
});

const CREME = '#F2E8D8', PETROLEO = '#0F2E33', NOITE = '#0A1F23', AMBAR = '#D49A4E', BERGAMOTA = '#B8BC5C', AMARELO = '#FFC93C', MENTA = '#7DBFB3';
const i1 = tw(1, 'pagina') - 0.1, tEsc = tw(2, 'escanear'), tOrig = ini(4), i3 = tw(5, 'compara') - 0.1, i4 = tw(7, 'confere') - 0.1;
const INS = [[i1, Math.min(fim(1), i1 + 3.0), 'SCR'], [tEsc + 0.3, fim(3), 'SCR'], [tOrig - 0.05, tOrig + 2.4, 'SCR'], [i3, Math.min(fim(5), i3 + 3.0), 'SCR'], [i4, fim(7), 'SCR']];
const linha = (h, txt, y, t0, t) => { if (t < t0) return; const k = h.sm(t0, t0 + 0.2, t); h.x.save(); h.x.globalAlpha *= k; h.x.translate((1 - k) * 40, 0);
  h.box(130, y - 60, 840, 96, 22, '#ffffff', '#d9cfc0', 3); h.fnt(54, 900, MF); h.txt('✓', 190, y + 6, '#3f8f5a', 'center'); h.fnt(40, 800, MF); h.txt(txt, 250, y + 2, NOITE); h.x.restore(); };

export default {
  dur: DUR,
  heroi: { capuz: '#1fa79c', capuzEscuro: '#178178', pele: '#f3bea6', nariz: '#e2a48e', cabelo: '#141414', calca: '#1c1c26', fone: false },
  elenco: { h: 'Rafa', a: { nome: 'Bia', pele: '#c48a66', camisa: '#E6AEB9', cabelo: '#2a1a14', calca: '#0F2E33', idoso: false, bigode: false, cabeloLongo: true, parede: '#DCD6E2' } },
  cena: 'escritorio',
  telaCelular: true,
  caixaCor: '#3a2340',
  props: { caixa: [[0, DUR]], celularA: [[i1 - 0.6, INS[0][1] + 0.3], [i3 - 0.6, INS[3][1] + 0.3], [i4 - 0.6, INS[4][1] + 0.3]] },

  lines: [
    ...blocos(0, { e: 'sad', ar: 'happy' }),
    ...blocos(1, { e: 'happy', hr: 'conf' }),
    ...blocos(2, { e: 'conf', ar: 'sus' }),
    ...blocos(3, { g: 'beg', e: 'conf', hr: 'conf' }),
    ...blocos(4, { g: 'up', e: 'happy', ar: 'happy' }),
    ...blocos(5, { e: 'happy', hr: 'happy' }),
    ...blocos(6, { g: 'shock', e: 'proud', ar: 'happy' }),
    ...blocos(7, { g: 'one', e: 'happy', hr: 'conf' }),
    ...blocos(8, { e: 'proud', ar: 'happy' }),
    ...blocos(9, { e: 'happy', hr: 'happy' }),
    ...blocos(10, { e: 'happy' }),
  ],

  acoes: [
    [0, ini(1), 'mostraCaixa', 'h'],
    [i1 - 0.5, INS[0][1] + 0.2, 'mostraCelular', 'a'],
    [tEsc - 0.2, tOrig + 0.2, 'escaneia', 'h'],
    [i3 - 0.5, INS[3][1] + 0.2, 'mostraCelular', 'a'],
    [i4 - 0.5, INS[4][1] + 0.2, 'mostraCelular', 'a'],
    [ini(10) - 0.1, DUR, 'olhaCamera', 'h'],
  ],

  cuts: cortes({ inserts: INS, final: 'CAMH' }),

  cards: [
    [0, CREME, (t, h) => {            // a pagina da marca
      h.box(60, 60, TW - 120, 80, 18, PETROLEO); h.fnt(38, 800, MF); h.txt('SITE DA BIDAYA', TW / 2, 112, CREME, 'center');
      h.fnt(62, 900, MF); h.txt('VERIFIQUE SE É', TW / 2, 290, PETROLEO, 'center'); h.txt('ORIGINAL', TW / 2, 370, PETROLEO, 'center');
      h.box(TW / 2 - 300, 430, 600, 120, 26, AMBAR); h.fnt(44, 800, MF); h.txt('escaneie o código 📷', TW / 2, 505, PETROLEO, 'center');
      h.fnt(34, 700, MF); h.txt('(o código vem na caixa)', TW / 2, 640, NOITE, 'center');
    }],
    [tEsc + 0.25, NOITE, (t, h) => {          // escaneando...
      const x = h.x; h.box(300, 110, 500, 420, 30, null, CREME, 6);
      for (let i = 0; i < 18; i++) { x.fillStyle = i % 3 ? CREME : '#9aa5ae'; x.fillRect(340 + i * 24, 160, 12 + (i % 4) * 4, 300); }
      const y = 160 + 300 * (0.5 + 0.5 * Math.sin(t * 5)); x.fillStyle = '#ff3b3b'; x.fillRect(320, y, 460, 6);
      const k = h.sm(tEsc + 0.3, fim(3), t); h.box(250, 600, 600, 34, 17, 'rgba(255,255,255,.15)'); h.box(250, 600, Math.max(34, 600 * k), 34, 17, AMARELO);
      h.fnt(38, 800, MF); h.txt('verificando...', TW / 2, 700, CREME, 'center');
    }],
    [tOrig - 0.1, CREME, (t, h) => {        // ORIGINAL
      const k = h.pop(t, tOrig, 0.35); h.x.save(); h.x.translate(TW / 2, 330); h.x.scale(k, k);
      h.x.fillStyle = '#3f8f5a'; h.x.beginPath(); h.x.arc(0, 0, 150, 0, 7); h.x.fill(); h.fnt(200, 900, MF); h.txt('✓', 0, 70, '#ffffff', 'center'); h.x.restore();
      h.fnt(110, 900, MF); h.txt('ORIGINAL', TW / 2, 640, '#3f8f5a', 'center');
    }],
    [i3 - 0.05, PETROLEO, (t, h) => {        // comparacao da comunidade
      h.fnt(40, 700, MF); h.txt('a comunidade compara o', TW / 2, 150, CREME, 'center');
      h.fnt(66, 900, MF); h.txt('Vanilla P*rn', TW / 2, 250, AMARELO, 'center');
      h.fnt(40, 700, MF); h.txt('com uma baunilha de nicho', TW / 2, 360, CREME, 'center');
      const k = h.pop(t, i3 + 1.0, 0.3); h.x.save(); h.x.translate(TW / 2, 500); h.x.scale(k, k); h.box(-300, -80, 600, 140, 26, MENTA); h.fnt(70, 900, MF); h.txt('FRANCESA 🇫🇷', 0, 25, PETROLEO, 'center'); h.x.restore();
      h.fnt(36, 700, MF); h.txt('bem mais cara', TW / 2, 670, CREME, 'center');
    }],
    [i4 - 0.05, CREME, (t, h) => {          // a dica pra levar
      h.fnt(46, 900, MF); h.txt('ANTES DE COMPRAR', TW / 2, 130, PETROLEO, 'center');
      linha(h, 'confere o código', 270, i4 + 0.1, t);
      linha(h, 'compra de loja de confiança', 410, tw(7, 'compra') - 0.1, t);
      linha(h, 'desconfia de preço baixo demais', 550, tw(7, 'desconfia') - 0.1, t);
    }],
  ],

  textos: {
    gancho: { linhas: ['O TESTE QUE', 'a própria Bidaya te ensina ✅'], t1: 8.0 },
    selo: { texto: 'PARTE 3', t0: 0 },
    fim: { linhas: ['PRÓXIMA<br>HISTÓRIA', 'no próximo episódio dos bonecos 🎬'], t0: ini(10) },
  },
};
