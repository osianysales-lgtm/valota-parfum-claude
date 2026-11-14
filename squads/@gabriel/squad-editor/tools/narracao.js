// NARRAÇÃO (Caminho 1) — o motion passa a seguir a voz, não um ritmo de leitura estimado
//
// Recebe a narração (MP3, WAV, M4A — ou o próprio vídeo MP4/MOV: usa só o áudio) e o roteiro (texto exato), transcreve a narração com tempo por palavra
// e cola esses tempos nas palavras do ROTEIRO (a grafia na tela continua sendo a do roteiro).
//
// Uso:
//   node tools/narracao.js --audio "C:/.../narracao.mp3" --roteiro output/vN/roteiro.txt \
//        [--ficha output/vN/ficha.json] [--modelo large-v3-turbo] --out output/vN/narracao.json
//   (--transcricao arquivo.json reaproveita uma transcrição já feita)
//
// Gera output/vN/narracao.json  → { duracao, audio, palavras:[{word,start,end}], divergencias:[...] }
//   e output/vN/narracao.md      → resumo: duração, palavras sem par, trechos onde a fala difere do roteiro
// Depois:
//   node tools/frases.js --editada output/vN/narracao.json --out output/vN/significado.json   (frases com o tempo real)
//   node daphne.js anim.html <duracao> --narracao "C:/.../narracao.mp3" ...                   (render com a voz)

'use strict';
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const argv = process.argv.slice(2);
const opt = {};
for (let i = 0; i < argv.length; i++) if (argv[i].startsWith('--')) {
  const k = argv[i].slice(2);
  opt[k] = (i + 1 < argv.length && !argv[i + 1].startsWith('--')) ? argv[++i] : true;
}
const lerJSON = p => JSON.parse(fs.readFileSync(p, 'utf8').replace(/^\uFEFF/, ''));
const norm = s => String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\w%]+/g, '');
const r3 = x => Math.round(x * 1000) / 1000;

const SCRIPT_PY = `
import json, sys, io, warnings
warnings.filterwarnings('ignore')
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
audio, modelo, prompt = sys.argv[1], sys.argv[2], (sys.argv[3] if len(sys.argv) > 3 else '') or None

def carregar(p):
    # WAV 16 kHz mono (o que o ffmpeg gera acima) lido direto: o decodificador padrão do faster-whisper usa o PyAV,
    # e o PyAV 19 (instalado hoje pelo pip) quebra com "open() got an unexpected keyword argument 'metadata_errors'"
    try:
        import wave, numpy as np
        with wave.open(p, 'rb') as w:
            if w.getframerate() == 16000 and w.getnchannels() == 1 and w.getsampwidth() == 2:
                return np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768.0
    except Exception:
        pass
    return p

try:
    from faster_whisper import WhisperModel
    m = WhisperModel(modelo, device='cpu', compute_type='int8')
    segs, _ = m.transcribe(carregar(audio), language='pt', word_timestamps=True, initial_prompt=prompt, beam_size=5)
    W = [{'word': w.word, 'start': w.start, 'end': w.end} for s in segs for w in (s.words or [])]
except ImportError:
    import whisper
    m = whisper.load_model(modelo if modelo in whisper.available_models() else 'medium')
    r = m.transcribe(audio, language='pt', word_timestamps=True, verbose=False, fp16=False, initial_prompt=prompt)
    W = [{'word': w['word'], 'start': w['start'], 'end': w['end']} for s in r.get('segments', []) for w in s.get('words', [])]
print(json.dumps({'palavras': W}, ensure_ascii=False))
`.trim();

function transcrever(wav, glossario) {
  const setup = require('./setup');
  const amb = setup.garantir(['python', 'whisper']);
  const prompt = glossario.length ? `Termos: ${glossario.join(', ')}.` : '';
  console.log(`[Narração] Transcrevendo (${opt.modelo || 'large-v3-turbo'})...`);
  const r = spawnSync(amb.python, ['-c', SCRIPT_PY, wav, opt.modelo || 'large-v3-turbo', prompt], { encoding: 'utf8', timeout: 3600000, maxBuffer: 50 * 1024 * 1024 });
  if (r.status !== 0) throw new Error('Transcrição falhou: ' + (r.stderr || '').slice(-600) + '\n(1ª vez: o modelo de voz precisa de internet para baixar)');
  const s = r.stdout || ''; return JSON.parse(s.slice(s.indexOf('{'))).palavras;
}

// Alinha as palavras do roteiro com as palavras faladas (programação dinâmica, como um "diff")
function alinhar(roteiro, falado) {
  const A = roteiro.map(norm), B = falado.map(w => norm(w.word));
  const n = A.length, m = B.length;
  const D = Array.from({ length: n + 1 }, () => new Int32Array(m + 1));
  for (let i = 0; i <= n; i++) D[i][0] = i;
  for (let j = 0; j <= m; j++) D[0][j] = j;
  for (let i = 1; i <= n; i++) for (let j = 1; j <= m; j++) {
    const igual = A[i - 1] === B[j - 1] || (A[i - 1].length > 3 && B[j - 1].length > 3 && (A[i - 1].startsWith(B[j - 1]) || B[j - 1].startsWith(A[i - 1])));
    D[i][j] = Math.min(D[i - 1][j] + 1, D[i][j - 1] + 1, D[i - 1][j - 1] + (igual ? 0 : 1));
  }
  const par = new Array(n).fill(-1), extras = [];
  let i = n, j = m;
  while (i > 0 && j > 0) {
    const igual = A[i - 1] === B[j - 1] || (A[i - 1].length > 3 && B[j - 1].length > 3 && (A[i - 1].startsWith(B[j - 1]) || B[j - 1].startsWith(A[i - 1])));
    if (D[i][j] === D[i - 1][j - 1] + (igual ? 0 : 1)) { if (igual) par[i - 1] = j - 1; else extras.push(j - 1); i--; j--; }
    else if (D[i][j] === D[i - 1][j] + 1) i--;
    else { extras.push(j - 1); j--; }
  }
  while (j > 0) extras.push(--j);
  return { par, extras: extras.reverse() };
}

