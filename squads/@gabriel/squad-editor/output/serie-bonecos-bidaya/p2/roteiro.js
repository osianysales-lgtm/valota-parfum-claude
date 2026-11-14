// Serie de bonecos Bidaya · PARTE 2 "A conexao Paraguai" (ROTEIRO FINAL 14/11/2026)
// Copa do escritorio. Rafa segurando a caixa do perfume, Bia com o celular. Paraguai so como "muito vendida la".
import { TW, TH, MF } from '/src/cartoes.js';
import { criaRoteiro } from '/src/bonecos.js';
import { DUR, FALAS } from '/projeto/tempos.js';

const { ini, fim, tw, blocos, cortes } = criaRoteiro(FALAS, {
  fortes: ['paraguai', 'vinte', 'um', 'dólar', 'dubai', 'amazon', 'emirados', 'elliur', 'ayat', 'p*rn', 'nenhum', 'endereço', 'prédio', 'oito', 'mil', 'empresas', 'prateleira', 'original', 'valota', 'parfum', 'caixa'],
});

const CREME = '#F2E8D8', PETROLEO = '#0F2E33', NOITE = '#0A1F23', AMBAR = '#D49A4E', PIMENTA = '#9C452A', AMARELO = '#FFC93C', BERGAMOTA = '#B8BC5C';
const i1 = tw(1, 'aparecem') - 0.1, i2 = tw(3, 'amazon') - 0.1, i3 = tw(7, 'predio') - 0.1, i4 = tw(9, 'dubai') - 0.1;
const tEli = tw(3, 'eli'), tAia = tw(3, 'aia'), tVan = tw(3, 'vanilla');
const INS = [[i1, Math.min(fim(1), i1 + 2.8), 'SCR'], [i2, fim(3) + 0.05, 'SCR'], [i3, fim(7), 'SCR'], [i4, fim(9) + 0.05, 'SCR']];
const nao = (h, txt, y, t0, t) => { if (t < t0) return; const k = h.sm(t0, t0 + 0.2, t); h.x.save(); h.x.globalAlpha *= k;
  h.box(110, y - 75, 880, 125, 24, '#ffffff', '#d9cfc0', 4); h.fnt(66, 900, MF); h.txt(txt, 170, y + 10, NOITE); h.fnt(80, 900, MF); h.txt('✕', 910, y + 14, PIMENTA, 'center'); h.x.restore(); };

export default {
  dur: DUR,
  heroi: { capuz: '#1fa79c', capuzEscuro: '#178178', pele: '#f3bea6', nariz: '#e2a48e', cabelo: '#141414', calca: '#1c1c26', fone: false },
  elenco: { h: 'Rafa', a: { nome: 'Bia', pele: '#c48a66', camisa: '#E6AEB9', cabelo: '#2a1a14', calca: '#0F2E33', idoso: false, bigode: false, cabeloLongo: true, parede: '#9C452A' } },
  cena: 'copa',
  telaCelular: true,
  caixaCor: '#3a2340',
  props: { caixa: [[0, DUR]], celularA: INS.map(([a, b]) => [a - 0.6, b + 0.3]) },

  lines: [
    ...blocos(0, { e: 'conf', ar: 'sus' }),
    ...blocos(1, { e: 'proud', hr: 'conf' }),
    ...blocos(2, { g: 'shrug', e: 'happy', ar: 'sus' }),
    ...blocos(3, { e: 'sus', hr: 'conf' }),
    ...blocos(4, { g: 'shock', ar: 'sus' }),
    ...blocos(5, { e: 'happy', hr: 'conf' }),
    ...blocos(6, { g: 'one', e: 'sus', ar: 'proud' }),
    ...blocos(7, { e: 'proud', hr: 'conf' }),
    ...blocos(8, { g: 'shock', e: 'happy', ar: 'happy' }),
    ...blocos(9, { e: 'proud', hr: 'conf' }),
    ...blocos(10, { e: 'sad', ar: 'sus' }),
    ...blocos(11, { e: 'happy' }),
  ],

  acoes: [
    ...INS.map(([a, b]) => [a - 0.5, b + 0.2, 'mostraCelular', 'a']),
    [ini(10), fim(10), 'mostraCaixa', 'h'],
    [ini(11) - 0.1, DUR, 'olhaCamera', 'a'],
  ],

  cuts: cortes({ inserts: INS, final: 'CAMA' }),

  cards: [
    [0, CREME, (t, h) => {          // site de precos
      h.box(60, 60, TW - 120, 80, 18, PETROLEO); h.fnt(36, 800, MF); h.txt('SITE DE PREÇOS · LOJAS DO PARAGUAI', TW / 2, 112, CREME, 'center');
      const k = h.pop(t, i1 + 0.5, 0.3); h.x.save(); h.x.translate(TW / 2, 380); h.x.scale(k, k); h.fnt(230, 900, MF); h.txt('21', 0, 80, PIMENTA, 'center'); h.x.restore();
      h.fnt(46, 800, MF); h.txt('perfumes Bidaya', TW / 2, 560, NOITE, 'center');
      h.fnt(38, 700, MF); h.txt('tudo em dólar 💵', TW / 2, 640, NOITE, 'center');
    }],
    [i2 - 0.05, CREME, (t, h) => {       // amazon dos emirados
      h.box(60, 60, TW - 120, 80, 18, PETROLEO); h.fnt(38, 800, MF); h.txt('AMAZON · EMIRADOS 🇦🇪', TW / 2, 112, CREME, 'center');
      nao(h, 'Elliur', 280, tEli, t); nao(h, 'Ayat', 440, tAia, t); nao(h, 'Vanilla P*rn', 600, tVan, t);
    }],
    [i3 - 0.05, PETROLEO, (t, h) => {    // endereco em Dubai
      h.fnt(40, 700, MF); h.txt('endereço no site da marca:', TW / 2, 130, CREME, 'center');
      h.fnt(54, 900, MF); h.txt('prédio comercial em Dubai 🏢', TW / 2, 220, AMARELO, 'center');
      const k = h.pop(t, tw(7, 'mais') , 0.3); h.x.save(); h.x.translate(TW / 2, 450); h.x.scale(k, k);
      h.box(-360, -120, 720, 200, 30, AMBAR); h.fnt(150, 900, MF); h.txt('28 MIL', 0, 40, PETROLEO, 'center'); h.x.restore();
      h.fnt(40, 700, MF); h.txt('empresas registradas na região', TW / 2, 640, CREME, 'center');
    }],
    [i4 - 0.05, CREME, (t, h) => {       // o resumo da Bia
      h.box(90, 120, TW - 180, 230, 30, PETROLEO); h.fnt(110, 900, MF); h.txt('DUBAI', TW / 2, 250, AMARELO, 'center'); h.fnt(40, 700, MF); h.txt('no endereço', TW / 2, 320, CREME, 'center');
      if (t > tw(9, 'paraguai') - 0.1) { h.box(90, 400, TW - 180, 230, 30, BERGAMOTA); h.fnt(110, 900, MF); h.txt('PARAGUAI', TW / 2, 530, PETROLEO, 'center'); h.fnt(40, 700, MF); h.txt('na prateleira', TW / 2, 600, PETROLEO, 'center'); }
    }],
  ],

  textos: {
    gancho: { linhas: ['A CONEXÃO<br>PARAGUAI', 'do perfume do Rafa ✈️'], t1: 8.0 },
    selo: { texto: 'PARTE 2', t0: 0 },
    fim: { linhas: ['PARTE 3', 'no próximo episódio dos bonecos 🎬'], t0: ini(11) },
  },
};
