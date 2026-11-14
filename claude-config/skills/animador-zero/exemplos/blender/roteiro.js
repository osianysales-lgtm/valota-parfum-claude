// Exemplo completo: o video "Eu nao fui feito no Blender" (37,5 s). Copie e adapte para cada audio novo.
// Formato de cada campo: references/roteiro.md
import { TW, TH, MF, G, INK, MUT, ACC, RED, YEL, CY, PK, avatar, stamp } from '/src/cartoes.js';

const CODE = ['const cena = new Scene();', 'luz.key  = warm(0.8);', 'luz.rim  = teal(1.4);', 'camera.dolly(0.3, 2.0);', 'boca.sync(voz.volume);', 'corte.aCada(fala);', 'trilha.duck(voz);', 'render(1080, 1920, 30);'];
export default {
  dur: 37.5,
  feio: [8.88, 14.12],               // trecho "sem a skill": tudo cinza e chapado
  acoes: [[23.15, 23.95, 'acena'], [29.2, 31.7, 'orgulho'], [31.9, 32.7, 'olhaClaude']],
  claude: { giros: [14.15], timido: [[11.7, 12.5]], risada: [[31.9, 32.6]] },
  textos: {
    titulo: { texto: 'BLENDER', t0: 0.15, t1: 2.15, riscar: 0.95 },
    comentarios: { itens: ['como vocês fazem isso?? 😱', 'é Blender?', 'manda o tutorial pfv', 'quem anima isso??', 'qual programa???'], t0: 2.1, t1: 5.0 },
    etiquetas: [[8.88, 14.12, 'SEM A SKILL', 'ruim'], [14.12, 16.4, 'COM A SKILL', 'bom']],
    flashes: [8.88, 14.12],
    apagao: [22.56],
  },
  // heroi: { capuz: '#1fa79c', pele: '#f3bea6', cabelo: '#2b1b22', calca: '#242a4c' },   // troque as cores do personagem se quiser
  lines: [
    [0.0, 1.95, 'h', 'Eu <b>não</b> fui feito no Blender.', { e: 'proud' }],
    [2.1, 4.95, 'h', 'E todo mundo quer saber<br>o meu <b>segredo</b>.', { e: 'sus' }],
    [5.1, 7.9, 'c', 'Se você me pedir um vídeo 3D<br>do jeito normal...', {}],
    [8.9, 9.62, 'c', 'sai isso.', {}],
    [9.78, 11.5, 'h', 'Que coisa feia, Claude!', { g: 'annoy' }],
    [11.76, 12.4, 'c', 'Eu sei.', {}],
    [12.8, 14.1, 'c', 'Agora olha <b>com a skill</b>.', {}],
    [14.9, 15.45, 'h', '<b>Mano.</b>', { g: 'shock' }],
    [15.66, 18.85, 'h', 'Nosso primeiro vídeo fez<br><b>100 mil views</b> em um dia.', { e: 'proud', g: 'point' }],
    [19.12, 21.6, 'c', 'Ela me dá a experiência<br>de um <b>animador de verdade</b>.', {}],
    [21.9, 24.2, 'c', '<b>Câmera</b>, <b>luz</b>, <b>movimento</b> e <b>som</b>.', {}],
    [24.44, 27.7, 'c', 'A boca mexe com a voz e a<br>câmera troca a cada fala.', {}],
    [27.88, 29.2, 'c', 'Cada quadro <b>em código</b>.', {}],
    [29.22, 31.6, 'h', 'E eu nunca abri o Blender.', { e: 'proud' }],
    [31.94, 32.55, 'c', 'Nem eu.', {}],
    [32.72, 35.2, 'c', 'Comenta <b>3D</b> que eu te mando<br>o segredo completo!', {}],
  ],
  cuts: [[0, 'EST'], [2.05, 'LOWH'], [5.0, 'CC'], [6.2, 'SCR'], [8.86, 'UG'], [9.7, 'UGH'], [11.7, 'UGC'], [12.75, 'UG'], [14.12, 'REV'], [14.85, 'CH'], [15.6, 'SCR'], [17.9, 'OTS'],
         [19.05, 'CC'], [20.55, 'ORB'], [21.85, 'ORB2'], [22.5, 'W2'], [23.12, 'LOWH'], [23.85, 'SCR'], [24.4, 'MOUTH'], [26.42, 'CC'], [27.82, 'SCR'], [29.15, 'CH'], [31.85, 'CC'], [32.6, 'SCRE']],
  cards: [
    [0, '#07060c', (t, h) => { h.fnt(40, 800, MF); h.txt('COMENTÁRIOS', 80, 90, MUT); ['como vocês fazem isso??', 'é Blender?', 'quem anima isso?', 'manda o tutorial pfv', 'isso é IA?', 'qual programa??', 'ensina a gente', 'como faz a boca mexer?'].forEach((c, i) => { const Y = 150 + i * 92 - Math.max(0, t - 2) * 40; if (Y < 110 || Y > 720) return; const a = h.sm(2.0 + i * 0.25, 2.25 + i * 0.25, t); if (a <= 0) return; h.x.globalAlpha = a; avatar(h, 120, Y + 34, 26, 'h'); h.box(165, Y, 760, 70, 22, 'rgba(255,255,255,.08)'); h.fnt(38, 600); h.txt(c, 195, Y + 48, INK); h.x.globalAlpha = 1; }); }],
    [5.0, '#141218', (t, h) => { h.box(0, 0, TW, 96, 0, '#1d1a22'); h.x.fillStyle = ACC; h.x.beginPath(); h.x.arc(60, 48, 16, 0, 7); h.x.fill(); h.fnt(40, 700); h.txt('Claude', 92, 62, INK); const q = 'faz um vídeo 3D de um robô conversando'; const n = Math.floor(q.length * h.sm(5.4, 7.3, t)); h.box(80, 470, 940, 120, 30, '#24212b', '#3d3946'); h.fnt(38, 500); h.txt(q.slice(0, n), 120, 545, INK); if (t < 7.5 && Math.floor(t * 3) % 2) h.x.fillRect(122 + h.x.measureText(q.slice(0, n)).width, 508, 3, 48); h.box(925, 488, 80, 80, 20, t > 7.5 && t < 7.7 ? YEL : ACC); if (t > 7.7) { h.x.strokeStyle = ACC; h.x.lineWidth = 9; h.x.beginPath(); h.x.arc(550, 300, 46, t * 7, t * 7 + 4.2); h.x.stroke(); h.fnt(40, 600); h.txt('gerando vídeo...', 550, 400, MUT, 'center'); } }],
    [8.88, '#888888', (t, h) => { h.fnt(60, 700); h.txt('resultado.mp4', 550, 380, '#444', 'center'); }],
    [14.12, '#07060c', (t, h) => { const x = h.x; const g = x.createRadialGradient(550, 385, 20, 550, 385, 520); g.addColorStop(0, 'rgba(255,122,69,.35)'); g.addColorStop(1, 'rgba(7,6,12,0)'); x.fillStyle = g; x.fillRect(0, 0, TW, TH); x.shadowColor = ACC; x.shadowBlur = 50; h.fnt(120, 900, MF); h.txt('COM A SKILL', 550, 430, INK, 'center'); x.shadowBlur = 0; }],
    [15.6, '#0c0a14', (t, h) => { const x = h.x; h.box(380, 60, 340, 650, 44, '#000', '#3a3454', 6); const g = x.createLinearGradient(400, 80, 400, 690); g.addColorStop(0, '#3b1f7a'); g.addColorStop(1, '#0c0a14'); h.box(396, 76, 308, 618, 34, g); avatar(h, 550, 330, 70, 'h'); h.box(470, 420, 160, 26, 6, YEL); x.fillStyle = 'rgba(255,255,255,.9)'; x.beginPath(); x.moveTo(530, 200); x.lineTo(578, 228); x.lineTo(530, 256); x.fill(); const v = Math.floor(100000 * h.sm(16.6, 18.3, t)); h.fnt(54, 900, MF); h.txt(v.toLocaleString('pt-BR'), 550, 560, INK, 'center'); h.fnt(30, 700); h.txt('visualizações', 550, 600, MUT, 'center'); if (t > 18.3) { const s = h.pop(t, 18.3); x.save(); x.translate(860, 200); x.rotate(0.12); x.scale(s, s); h.box(-110, -44, 220, 88, 44, G); h.fnt(46, 900, MF); h.txt('EM 24H', 0, 16, '#07140c', 'center'); x.restore(); } }],
    [19.05, '#0a0d18', (t, h) => { h.fnt(48, 800, MF); h.txt('EXPERIÊNCIA', 120, 280, MUT); h.fnt(84, 900, MF); h.txt('ANIMADOR 3D', 120, 380, INK); const k = h.sm(19.8, 21.0, t); h.box(120, 430, 860, 64, 32, 'rgba(255,255,255,.08)'); h.box(120, 430, Math.max(64, 860 * k), 64, 32, ACC); h.fnt(36, 700); h.txt(Math.round(k * 100) + '%', 980, 475, '#fff', 'right'); if (t > 21.05) { const s = h.pop(t, 21.05); h.x.save(); h.x.translate(550, 620); h.x.scale(s, s); h.x.shadowColor = YEL; h.x.shadowBlur = 30; h.fnt(96, 900, MF); h.txt('LEVEL UP', 0, 34, YEL, 'center'); h.x.restore(); } }],
    [21.85, '#07060c', (t, h) => { const W = [[21.9, 'CÂMERA', CY], [22.56, 'LUZ', YEL], [23.18, 'MOVIMENTO', PK], [23.9, 'SOM', G]]; let i = 0; while (i < 3 && t >= W[i + 1][0]) i++; const [t0, w, c] = W[i]; const s = h.pop(t, t0, 0.2); h.x.save(); h.x.translate(550, 400); h.x.scale(s, s); h.x.shadowColor = c; h.x.shadowBlur = 40; h.fnt(w.length > 6 ? 150 : 210, 900, MF); h.txt(w, 0, 70, c, 'center'); h.x.restore(); if (i === 3) for (let b = 0; b < 30; b++) { const hh = 30 + 150 * Math.abs(Math.sin(b * 1.3 + t * 9)); h.x.fillStyle = G; h.x.fillRect(110 + b * 30, 700 - hh, 20, hh); } }],
    [24.4, '#0a0d18', (t, h) => { const x = h.x; h.fnt(48, 800, MF); h.txt('VOZ', 80, 150, ACC); h.txt('BOCA', 80, 400, CY); for (let i = 0; i < 52; i++) { const v = Math.abs(Math.sin(i * 0.9) * Math.sin(i * 0.31 + 1)); const X = 260 + i * 15; x.fillStyle = ACC; x.fillRect(X, 140 - v * 90, 10, v * 180); x.fillStyle = CY; x.fillRect(X, 400 - v * 70, 10, v * 140); } const ph = 260 + ((t - 24.4) / 3.2) * 780; x.fillStyle = '#fff'; x.fillRect(ph, 40, 4, 460); h.fnt(46, 800, MF); h.txt('CORTES', 80, 640, YEL); for (let i = 0; i < 6; i++) { const X = 260 + i * 140; h.box(X, 590, 120, 70, 10, t > 24.4 + i * 0.5 ? 'rgba(255,209,102,.8)' : 'rgba(255,255,255,.1)'); } }],
    [27.82, '#0b0d14', (t, h) => { h.fnt(40, 600, 'Consolas, monospace'); const n = Math.min(CODE.length, Math.floor((t - 27.82) * 7) + 1); for (let i = 0; i < n; i++) { const L = CODE[i]; const k = L.indexOf('('); h.txt(String(i + 1).padStart(2, ' '), 70, 130 + i * 70, '#555'); h.txt(L.slice(0, k > 0 ? k : L.length), 140, 130 + i * 70, CY); if (k > 0) h.txt(L.slice(k), 140 + h.x.measureText(L.slice(0, k)).width, 130 + i * 70, YEL); } if (t > 28.9) { h.x.globalAlpha = h.sm(28.9, 29.1, t); h.box(620, 650, 420, 76, 38, G); h.fnt(40, 900, MF); h.txt('render ✓', 830, 702, '#07140c', 'center'); h.x.globalAlpha = 1; } }],
    [29.15, '#101016', (t, h) => { h.box(170, 140, 760, 470, 26, '#1b1b22', '#33333d'); h.box(170, 140, 760, 70, 26, '#25252e'); h.box(240, 260, 140, 140, 20, '#55555f'); h.fnt(44, 800, MF); h.txt('Programa de 3D', 420, 320, INK); h.fnt(34, 600); h.txt('Último acesso:', 420, 380, MUT); stamp(h, t, 30.3, 'NUNCA', 640, 500, 96, -0.08); }],
    [32.6, '#07060c', (t, h) => { const s = h.pop(t, 32.75, 0.35); h.x.save(); h.x.translate(550, 380); h.x.scale(s, s); const g = h.x.createLinearGradient(-200, 0, 200, 0); g.addColorStop(0, YEL); g.addColorStop(0.5, ACC); g.addColorStop(1, PK); h.x.shadowColor = ACC; h.x.shadowBlur = 50; h.fnt(330, 900, MF); h.txt('3D', 0, 115, g, 'center'); h.x.restore(); h.fnt(52, 800, MF); h.txt('COMENTA', 550, 640, INK, 'center'); }],
  ],
};