(function main() {
  if (!opt.audio || !opt.roteiro) { console.error('Uso: node tools/narracao.js --audio narracao.mp3 --roteiro roteiro.txt --out output/vN/narracao.json'); process.exit(1); }
  const audio = path.resolve(opt.audio), out = path.resolve(opt.out || 'narracao.json');
  if (!fs.existsSync(audio)) { console.error('[Narração] Arquivo não encontrado: ' + audio); process.exit(1); }
  const amb = require('./setup').garantir(['ffmpeg']);
  const ff = amb.ffmpeg || 'ffmpeg', fp = amb.ffprobe || 'ffprobe';
  const duracao = parseFloat(spawnSync(fp, ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', audio], { encoding: 'utf8' }).stdout);
  const ficha = opt.ficha && fs.existsSync(opt.ficha) ? lerJSON(opt.ficha) : {};
  const glossario = ficha.glossario || [];

  let falado;
  if (opt.transcricao) { const t = lerJSON(opt.transcricao); falado = t.palavras || (t.segments || []).flatMap(s => s.words || []); }
  else {
    const wav = out.replace(/\.json$/i, '') + '_16k.wav';
    spawnSync(ff, ['-y', '-loglevel', 'error', '-i', audio, '-ar', '16000', '-ac', '1', wav]);
    falado = transcrever(wav, glossario);
    try { fs.unlinkSync(wav); } catch {}
  }
  falado = falado.filter(w => String(w.word).trim()).map(w => ({ word: String(w.word).trim(), start: +w.start, end: +w.end }));

  const texto = fs.readFileSync(opt.roteiro, 'utf8').replace(/^\uFEFF/, '').replace(/\s+/g, ' ').trim();
  const roteiro = texto.split(' ');
  const { par, extras } = alinhar(roteiro, falado);

  // tempos: palavra com par herda o tempo falado; sem par, é interpolada entre as vizinhas
  const palavras = roteiro.map((w, i) => par[i] >= 0 ? { word: w, start: falado[par[i]].start, end: falado[par[i]].end } : { word: w, start: null, end: null });
  for (let i = 0; i < palavras.length; i++) if (palavras[i].start == null) {
    let a = i - 1; while (a >= 0 && palavras[a].start == null) a--;
    let b = i + 1; while (b < palavras.length && palavras[b].start == null) b++;
    const t0 = a >= 0 ? palavras[a].end : 0, t1 = b < palavras.length ? palavras[b].start : Math.max(t0 + 0.3, duracao);
    const k = b - a - 1, pos = i - a;
    palavras[i].start = t0 + (t1 - t0) * (pos - 1) / k; palavras[i].end = t0 + (t1 - t0) * pos / k; palavras[i].estimada = true;
  }
  palavras.forEach(p => { p.start = r3(p.start); p.end = r3(p.end); });

  const semPar = palavras.filter(p => p.estimada).map(p => p.word);
  const aMais = extras.map(j => falado[j].word);
  const divergencias = [];
  if (semPar.length) divergencias.push(`No roteiro mas não reconhecidas na fala (tempo estimado): ${semPar.join(', ')}`);
  if (aMais.length) divergencias.push(`Faladas mas fora do roteiro (não entram na tela): ${aMais.join(', ')}`);
  const fimFala = palavras.length ? palavras[palavras.length - 1].end : 0;

  const res = { audio, duracao: r3(duracao), fim_da_fala: r3(fimFala), palavras, divergencias };
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify(res, null, 2), 'utf8');
  const pct = Math.round(100 * (1 - semPar.length / Math.max(1, roteiro.length)));
  const md = [`# Narração — ${path.basename(audio)}`, '',
    `- Duração do áudio: ${duracao.toFixed(2)}s · fala termina em ${fimFala.toFixed(2)}s`,
    `- Palavras do roteiro encontradas na fala: ${pct}% (${roteiro.length - semPar.length}/${roteiro.length})`,
    ...divergencias.map(d => '- ⚠ ' + d), '',
    pct < 85 ? '**A narração não bate com o roteiro.** Confirme com o usuário qual vale (o texto na tela é sempre o do roteiro).' : 'Narração e roteiro batem.'].join('\n');
  fs.writeFileSync(out.replace(/\.json$/i, '.md'), md + '\n', 'utf8');
  console.log(md);
  console.log(`\n[Narração] Tempos por palavra → ${out}\n[Narração] Próximo: node tools/frases.js --editada ${path.relative(process.cwd(), out)} --out ${path.relative(process.cwd(), path.join(path.dirname(out), 'significado.json'))}`);
})();
