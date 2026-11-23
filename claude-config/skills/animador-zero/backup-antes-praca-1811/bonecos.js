// Ajudantes da serie de bonecos (importe no roteiro: import { criaRoteiro } from '/src/bonecos.js').
// Legenda no tempo das palavras: no maximo `max` caracteres por linha (padrao 20), 2 linhas por bloco, sem cortar palavra
// e sem deixar palavrinha ("de", "e", "o"...) pendurada no fim da linha.
export const norm = s => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9$*]/g, '');
const LEVE = /^(de|da|do|das|dos|e|o|a|os|as|um|uma|que|pra|no|na|em|ou|se|com|eu|me|te|tipo|sem|por)$/i;

export function criaRoteiro(F, { fortes = [], max = 20, quemDe = f => (f.quem === 'rafa' ? 'h' : 'a') } = {}) {
  const FORTES = new Set(fortes.map(norm));
  const ini = i => F[i].ini, fim = i => F[i].fim;
  const achar = (i, txt, depois = 0) => F[i].palavras.findIndex((p, k) => k >= depois && norm(p[0]).startsWith(norm(txt)));
  const tw = (i, txt, depois = 0) => { const k = achar(i, txt, depois); if (k < 0) throw new Error(`palavra "${txt}" nao achada na fala ${i}`); return F[i].palavras[k][1]; };
  const quem = i => quemDe(F[i]);
  const L = a => a.map(w => w[0]).join(' ').length;
  const fmt = a => a.map(w => (FORTES.has(norm(w[0])) ? `<b>${w[0]}</b>` : w[0])).join(' ');

  function blocos(i, o = {}) {
    const P = F[i].palavras, T = F[i].texto.split(/\s+/);
    const toks = P.map((p, k) => [T.length === P.length ? T[k] : p[0], p[1], p[2]]);
    const out = []; let linhas = [[]];
    const fecha = () => { const ls = linhas.filter(l => l.length); if (ls.length) { const all = ls.flat(); out.push([all[0][1], all[all.length - 1][2], quem(i), ls.map(fmt).join('<br>'), o]); } linhas = [[]]; };
    for (const w of toks) {
      let cur = linhas[linhas.length - 1];
      if (cur.length && L(cur.concat([w])) > max) {
        const sobra = []; while (cur.length > 1 && LEVE.test(cur[cur.length - 1][0])) sobra.unshift(cur.pop());
        if (linhas.length === 2) { fecha(); linhas = [sobra]; } else linhas.push(sobra);
        cur = linhas[linhas.length - 1];
      }
      cur.push(w);
      if (/[.?!…]$/.test(w[0]) || (/,$/.test(w[0]) && linhas.length === 2 && L(cur) >= 8)) fecha();
    }
    fecha();
    for (let k = 0; k < out.length - 1; k++) out[k][1] = Math.max(out[k][1], out[k + 1][0] - 0.02);
    return out;
  }
  // cortes automaticos: 1 plano por fala alternando os angulos de quem fala, plano aberto no meio das falas longas,
  // `inserts` = [[inicio, fim, 'SCR'], ...] (ex.: tela do celular) e `final` = plano da chamada pra camera.
  function cortes({ inserts = [], final = null, est = 2.2, longa = 4.5, gancho = 8 } = {}) {   // ate `gancho` s: so planos abertos (texto em cima, cabecas longe dele)
    const H = ['CH', 'LOWH', 'OTSV', 'CH', 'MOUTH'], A = ['CV', 'OTS', 'LOWV', 'CV', 'MOUTHV'], W = ['W2', 'ORB', 'W2', 'ORB2'];
    let hi = 0, ai = 0, wi = 0; const out = [[0, 'EST']];
    F.forEach((f, i) => {
      const q = quem(i), proximo = () => (q === 'h' ? H[hi++ % H.length] : A[ai++ % A.length]);
      if (i === F.length - 1 && final) { out.push([f.ini - 0.1, final]); return; }
      if (f.ini < gancho - 0.5) { if (i > 0) out.push([f.ini - 0.05, out[out.length - 1][1] === 'EST' ? 'W2' : 'EST']); if (f.fim > gancho) out.push([gancho, proximo()]); return; }
      if (i === 0) { if (f.fim - est > 1.0) out.push([est, proximo()]); }
      else out.push([f.ini - 0.05, proximo()]);
      if (f.fim - f.ini > longa) { const P = f.palavras, k = Math.floor(P.length / 2); out.push([P[k][1] - 0.05, W[wi++ % W.length]]); }
    });
    const ativo = t => { let s = out[0][1]; for (const [a, n] of out) if (a <= t) s = n; return s; };
    let res = out.slice();
    for (const [a, b, s] of inserts) { const volta = ativo(b); res = res.filter(([t]) => t < a || t > b); res.push([a, s], [b, volta]); }
    res.sort((x, y) => x[0] - y[0]);
    return res.filter((c, k) => k === 0 || c[1] !== res[k - 1][1]);
  }
  return { ini, fim, achar, tw, quem, blocos, cortes };
}
