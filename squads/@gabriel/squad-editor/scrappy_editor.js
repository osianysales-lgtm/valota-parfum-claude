// SALSICHA EDITOR v3 — edição de vídeo gravado (Caminho 2) e híbrido (Caminho 3)
//
// Uso:
//   node scrappy_editor.js --input <pasta_ou_arquivo> [opções]
//
// ENTRADA E ANÁLISE
//   --input        <caminho>   Pasta com vídeos ou arquivo único (obrigatório)
//   --ficha        <json>      Ficha da marca (gerada pelo Fred). Usa: legenda, glossario, cores, fontes.
//   --glossario    <txt|json>  Nomes próprios/termos para a transcrição acertar (um por linha)
//   --modelo       <nome>      Whisper: small | medium | large-v3 | large-v3-turbo (padrão: large-v3-turbo)
//   --beam         <n>         Precisão da transcrição: 1 (padrão, ~4x mais rápido) ou 5 (mais lento)
//   --python       <exe>       Executável do Python (padrão: python; no Windows pode ser "py")
//   --limite-transcricao <s>   Para a transcrição com segurança depois de N segundos (padrão 480) e sai com código 4
//                              ("TRANSCRIÇÃO PARCIAL"). Rodar o MESMO comando continua de onde parou. 0 = sem limite; mínimo 120.
//   --dry-run                  Analisa e mostra o plano sem gerar vídeo
//   --simular                  Com --cortes: calcula os tempos do vídeo editado (transcricao_editada.json)
//                              SEM renderizar — usado para montar o plano e posicionar camadas
//   --plano        <json>      Plano aprovado (padrão: plano.json na pasta de saída). OBRIGATÓRIO para editar:
//                              sem aprovação (tools/plano.js aprovar) a edição é bloqueada
//   --folhas                   (dry-run) Gera folhas de miniaturas de cada clipe em <saída>/folhas/
//   --json-out     <arquivo>   Salva a análise (transcrição, pausas, regravações) em JSON
//   --analise      <arquivo>   Reaproveita análise salva (pula a transcrição).
//                              Corrija nomes próprios nesse JSON antes de editar.
//
// CORTE
//   --cortes       <arquivo>   Cortes editoriais em ordem final:
//                              { "cortes": [ { "clipe": 1, "inicio": 2.5, "fim": 7.85, "zoom": 1.08 } ] }
//                              (clipe começa em 1; tempos do clipe; "zoom" opcional por trecho)
//                              "enfases": [{ "inicio": 5.8, "fim": 7.0, "zoom": 1.18 }] → punch-in no
//                              trecho (tempos do clipe; encaixa nas palavras; sem fade nas emendas)
//   --pausa        <s>         Remove pausas entre palavras maiores que isso (padrão 0.35)
//   --transition   <tipo>      none | fade (padrão none — corte seco; fade cria "rosto fantasma")
//   --zoom         auto|off    auto: alterna enquadramento 1.00 / 1.08 entre cortes (padrão off)
//
// CAMADAS (Caminho 3 — híbrido)
//   --camadas      <json>      Motion/B-roll por cima ou no lugar do vídeo gravado:
//      { "camadas": [ { "arquivo": "anim.html" | "broll.mp4" | "overlay.mov",
//                       "inicio": 7.8, "fim": 18.8,
//                       "layout": "cheia" | "topo" | "sobreposta",
//                       "legenda": false } ] }
//      cheia      → a camada ocupa a tela toda (a voz continua)
//      topo       → tela dividida: camada em cima, pessoa embaixo
//      sobreposta → camada transparente (.mov alfa ou .html renderizado com alfa) por cima
//      "legenda": false → esconde a legenda durante a camada
//      (tempos no vídeo JÁ EDITADO — veja output/transcricao_editada.json)
//   --encerramento <html|mp4> Motion de encerramento em tela cheia nos últimos segundos (sem legenda)
//   --encerramento-duracao <s> Duração quando o encerramento é .html (padrão 4.5)
//
// LEGENDA, ÁUDIO E SAÍDA
//   --legendas                 Legenda karaokê (estilo de ficha.legenda ou --legenda-estilo)
//   --legenda-estilo <json>    Estilo da legenda (sobrepõe a ficha). Ver legenda_motion_template.js
//   --cor-destaque <#hex>      Atalho para estilo.corDestaque
//   --bgm <arquivo> [--bgm-volume 0.12]  Música de fundo com ducking sob a voz
//   --output       <nome.mp4>  Arquivo final (padrão: output/video_editado.mp4)
//   --resolucao    <WxH>       Padrão 1080x1920 (--horizontal = 1920x1080)
//   --fps          <n>         Padrão 30 (fixo, CFR)
//   --qualidade    social|maxima  social (padrão): CRF 20 com teto de 12 Mbps — o dobro do que o Instagram entrega,
//                              sem diferença visível e com arquivo bem menor. maxima: CRF 18 sem teto (arquivo mestre)
//   --max-mb       <n>         Limita o tamanho final (só se o usuário pedir)
//   --sem-cache                Refaz todos os trechos e renders (por padrão, rodadas de ajuste reaproveitam o que não mudou)
//   --sem-qa                   Pula a conferência automática no final
//
// COMO O VÍDEO É MONTADO (v3.8)
//   Os clipes NÃO são mais convertidos inteiros: a transcrição usa só o áudio e cada trecho escolhido é cortado direto
//   do arquivo original (já em 1080x1920, 30 fps, HDR→SDR quando a gravação é HDR) num intermediário quase sem perda.
//   Os trechos são unidos sem recodificar e o vídeo é codificado UMA vez no final, já com camadas, legenda e áudio.
//   Legenda e camadas renderizam em paralelo enquanto os trechos são cortados.
//   Cache em <saída>/cache/: trechos e renders que não mudaram são reaproveitados na próxima rodada.

'use strict';

const path = require('path');
const fs = require('fs');
const { spawnSync } = require('child_process');
const { gerarHTMLLegenda } = require('./legenda_motion_template');

// Primeira execução neste computador: instala o que faltar (npm, FFmpeg) — ver tools/setup.js
const SETUP = (() => { try { return require('./tools/setup'); } catch { return null; } })();
let AMB = {};
try { if (SETUP) AMB = SETUP.garantir(['pacotes', 'ffmpeg']); }
catch (e) { console.error('[Salsicha] ' + e.message); process.exit(1); }

// ─────────────────────────────────────────────────────────────────────────────
// ARGUMENTOS
// ─────────────────────────────────────────────────────────────────────────────
function parseArgs(argv) {
  const r = {};
  for (let i = 0; i < argv.length; i++) {
    if (!argv[i].startsWith('--')) continue;
    const key = argv[i].slice(2);
    if (i + 1 < argv.length && !argv[i + 1].startsWith('--')) r[key] = argv[++i];
    else r[key] = true;
  }
  return r;
}
const args = parseArgs(process.argv.slice(2));
if (!args.input) {
  console.error('\n[Salsicha] Erro: --input é obrigatório. Veja o cabeçalho de scrappy_editor.js para as opções.\n');
  process.exit(1);
}
const lerJSON = p => JSON.parse(fs.readFileSync(p, 'utf8').replace(/^\uFEFF/, ''));

const FICHA = args.ficha ? require('./tools/ficha').carregarFicha(path.resolve(args.ficha)) : null;   // caminhos de fonte/logo resolvidos
const CFG = {
  inputPath: path.resolve(args.input),
  legendas: !!args.legendas,
  outputFile: path.resolve(args.output || 'output/video_editado.mp4'),
  modelo: args.modelo || 'large-v3-turbo',   // o 'small' perde regravações (frase repetida some da transcrição): medido
  beam: parseInt(args.beam || '1', 10),
  python: args.python || process.env.SCRAPPY_PYTHON || null, // null = o setup encontra/instala
  pausa: parseFloat(args.pausa || '0.35'),
  resolucao: args.horizontal ? '1920x1080' : (args.resolucao || '1080x1920'),
  fps: parseInt(args.fps || '30', 10),
  transition: args.transition || 'none',
  zoom: args.zoom || 'off',
  dryRun: !!args['dry-run'],
  simular: !!args.simular,
  folhas: !!args.folhas,
  jsonOut: args['json-out'] ? path.resolve(args['json-out']) : null,
  analise: args.analise ? path.resolve(args.analise) : null,
  cortes: args.cortes ? path.resolve(args.cortes) : null,
  camadas: args.camadas ? path.resolve(args.camadas) : null,
  encerramento: args.encerramento ? path.resolve(args.encerramento) : null,
  bgmFile: args.bgm ? path.resolve(args.bgm) : null,
  bgmVolume: parseFloat(args['bgm-volume'] || '0.12'),
  maxMb: args['max-mb'] ? parseFloat(args['max-mb']) : null,
  qualidade: String(args.qualidade || 'social').toLowerCase() === 'maxima' ? 'maxima' : 'social',
  // mínimo de 120 s: cada rodada recarrega o modelo (~20 s); com um limite menor a retomada quase não avançaria
  limiteTranscricao: (v => (v > 0 ? Math.max(v, 120) : 0))(parseFloat(args['limite-transcricao'] ?? '480')),
  cache: !args['sem-cache'],
  qa: !args['sem-qa'],
};

// ── PLANO APROVADO (tools/plano.js) — obrigatório para editar; a análise (--dry-run) não precisa
const PLANO_MOD = require('./tools/plano');
CFG.plano = args.plano ? path.resolve(args.plano) : PLANO_MOD.acharPlano(path.dirname(CFG.outputFile));
const PLANO = CFG.plano && fs.existsSync(CFG.plano) ? lerJSON(CFG.plano) : null;
if (PLANO) {
  // o que foi aprovado é o que é renderizado: cortes e camadas vêm do plano
  const doPlano = k => PLANO[k] ? path.resolve(path.dirname(CFG.plano), PLANO[k]) : null;
  for (const k of ['cortes', 'camadas']) {
    const pp = doPlano(k);
    if (pp && CFG[k] && pp !== CFG[k]) console.warn(`[Salsicha] --${k} diferente do plano aprovado — usando o do plano: ${pp}`);
    if (pp) CFG[k] = pp;
  }
}
const PALAVRAS_CHAVE = (PLANO && PLANO.legenda && PLANO.legenda.palavras_chave) || [];

// Estilo da legenda: padrão da squad < ficha.legenda < --legenda-estilo < --cor-destaque
const ESTILO_LEGENDA = Object.assign({},
  (FICHA && FICHA.legenda) || {},
  args['legenda-estilo'] ? require('./tools/ficha').carregarFicha(path.resolve(args['legenda-estilo'])) : {},
  args['cor-destaque'] ? { corDestaque: args['cor-destaque'] } : {});
if (PLANO && PLANO.legenda && PLANO.legenda.destaque) ESTILO_LEGENDA.modoDestaque = PLANO.legenda.destaque === 'chave' || PLANO.legenda.destaque === 'ambos' ? PLANO.legenda.destaque : 'falada';
if (PLANO && PLANO.legenda && PLANO.legenda.estilo) ESTILO_LEGENDA.destaque = PLANO.legenda.estilo;
if (!ESTILO_LEGENDA.corDestaque && FICHA && FICHA.cores && FICHA.cores.destaque) ESTILO_LEGENDA.corDestaque = FICHA.cores.destaque;
if (!ESTILO_LEGENDA.fonte && FICHA && FICHA.fontes && (FICHA.fontes.legenda || FICHA.fontes.texto)) ESTILO_LEGENDA.fonte = FICHA.fontes.legenda || FICHA.fontes.texto;

function carregarGlossario() {
  const termos = [];
  if (FICHA && Array.isArray(FICHA.glossario)) termos.push(...FICHA.glossario);
  if (args.glossario) {
    const p = path.resolve(args.glossario);
    const txt = fs.readFileSync(p, 'utf8').replace(/^\uFEFF/, '');
    if (p.endsWith('.json')) { const j = JSON.parse(txt); termos.push(...(Array.isArray(j) ? j : j.termos || [])); }
    else termos.push(...txt.split(/\r?\n/).map(s => s.trim()).filter(Boolean));
  }
  return [...new Set(termos)];
}
const GLOSSARIO = carregarGlossario();

const [RES_W, RES_H] = CFG.resolucao.split('x').map(Number);
const OUT_DIR = path.dirname(CFG.outputFile);
const TEMP_DIR = path.join(OUT_DIR, 'temp');
const CACHE_DIR = path.join(OUT_DIR, 'cache');
const EXTS_OK = new Set(['.mp4', '.mov', '.avi', '.mkv', '.webm', '.m4v']);

// ─────────────────────────────────────────────────────────────────────────────
// FFMPEG
// ─────────────────────────────────────────────────────────────────────────────
function acharBin(nome) {
  try {
    const r = spawnSync(process.platform === 'win32' ? 'where' : 'which', [nome], { encoding: 'utf8' });
    const p = (r.stdout || '').split(/\r?\n/)[0].trim();
    if (p && fs.existsSync(p)) return p;
  } catch {}
  return null;
}
const FFMPEG = (AMB.ffmpeg && fs.existsSync(AMB.ffmpeg) ? AMB.ffmpeg : null) || acharBin('ffmpeg') || (() => { try { return require('@ffmpeg-installer/ffmpeg').path; } catch { return 'ffmpeg'; } })();
const FFPROBE = (AMB.ffprobe && fs.existsSync(AMB.ffprobe) ? AMB.ffprobe : null) || acharBin('ffprobe') || FFMPEG.replace(/ffmpeg(\.exe)?$/i, 'ffprobe$1');

function ff(argsArr, timeout = 1800000) {
  const r = spawnSync(FFMPEG, ['-y', '-hide_banner', '-loglevel', 'error', ...argsArr], { encoding: 'utf8', timeout, maxBuffer: 50 * 1024 * 1024 });
  if (r.status !== 0) throw new Error(`FFmpeg falhou:\n${(r.stderr || '').slice(-900)}\nArgs: ${argsArr.join(' ').slice(0, 400)}`);
  return r.stderr || '';
}
function ffAnalise(argsArr) {
  const r = spawnSync(FFMPEG, ['-hide_banner', ...argsArr], { encoding: 'utf8', timeout: 1800000, maxBuffer: 50 * 1024 * 1024 });
  return (r.stdout || '') + (r.stderr || '');
}
function probe(arquivo, entries) {
  const r = spawnSync(FFPROBE, ['-v', 'error', '-show_entries', entries, '-of', 'default=noprint_wrappers=1:nokey=1', arquivo], { encoding: 'utf8' });
  return (r.stdout || '').trim();
}
function duracaoVideo(arquivo) {
  const d = parseFloat(probe(arquivo, 'format=duration'));
  if (!isNaN(d)) return d;
  const m = ffAnalise(['-i', arquivo]).match(/Duration:\s*(\d+):(\d+):(\d+\.?\d*)/);
  if (m) return +m[1] * 3600 + +m[2] * 60 + parseFloat(m[3]);
  throw new Error(`Não foi possível obter a duração de: ${arquivo}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// UTILITÁRIOS
// ─────────────────────────────────────────────────────────────────────────────
const log = msg => console.log(`[Salsicha] ${msg}`);
const etapa = (n, msg) => console.log(`\n[Salsicha] ── ${n}: ${msg}`);
const mkdir = p => fs.mkdirSync(p, { recursive: true });
const fmt = s => { const m = Math.floor(s / 60); const x = (s % 60).toFixed(1); return m > 0 ? `${m}m${x}s` : `${x}s`; };
const norm = s => String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
// Intermediário (trechos): quase sem perda e rápido — ainda vai ser codificado de novo no final.
const VCODEC_INTER = ['-c:v', 'libx264', '-crf', '16', '-preset', 'veryfast', '-pix_fmt', 'yuv420p'];
const ACODEC_INTER = ['-c:a', 'pcm_s16le', '-ar', '48000', '-ac', '2'];   // PCM: emenda sem estalo nem deriva
// Final: UMA codificação. "social" = CRF 20 + teto de 12 Mbps (o Instagram recodifica tudo para ~4–6 Mbps);
// preset medium: arquivo menor que o "fast" na mesma qualidade, sem o custo do "slow".
const VCODEC_FINAL = CFG.qualidade === 'maxima'
  ? ['-c:v', 'libx264', '-crf', '18', '-preset', 'slow', '-pix_fmt', 'yuv420p']
  : ['-c:v', 'libx264', '-crf', '20', '-preset', 'medium', '-maxrate', '12M', '-bufsize', '24M', '-pix_fmt', 'yuv420p'];
const COR_709 = ['-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-color_range', 'tv'];
// Os filtros zeram primárias/transferência no quadro e o x264 só grava a matriz: o bitstream filter escreve as três marcas
// (bt709) direto no H.264 do arquivo final. Medido: sem ele, color_transfer/color_primaries saem "unknown".
const BSF_COR_709 = ['-bsf:v', 'h264_metadata=colour_primaries=1:transfer_characteristics=1:matrix_coefficients=1:video_full_range_flag=0'];
const ACODEC = ['-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-ac', '2'];
const COR = require('./tools/cor');
const hdrDe = arquivo => COR.filtroHDR(arquivo, FFMPEG, FFPROBE);
const sha1 = x => require('crypto').createHash('sha1').update(typeof x === 'string' ? x : JSON.stringify(x)).digest('hex').slice(0, 20);
const carimbo = p => { const st = fs.statSync(p); return `${path.resolve(p)}|${st.size}|${Math.round(st.mtimeMs)}`; };

// ─────────────────────────────────────────────────────────────────────────────
// 1. COLETAR (os originais são lidos direto: nada de converter o clipe inteiro)
// ─────────────────────────────────────────────────────────────────────────────
function coletarArquivos(p) {
  const st = fs.statSync(p);
  if (st.isFile()) return [p];
  const lista = fs.readdirSync(p).filter(f => EXTS_OK.has(path.extname(f).toLowerCase()) && !f.startsWith('.'))
    .map(f => path.join(p, f)).sort();
  if (!lista.length) throw new Error(`Nenhum vídeo encontrado em: ${p}`);
  return lista;
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. TRANSCRIÇÃO — faster-whisper (se instalado) ou openai-whisper, com glossário
// ─────────────────────────────────────────────────────────────────────────────
// Transcreve todos os clipes numa ÚNICA chamada do Python: o modelo é carregado uma vez só
// (cada carga custa ~15 s) e o áudio WAV 16 kHz mono é lido direto, sem passar pelo PyAV
// (o decodificador padrão do faster-whisper quebra em algumas versões do PyAV).
// beam_size=1 (padrão) é ~4x mais rápido que 5 e mantém ~98% do texto; o glossário e a revisão
// do Fred corrigem o resto. Use --beam 5 só se a fala estiver muito difícil.
//
// EM PARTES, COM RETOMADA (v3.8): cada trecho de fala transcrito é salvo na hora em <saída>/cache/transcricao/.
// Se a execução cair (ou passar do tempo-limite), rodar o MESMO comando continua de onde parou — dentro do
// mesmo clipe, a partir do fim da última frase completa. Clipe já transcrito nunca é transcrito de novo.
// --limite-transcricao <s> (padrão 480 = 8 min): ao passar disso, para com segurança e sai com código 4
// ("TRANSCRIÇÃO PARCIAL"), para cada chamada caber no tempo de um comando em primeiro plano. 0 = sem limite.
const SCRIPT_TRANSCRICAO = `
import json, sys, io, os, time, warnings
warnings.filterwarnings('ignore')
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
modelo, prompt, beam, limite, jobs_json = sys.argv[1], (sys.argv[2] or None), int(sys.argv[3]), float(sys.argv[4]), sys.argv[5]
jobs = json.load(open(jobs_json, encoding='utf-8'))
T0 = time.time()
SR = 16000

def gravar(p, obj):
    tmp = p + '.tmp'
    with open(tmp, 'w', encoding='utf-8') as f: json.dump(obj, f, ensure_ascii=False)
    os.replace(tmp, p)

def ler(p, padrao):
    try:
        with open(p, encoding='utf-8') as f: return json.load(f)
    except Exception: return padrao

def carregar(p):
    import numpy as np
    try:
        import wave
        with wave.open(p, 'rb') as w:
            if w.getframerate() == SR and w.getnchannels() == 1 and w.getsampwidth() == 2:
                return np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768.0
    except Exception:
        pass
    from faster_whisper import decode_audio
    return decode_audio(p, sampling_rate=SR)

def passou():
    return limite > 0 and time.time() - T0 > limite

def concluir(j, motor, segs):
    gravar(j['cache'], {'motor': motor, 'text': ' '.join(x['text'] for x in segs), 'segments': segs})
    for p in (j['parcial'],):
        try: os.remove(p)
        except Exception: pass

pendentes = [j for j in jobs if not os.path.exists(j['cache'])]
if not pendentes:
    print('OK'); sys.exit(0)
try:
    from faster_whisper import WhisperModel
    m = WhisperModel(modelo, device='cpu', compute_type='int8')
    for j in pendentes:
        audio = carregar(j['audio'])
        dur = len(audio) / SR
        part = ler(j['parcial'], {'segments': [], 'ate': 0.0})
        t0 = float(part.get('ate', 0.0))
        if t0 > 0: print(f"  clipe {j['n']}: retomando em {t0:.1f}s de {dur:.1f}s", file=sys.stderr, flush=True)
        if dur - t0 > 0.3:
            segs, _ = m.transcribe(audio[int(t0 * SR):], language='pt', word_timestamps=True, initial_prompt=prompt, beam_size=beam)
            for s in segs:
                part['segments'].append({'start': t0 + s.start, 'end': t0 + s.end, 'text': s.text.strip(),
                    'words': [{'word': w.word, 'start': t0 + w.start, 'end': t0 + w.end} for w in (s.words or [])]})
                part['ate'] = t0 + s.end
                gravar(j['parcial'], part)
                if passou():
                    print(f"PARCIAL clipe {j['n']} {part['ate']:.1f} {dur:.1f}", flush=True); sys.exit(10)
        concluir(j, 'faster-whisper', part['segments'])
        print(f"  clipe {j['n']}: transcrito", file=sys.stderr, flush=True)
        if passou() and j is not pendentes[-1]:
            print(f"PARCIAL clipe {j['n']} {dur:.1f} {dur:.1f}", flush=True); sys.exit(10)
except ImportError:
    import whisper
    os.environ['CUDA_VISIBLE_DEVICES'] = ''
    nome = modelo
    if nome not in whisper.available_models() and nome.endswith('-turbo'):
        nome = 'turbo' if 'turbo' in whisper.available_models() else 'medium'
    m = whisper.load_model(nome)
    for j in pendentes:
        r = m.transcribe(j['audio'], language='pt', word_timestamps=True, verbose=False, fp16=False, initial_prompt=prompt)
        concluir(j, 'openai-whisper', [{'start': s['start'], 'end': s['end'], 'text': s['text'].strip(),
            'words': [{'word': w['word'], 'start': w['start'], 'end': w['end']} for w in s.get('words', [])]} for s in r.get('segments', [])])
        if passou() and j is not pendentes[-1]:
            print(f"PARCIAL clipe {j['n']} 1 1", flush=True); sys.exit(10)
print('OK')
`.trim();

// Devolve a lista de transcrições ou null se a transcrição ficou parcial (o progresso está salvo)
function transcreverLote(arquivos) {
  const prompt = GLOSSARIO.length ? `Termos: ${GLOSSARIO.join(', ')}.` : '';
  const dir = path.join(CACHE_DIR, 'transcricao');
  mkdir(dir);
  const jobs = arquivos.map((arq, i) => {
    const chave = sha1({ v: 'transc-1', src: carimbo(arq), modelo: CFG.modelo, beam: CFG.beam, prompt });
    return { n: i + 1, arquivo: arq, audio: path.join(dir, `${chave}.wav`), cache: path.join(dir, `${chave}.json`), parcial: path.join(dir, `${chave}.parcial.json`) };
  });
  const prontos = jobs.filter(j => fs.existsSync(j.cache)).length;
  const pendentes = jobs.filter(j => !fs.existsSync(j.cache));
  if (pendentes.length) {
    if (!CFG.python) {
      // Primeira transcrição neste computador: encontra/instala Python + faster-whisper
      if (SETUP) CFG.python = SETUP.garantir(['python', 'whisper']).python;
      if (!CFG.python) CFG.python = process.platform === 'win32' ? 'py' : 'python3';
    }
    // só o áudio do original (16 kHz mono), uma vez por clipe; fica até o clipe terminar de transcrever
    for (const j of pendentes) if (!fs.existsSync(j.audio)) {
      const tmp = j.audio.replace(/\.wav$/, '.__tmp.wav');
      ff(['-i', j.arquivo, '-map', '0:a:0', '-vn', '-ar', '16000', '-ac', '1', '-c:a', 'pcm_s16le', tmp]);
      fs.renameSync(tmp, j.audio);
    }
    const emAndamento = pendentes.filter(j => fs.existsSync(j.parcial)).length;
    log(`  Transcrevendo ${pendentes.length} clipe(s)${prontos ? ` (${prontos} já prontos)` : ''}${emAndamento ? ` — retomando ${emAndamento} de onde parou` : ''} (${CFG.modelo}, beam ${CFG.beam}${GLOSSARIO.length ? `, glossário com ${GLOSSARIO.length} termos` : ''})...`);
    const jobsJson = path.join(dir, `lote_${process.pid}.json`);
    fs.writeFileSync(jobsJson, JSON.stringify(pendentes), 'utf8');
    const res = spawnSync(CFG.python, ['-c', SCRIPT_TRANSCRICAO, CFG.modelo, prompt, String(CFG.beam), String(CFG.limiteTranscricao), jobsJson],
      { encoding: 'utf8', timeout: 3600000, maxBuffer: 50 * 1024 * 1024 });
    try { fs.unlinkSync(jobsJson); } catch {}
    const out = res.stdout || '';
    (res.stderr || '').split(/\r?\n/).filter(l => /^\s+clipe \d+:/.test(l)).forEach(l => log(l));
    if (res.status === 10) {
      const m = out.match(/PARCIAL clipe (\d+) ([\d.]+) ([\d.]+)/);
      const feitos = jobs.filter(j => fs.existsSync(j.cache)).length;
      console.log(`\n[Salsicha] TRANSCRIÇÃO PARCIAL — ${feitos}/${jobs.length} clipe(s) prontos${m ? `; clipe ${m[1]} em ${m[2]}s de ${m[3]}s` : ''}.`);
      console.log('[Salsicha] O progresso está salvo. Rode EXATAMENTE o mesmo comando de novo: ele continua de onde parou.\n');
      return null;
    }
    if (res.status !== 0) {
      const err = res.stderr || '';
      const rede = /huggingface|hf_hub|LocalEntryNotFound|ProxyError|ConnectError|ConnectionError|getaddrinfo|SSL/i.test(err);
      const dica = rede
        ? `Não consegui baixar o modelo de voz "${CFG.modelo}" (só acontece na 1ª transcrição; precisa de internet). Confira a conexão/firewall e rode de novo.`
        : 'Rode "node tools/setup.js" para reinstalar o motor de transcrição. O que já foi transcrito está salvo: rodar de novo continua de onde parou.';
      throw new Error(`Transcrição falhou (exit ${res.status}).\n${err.slice(-500)}\n${dica}`);
    }
  } else {
    log(`  Transcrição de ${jobs.length} clipe(s) reaproveitada do cache (nada mudou nos arquivos).`);
  }
  // concluído: o WAV de cada clipe não é mais necessário
  for (const j of jobs) { try { fs.unlinkSync(j.audio); } catch {} }
  return jobs.map(j => {
    if (!fs.existsSync(j.cache)) throw new Error(`Transcrição do clipe ${j.n} não encontrada.`);
    return lerJSON(j.cache);
  });
}

function palavrasDe(transcricao) {
  const ws = [];
  for (const s of (transcricao && transcricao.segments) || []) for (const w of s.words || []) {
    const t = String(w.word || '').trim();
    if (t && w.end > w.start) ws.push({ word: t, start: +w.start, end: +w.end });
  }
  return ws.sort((a, b) => a.start - b.start);
}

// Intervalos de fala a partir das palavras: remove pausas maiores que CFG.pausa
function intervalosPorPalavras(transcricao, duracao) {
  const ws = palavrasDe(transcricao);
  if (!ws.length) return [{ start: 0, end: duracao }];
  const PRE = 0.10, POS = 0.16;
  const out = [];
  let ini = ws[0].start, fim = ws[0].end;
  for (let i = 1; i < ws.length; i++) {
    if (ws[i].start - fim > CFG.pausa) { out.push({ start: Math.max(0, ini - PRE), end: Math.min(duracao, fim + POS) }); ini = ws[i].start; }
    fim = Math.max(fim, ws[i].end);
  }
  out.push({ start: Math.max(0, ini - PRE), end: Math.min(duracao, fim + POS) });
  const j = [];
  for (const iv of out) { if (j.length && iv.start <= j[j.length - 1].end + 0.02) j[j.length - 1].end = iv.end; else j.push({ ...iv }); }
  return j.filter(iv => iv.end - iv.start >= 0.3);
}

// Frases para detectar regravações (falas repetidas dentro e entre clipes)
function frasesDe(transcricao, clipe) {
  const ws = palavrasDe(transcricao);
  const frases = [];
  let cur = [];
  const fechar = () => { if (cur.length >= 3) frases.push({ clipe, inicio: +cur[0].start.toFixed(2), fim: +cur[cur.length - 1].end.toFixed(2), texto: cur.map(w => w.word).join(' ') }); cur = []; };
  for (let i = 0; i < ws.length; i++) {
    if (cur.length && ws[i].start - cur[cur.length - 1].end > 0.7) fechar();
    cur.push(ws[i]);
    if (/[.!?]$/.test(ws[i].word)) fechar();
  }
  fechar();
  return frases;
}
function similaridade(a, b) {
  const A = norm(a).split(' '), B = norm(b).split(' ');
  if (A.length < 3 || B.length < 3) return 0;
  const dp = Array(B.length + 1).fill(0);
  for (let i = 1; i <= A.length; i++) {
    let prev = 0;
    for (let k = 1; k <= B.length; k++) { const tmp = dp[k]; dp[k] = A[i - 1] === B[k - 1] ? prev + 1 : Math.max(dp[k], dp[k - 1]); prev = tmp; }
  }
  return dp[B.length] / Math.min(A.length, B.length);
}
function detectarRegravacoes(analises) {
  const frases = analises.flatMap((a, i) => frasesDe(a.transcricao, i + 1));
  const grupos = [];
  for (let i = 0; i < frases.length; i++) for (let k = i + 1; k < frases.length; k++) {
    const s = similaridade(frases[i].texto, frases[k].texto);
    if (s >= 0.6) grupos.push({ similaridade: +s.toFixed(2), descartar: frases[i], manter: frases[k] });
  }
  return grupos; // sugestão: o take MAIS RECENTE costuma ser o bom
}

// Folha de miniaturas (1 quadro/s) para o Fred OLHAR enquadramento, expressão e takes ruins
function gerarFolha(video, dest) {
  const d = duracaoVideo(video);
  const cols = 8, linhas = Math.max(1, Math.ceil(d / cols));
  const hdr = hdrDe(video);
  ff(['-i', video, '-vf', `fps=1,${hdr ? hdr + ',' : ''}scale=216:-1,tile=${cols}x${linhas}:padding=4:color=white`, '-frames:v', '1', '-q:v', '3', dest]);
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. CORTE
// ─────────────────────────────────────────────────────────────────────────────
function lerCortes(arquivo, total) {
  const d = lerJSON(arquivo);
  const cortes = Array.isArray(d) ? d : d.cortes;
  if (!Array.isArray(cortes) || !cortes.length) throw new Error(`Nenhum corte em: ${arquivo}`);
  return cortes.map((c, i) => {
    const clipe = Number(c.clipe) - 1;
    if (!(clipe >= 0 && clipe < total)) throw new Error(`Corte ${i + 1}: clipe ${c.clipe} inexistente (1 a ${total})`);
    if (!(c.fim > c.inicio)) throw new Error(`Corte ${i + 1}: fim deve ser maior que início`);
    const enfases = (c.enfases || []).map(e => ({ start: +e.inicio, end: +e.fim, zoom: +(e.zoom || 1.18) })).filter(e => e.end > e.start);
    return { clipe, start: +c.inicio, end: +c.fim, zoom: c.zoom ? +c.zoom : null, nota: c.nota || '', enfases };
  });
}

// Ênfase = "punch-in": dentro do corte, o trecho [inicio, fim] ganha zoom maior.
// As bordas encaixam no começo/fim da palavra mais próxima e as emendas internas não levam fade de áudio.
function dividirEnfases(trechos, enfases, palavras) {
  if (!enfases || !enfases.length) return trechos;
  const encaixar = (t, lado) => {
    let best = t, dist = 0.35;
    for (const w of palavras) { const v = lado === 'ini' ? w.start - 0.04 : w.end + 0.04; if (Math.abs(v - t) < dist) { dist = Math.abs(v - t); best = v; } }
    return best;
  };
  const ens = enfases.map(e => ({ ...e, start: encaixar(e.start, 'ini'), end: encaixar(e.end, 'fim') }));
  const out = [];
  for (const tr of trechos) {
    const cortesInt = [tr.start, ...ens.flatMap(e => [e.start, e.end]).filter(x => x > tr.start + 0.25 && x < tr.end - 0.25), tr.end].sort((a, b) => a - b);
    for (let i = 0; i < cortesInt.length - 1; i++) {
      const a = cortesInt[i], b = cortesInt[i + 1];
      if (b - a < 0.05) continue;
      const e = ens.find(x => a >= x.start - 0.01 && b <= x.end + 0.01);
      out.push({ ...tr, start: a, end: b, zoomEnfase: e ? e.zoom : null, fadeIn: i === 0, fadeOut: i === cortesInt.length - 2 });
    }
  }
  return out;
}

// Duração do trecho em quadros inteiros: vídeo e áudio terminam juntos (é o que evita a travada na emenda)
const quadrosDe = c => Math.max(1, Math.round((c.end - c.start) * CFG.fps));

// Corta o trecho DIRETO do arquivo original: HDR→SDR, enquadramento 1080x1920, zoom, 30 fps — tudo numa passada.
// Cache: o mesmo trecho (mesmo arquivo, tempos, zoom e emendas) é reaproveitado nas rodadas de ajuste.
function cortarTrecho(src, c, zoom, ordem) {
  const k = quadrosDe(c), dur = k / CFG.fps, amostras = Math.round(dur * 48000);
  const hdr = hdrDe(src);
  const chave = sha1({ v: 'trecho-1', src: carimbo(src), ini: +c.start.toFixed(3), k, zoom: zoom || 1, fi: c.fadeIn !== false, fo: c.fadeOut !== false, RES_W, RES_H, fps: CFG.fps, hdr, VCODEC_INTER });
  const dest = path.join(CFG.cache ? path.join(CACHE_DIR, 'trechos') : TEMP_DIR, CFG.cache ? `${chave}.mkv` : `trecho_${String(ordem).padStart(3, '0')}.mkv`);
  const info = { path: dest, clipe: c.clipe, origStart: c.start, origEnd: c.start + dur, duracao: dur };
  if (CFG.cache && fs.existsSync(dest)) { info.doCache = true; return info; }
  mkdir(path.dirname(dest));
  const vf = [`fps=${CFG.fps}`];
  if (hdr) vf.push(hdr);
  vf.push(`scale=${RES_W}:${RES_H}:force_original_aspect_ratio=increase:flags=lanczos,crop=${RES_W}:${RES_H}`);
  if (zoom && zoom > 1.001) {
    const w = Math.round(RES_W / zoom / 2) * 2, h = Math.round(RES_H / zoom / 2) * 2;
    // reenquadra pelo terço superior (onde costuma estar o rosto)
    vf.push(`crop=${w}:${h}:(iw-${w})/2:(ih-${h})*0.30`, `scale=${RES_W}:${RES_H}:flags=lanczos`);
  }
  // se o clipe acabar antes do último quadro, repete o último (no máximo 2 quadros) em vez de faltar imagem
  vf.push('setpts=PTS-STARTPTS', `tpad=stop_mode=clone:stop_duration=${(2 / CFG.fps).toFixed(4)}`);
  const af = ['asetpts=PTS-STARTPTS', 'aresample=48000', c.fadeIn === false ? null : 'afade=t=in:d=0.02',
    c.fadeOut === false ? null : `afade=t=out:st=${Math.max(0, dur - 0.04).toFixed(3)}:d=0.04`, 'apad', `atrim=end_sample=${amostras}`].filter(Boolean);
  const tmp = dest.replace(/\.mkv$/, `.__${process.pid}.mkv`);
  ff(['-ss', c.start.toFixed(3), '-i', src, '-map', '0:v:0', '-map', '0:a:0', '-vf', vf.join(','), '-af', af.join(','),
    '-frames:v', String(k), ...VCODEC_INTER, ...(hdr ? COR_709 : []), ...ACODEC_INTER, tmp]);
  fs.renameSync(tmp, dest);
  return info;
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. CONCATENAR (corte seco = sem recodificar) e mapear palavras para o vídeo editado
// ─────────────────────────────────────────────────────────────────────────────
function concatenar(segs) {
  const dest = path.join(TEMP_DIR, 'concatenado.mkv');
  const txt = path.join(TEMP_DIR, 'concat.txt');
  fs.writeFileSync(txt, segs.map(s => `file '${s.path.replace(/\\/g, '/').replace(/'/g, "'\\''")}'`).join('\n'));
  if (CFG.transition === 'none' || segs.length === 1) {
    // todos os trechos têm o mesmo formato e duração em quadros inteiros: une sem recodificar (rápido e sem perda)
    ff(['-f', 'concat', '-safe', '0', '-i', txt, '-c', 'copy', dest]);
    return dest;
  }
  const X = 0.2;
  const ins = segs.flatMap(s => ['-i', s.path]);
  let f = '', v = '[0:v]', a = '[0:a]', off = segs[0].duracao - X;
  for (let i = 1; i < segs.length; i++) {
    const vo = i === segs.length - 1 ? '[vf]' : `[v${i}]`, ao = i === segs.length - 1 ? '[af]' : `[a${i}]`;
    f += `${v}[${i}:v]xfade=transition=${CFG.transition}:duration=${X}:offset=${off.toFixed(3)}${vo};${a}[${i}:a]acrossfade=d=${X}${ao};`;
    v = vo; a = ao; off += segs[i].duracao - X;
  }
  ff([...ins, '-filter_complex', f.replace(/;$/, ''), '-map', '[vf]', '-map', '[af]', ...VCODEC_INTER, ...ACODEC_INTER, dest]);
  return dest;
}

function remapearPalavras(analises, segs) {
  const out = [];
  const limites = [];
  let cursor = 0;
  for (const sg of segs) {
    for (const w of palavrasDe(analises[sg.clipe].transcricao)) {
      const m = (w.start + w.end) / 2;
      if (m < sg.origStart || m > sg.origEnd) continue;
      out.push({ word: w.word, start: +(cursor + Math.max(0, w.start - sg.origStart)).toFixed(3), end: +(cursor + Math.min(sg.origEnd, w.end) - sg.origStart).toFixed(3) });
    }
    cursor += sg.duracao;
    limites.push(+cursor.toFixed(3));
  }
  limites.pop();
  return { segmentos: [{ words: out }], limites };
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. DAFNE (render quadro a quadro) — legenda e camadas renderizam EM PARALELO, enquanto os trechos são cortados
// ─────────────────────────────────────────────────────────────────────────────
// Navegadores ao mesmo tempo: o mesmo limite que a Dafne usa sozinha (metade dos núcleos, máx. 4), dividido entre os renders
const ORCAMENTO_NAVEGADORES = Math.max(1, Math.min(4, Math.floor(require('os').cpus().length / 2)));

function iniciarDafne(job, workers) {
  const { spawn } = require('child_process');
  const a = [path.join(__dirname, 'daphne.js'), job.html, job.duracao.toFixed(3), '--out', job.dest,
    '--largura', String(job.largura || RES_W), '--altura', String(job.altura || RES_H), '--fps', String(CFG.fps),
    '--plano', CFG.plano, '--workers', String(workers)];
  if (job.alpha) a.push('--alpha'); else a.push('--intermediario');   // camada ainda vai ser codificada no final
  if (job.params) a.push('--params', JSON.stringify(job.params));
  if (args.ficha) a.push('--ficha', path.resolve(args.ficha));
  if (CFG.cache) a.push('--cache', path.join(CACHE_DIR, 'render')); else a.push('--sem-cache');
  // saída em arquivo (não em pipe): o Salsicha segue cortando trechos enquanto a Dafne trabalha
  const logPath = job.dest + '.log';
  const fd = fs.openSync(logPath, 'w');
  const t0 = Date.now();
  const p = spawn('node', a, { cwd: __dirname, stdio: ['ignore', fd, fd] });
  return new Promise((res, rej) => {
    p.on('error', e => { fs.closeSync(fd); rej(e); });
    p.on('close', code => {
      fs.closeSync(fd);
      const saida = fs.readFileSync(logPath, 'utf8').replace(/\r/g, '\n');
      if (code !== 0 || !fs.existsSync(job.dest)) return rej(new Error(`Dafne falhou (${job.nome}):\n${saida.slice(-800)}`));
      const pronto = saida.split('\n').reverse().find(l => /\[Dafne\] (Pronto|Nada mudou)/.test(l)) || '';
      log(`  ✓ ${job.nome} (${((Date.now() - t0) / 1000).toFixed(0)}s)${/cache/.test(pronto) ? ' — do cache' : ''}${/repetidos/.test(pronto) ? ' — ' + pronto.match(/\d+ quadros repetidos/)[0] : ''}`);
      res(job.dest);
    });
  });
}

// Fila: os mais longos primeiro; cada render recebe a sua parte dos navegadores
function renderizarEmParalelo(jobs) {
  if (!jobs.length) return Promise.resolve([]);
  const fila = jobs.slice().sort((a, b) => b.duracao - a.duracao);
  const simult = Math.min(fila.length, ORCAMENTO_NAVEGADORES);
  const workers = Math.max(1, Math.floor(ORCAMENTO_NAVEGADORES / simult));
  log(`  Renderizando ${jobs.length} item(ns) em paralelo (${simult} por vez, ${workers} navegador(es) cada): ${fila.map(j => j.nome).join(', ')}`);
  let prox = 0;
  const corredor = async () => { while (prox < fila.length) { const j = fila[prox++]; await iniciarDafne(j, workers); } };
  return Promise.all(Array.from({ length: simult }, corredor));
}

function lerCamadas(duracaoTotal) {
  const lista = [];
  if (CFG.camadas) {
    const d = lerJSON(CFG.camadas);
    const base = path.dirname(CFG.camadas);
    for (const c of (Array.isArray(d) ? d : d.camadas || [])) lista.push({ ...c, arquivo: path.resolve(base, c.arquivo) });
  }
  if (CFG.encerramento) {
    const dur = /\.html?$/i.test(CFG.encerramento) ? parseFloat(args['encerramento-duracao'] || '4.5') : duracaoVideo(CFG.encerramento);
    lista.push({ arquivo: CFG.encerramento, inicio: Math.max(0, duracaoTotal - dur), fim: duracaoTotal, layout: 'cheia', legenda: false });
  }
  return lista.map((c, i) => {
    if (!fs.existsSync(c.arquivo)) throw new Error(`Camada ${i + 1}: arquivo não encontrado: ${c.arquivo}`);
    const inicio = Math.max(0, +c.inicio), fim = Math.min(duracaoTotal, +c.fim);
    if (!(fim > inicio)) throw new Error(`Camada ${i + 1}: fim deve ser maior que início`);
    return { arquivo: c.arquivo, inicio, fim, layout: c.layout || 'cheia', legenda: c.legenda !== false, params: c.params || null };
  });
}

// Camadas em HTML viram vídeo (Dafne); .mp4/.mov entram direto
function jobsDeCamadas(camadas) {
  const H2 = Math.round(RES_H / 2);
  const jobs = [];
  camadas.forEach((c, i) => {
    c.video = c.arquivo;
    if (!/\.html?$/i.test(c.arquivo)) return;
    const dur = c.fim - c.inicio, alpha = c.layout === 'sobreposta';
    c.video = path.join(TEMP_DIR, `camada_${i}.${alpha ? 'mov' : 'mp4'}`);
    jobs.push({ nome: `camada ${i + 1} (${path.basename(c.arquivo)}, ${fmt(dur)})`, html: c.arquivo, duracao: dur, dest: c.video, alpha,
      altura: c.layout === 'topo' ? H2 : RES_H, params: c.params ? { duracao: dur, ...c.params } : null });
  });
  return jobs;
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. LEGENDA (HTML → Dafne com alfa; sobreposta direto, sem chroma key)
// ─────────────────────────────────────────────────────────────────────────────
function jobLegenda(segmentos, limites, duracao, camadas) {
  const ocultos = camadas.filter(c => !c.legenda);
  const meio = w => (w.start + w.end) / 2;
  const segs = segmentos.map(s => ({ ...s, words: s.words.filter(w => !ocultos.some(c => meio(w) >= c.inicio && meio(w) < c.fim)) }));
  const lims = limites.concat(camadas.flatMap(c => [c.inicio, c.fim]));
  const html = gerarHTMLLegenda(segs, duracao, { largura: RES_W, altura: RES_H, estilo: ESTILO_LEGENDA, limites: lims, palavrasChave: PALAVRAS_CHAVE });
  const htmlPath = path.join(TEMP_DIR, 'legenda_motion.html');
  fs.writeFileSync(htmlPath, html, 'utf8');
  return { nome: `legenda (${fmt(duracao)})`, html: htmlPath, duracao, dest: path.join(TEMP_DIR, 'legenda.mov'), alpha: true };
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. MONTAGEM FINAL — camadas + legenda + áudio (BGM com ducking, −14 LUFS) numa ÚNICA codificação
// ─────────────────────────────────────────────────────────────────────────────
function grafoFinal(camadas, legenda, duracao, comAudio) {
  const ins = [];
  const f = [];
  let prev = '[0:v]', k = 0;
  const H2 = Math.round(RES_H / 2);
  for (const c of camadas) {
    k++;
    ins.push('-i', c.video);
    const dur = c.fim - c.inicio;
    const en = `between(t,${c.inicio.toFixed(3)},${(c.fim - 0.001).toFixed(3)})`;
    const shift = `setpts=PTS-STARTPTS+${c.inicio.toFixed(3)}/TB`;
    const hdr = /\.html?$/i.test(c.arquivo) ? '' : hdrDe(c.video);   // B-roll gravado em HDR
    const pre = `[${k}:v]${hdr ? hdr + ',' : ''}`;
    if (c.layout === 'cheia') {
      f.push(`${pre}fps=${CFG.fps},trim=duration=${dur.toFixed(3)},scale=${RES_W}:${RES_H}:force_original_aspect_ratio=increase,crop=${RES_W}:${RES_H},format=yuv420p,${shift}[c${k}]`);
      f.push(`${prev}[c${k}]overlay=0:0:enable='${en}':eof_action=pass[b${k}]`);
    } else if (c.layout === 'topo') {
      f.push(`${prev}split=2[p${k}a][p${k}b]`);
      f.push(`[p${k}b]crop=${RES_W}:${H2}:0:(ih-${H2})*0.28[pb${k}]`);
      f.push(`${pre}fps=${CFG.fps},trim=duration=${dur.toFixed(3)},scale=${RES_W}:${H2}:force_original_aspect_ratio=increase,crop=${RES_W}:${H2},${shift}[ct${k}]`);
      f.push(`[p${k}a][ct${k}]overlay=0:0:enable='${en}':eof_action=pass[pt${k}]`);
      f.push(`[pt${k}][pb${k}]overlay=0:${H2}:enable='${en}'[b${k}]`);
    } else {
      f.push(`[${k}:v]fps=${CFG.fps},trim=duration=${dur.toFixed(3)},format=rgba,${shift}[c${k}]`);
      f.push(`${prev}[c${k}]overlay=0:0:enable='${en}':eof_action=pass:format=auto[b${k}]`);
    }
    prev = `[b${k}]`;
  }
  if (legenda) {
    k++;
    ins.push('-i', legenda);
    f.push(`[${k}:v]format=rgba[leg]`, `${prev}[leg]overlay=0:0:format=auto:eof_action=pass[bl]`);
    prev = '[bl]';
  }
  f.push(`${prev}format=yuv420p[vout]`);
  if (comAudio) {
    if (CFG.bgmFile && fs.existsSync(CFG.bgmFile)) {
      k++;
      ins.push('-stream_loop', '-1', '-i', CFG.bgmFile);
      f.push(`[${k}:a]atrim=0:${duracao.toFixed(3)},asetpts=PTS-STARTPTS,volume=${CFG.bgmVolume},afade=t=out:st=${Math.max(0, duracao - 1).toFixed(3)}:d=1,aformat=channel_layouts=stereo[m]`,
        `[0:a]aformat=channel_layouts=stereo,asplit=2[voz][sc]`, `[m][sc]sidechaincompress=threshold=0.03:ratio=6:attack=20:release=350[md]`,
        `[voz][md]amix=inputs=2:duration=first:dropout_transition=0,volume=2,highpass=f=70,loudnorm=I=-14:TP=-1.5:LRA=11[aout]`);
    } else {
      f.push(`[0:a]highpass=f=70,loudnorm=I=-14:TP=-1.5:LRA=11[aout]`);
    }
  }
  return { ins, filtro: f.join(';') };
}

function montarFinal(video, camadas, legenda, duracao, dest) {
  const temBgm = CFG.bgmFile && fs.existsSync(CFG.bgmFile);
  if (temBgm) log(`  BGM com ducking (volume ${CFG.bgmVolume})`);
  const tmp = path.join(TEMP_DIR, 'final.mp4');
  const comum = ['-r', String(CFG.fps), '-t', duracao.toFixed(3)];
  if (!CFG.maxMb) {
    const g = grafoFinal(camadas, legenda, duracao, true);
    ff(['-i', video, ...g.ins, '-filter_complex', g.filtro, '-map', '[vout]', '-map', '[aout]',
      ...VCODEC_FINAL, ...COR_709, ...BSF_COR_709, ...comum, ...ACODEC, '-movflags', '+faststart', tmp], 7200000);
  } else {
    // tamanho máximo pedido pelo usuário: 2 passes com o bitrate que cabe no limite (ainda uma codificação só)
    const kbps = Math.max(800, Math.floor((CFG.maxMb * 8192 * 0.94) / duracao - 160));
    log(`  Limite de ${CFG.maxMb} MB: ${kbps} kbps (2 passes)`);
    const nul = process.platform === 'win32' ? 'NUL' : '/dev/null';
    const passlog = path.join(TEMP_DIR, 'passlog');
    const vb = ['-c:v', 'libx264', '-b:v', `${kbps}k`, '-preset', 'slow', '-pix_fmt', 'yuv420p'];
    const g1 = grafoFinal(camadas, legenda, duracao, false);
    ff(['-i', video, ...g1.ins, '-filter_complex', g1.filtro, '-map', '[vout]', ...vb, '-pass', '1', '-passlogfile', passlog, ...comum, '-an', '-f', 'mp4', nul], 7200000);
    const g2 = grafoFinal(camadas, legenda, duracao, true);
    ff(['-i', video, ...g2.ins, '-filter_complex', g2.filtro, '-map', '[vout]', '-map', '[aout]', ...vb, '-pass', '2', '-passlogfile', passlog,
      ...COR_709, ...BSF_COR_709, ...comum, '-c:a', 'aac', '-b:a', '160k', '-ar', '48000', '-ac', '2', '-movflags', '+faststart', tmp], 7200000);
  }
  mkdir(path.dirname(dest));
  fs.copyFileSync(tmp, dest);
  fs.unlinkSync(tmp);
}

// ─────────────────────────────────────────────────────────────────────────────
// PLANO (dry-run)
// ─────────────────────────────────────────────────────────────────────────────
function exibirPlano(arquivos, analises, regravacoes) {
  const L = '═'.repeat(60);
  console.log(`\n${L}\n  ANÁLISE (--dry-run)\n${L}`);
  let total = 0;
  analises.forEach((a, i) => {
    const fala = a.intervalos.reduce((s, x) => s + x.end - x.start, 0);
    total += fala;
    console.log(`\n  Clipe ${i + 1}: ${path.basename(arquivos[i])}  (${fmt(a.duracao)} → ${fmt(fala)} de fala; pausas > ${CFG.pausa}s saem)`);
    console.log(`  "${String((a.transcricao && a.transcricao.text) || '').trim().slice(0, 170)}"`);
  });
  if (regravacoes.length) {
    console.log('\n  POSSÍVEIS REGRAVAÇÕES (sugestão: manter o take mais recente)');
    regravacoes.forEach(g => console.log(`   - ${Math.round(g.similaridade * 100)}% | descartar clipe ${g.descartar.clipe} ${fmt(g.descartar.inicio)}–${fmt(g.descartar.fim)} "${g.descartar.texto.slice(0, 60)}"\n            manter    clipe ${g.manter.clipe} ${fmt(g.manter.inicio)}–${fmt(g.manter.fim)} "${g.manter.texto.slice(0, 60)}"`));
  }
  console.log(`\n  Fala total: ${fmt(total)}\n${L}\n`);
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────
async function main() {
  const SEP = '═'.repeat(60);
  const T0 = Date.now();
  const tempos = [];
  let tEtapa = Date.now();
  const marcar = nome => { tempos.push([nome, (Date.now() - tEtapa) / 1000]); tEtapa = Date.now(); };
  console.log(`\n${SEP}\n  SALSICHA v3.8\n${SEP}`);
  mkdir(OUT_DIR); mkdir(TEMP_DIR);

  etapa('1', 'Coletando arquivos');
  const arquivos = coletarArquivos(CFG.inputPath);
  arquivos.forEach((f, i) => log(`  ${i + 1}. ${path.basename(f)}${hdrDe(f) ? '  (HDR → convertido para SDR no corte)' : ''}`));

  const analises = [];
  if (CFG.analise) {
    etapa('2', `Reaproveitando análise: ${path.basename(CFG.analise)}`);
    const salvas = lerJSON(CFG.analise);
    const lista = Array.isArray(salvas) ? salvas : salvas.clipes;
    if (lista.length !== arquivos.length) throw new Error(`Análise tem ${lista.length} clipe(s), input tem ${arquivos.length}.`);
    lista.forEach((a, i) => {
      const duracao = duracaoVideo(arquivos[i]);
      analises.push({ arquivo: arquivos[i], duracao, transcricao: a.transcricao, intervalos: intervalosPorPalavras(a.transcricao, duracao) });
    });
  } else {
    etapa('2', 'Transcrevendo (só o áudio dos originais; em partes, com retomada)');
    const duracoes = arquivos.map(v => duracaoVideo(v));
    const transcricoes = transcreverLote(arquivos);
    if (!transcricoes) process.exit(4);   // parcial: o progresso está salvo — rodar o mesmo comando continua
    marcar('transcrição');
    transcricoes.forEach((transcricao, i) => {
      analises.push({ arquivo: arquivos[i], duracao: duracoes[i], transcricao, intervalos: intervalosPorPalavras(transcricao, duracoes[i]) });
      log(`Clipe ${i + 1}/${transcricoes.length}: "${transcricao.text.trim().slice(0, 90)}..."`);
    });
  }
  const regravacoes = detectarRegravacoes(analises);

  if (CFG.jsonOut) {
    fs.writeFileSync(CFG.jsonOut, JSON.stringify({ clipes: analises.map((a, i) => ({ indice: i + 1, ...a, normalizadoPath: null })), regravacoes }, null, 2));
    log(`Análise salva: ${CFG.jsonOut}`);
  }

  if (CFG.dryRun) {
    if (CFG.folhas) {
      const dir = path.join(OUT_DIR, 'folhas'); mkdir(dir);
      arquivos.forEach((v, i) => gerarFolha(v, path.join(dir, `clipe_${String(i + 1).padStart(2, '0')}.jpg`)));
      log(`Folhas de miniaturas em: ${dir}  (OLHAR antes de escolher os takes)`);
    }
    exibirPlano(arquivos, analises, regravacoes);
    log('--dry-run: nenhum vídeo gerado.');
    return;
  }

  // ── Corte
  let trechos;
  if (CFG.cortes) {
    const cortes = lerCortes(CFG.cortes, arquivos.length);
    etapa('4', `Aplicando ${cortes.length} corte(s) editorial(is) + pausas > ${CFG.pausa}s`);
    trechos = cortes.flatMap(c => {
      const ivs = analises[c.clipe].intervalos.map(iv => ({ start: Math.max(iv.start, c.start), end: Math.min(iv.end, c.end) })).filter(iv => iv.end - iv.start >= 0.3);
      const base = (ivs.length ? ivs : [{ start: c.start, end: c.end }]).map(iv => ({ ...c, ...iv }));
      return dividirEnfases(base, c.enfases, palavrasDe(analises[c.clipe].transcricao));
    });
  } else {
    etapa('4', `Cortando pausas > ${CFG.pausa}s em todos os clipes (sem --cortes)`);
    trechos = analises.flatMap((a, i) => a.intervalos.map(iv => ({ clipe: i, ...iv, zoom: null, nota: '' })));
  }
  if (!trechos.length) throw new Error('Nenhum trecho de fala encontrado.');
  // Tempos do vídeo editado: cada trecho tem duração em quadros inteiros — a simulação e o render dão o MESMO resultado
  const sim = trechos.map(c => ({ clipe: c.clipe, origStart: c.start, origEnd: c.start + quadrosDe(c) / CFG.fps, duracao: quadrosDe(c) / CFG.fps }));
  const duracao = +sim.reduce((s, x) => s + x.duracao, 0).toFixed(3);
  const { segmentos, limites } = remapearPalavras(analises, sim);
  fs.writeFileSync(path.join(OUT_DIR, 'transcricao_editada.json'), JSON.stringify({ ...(CFG.simular ? { simulado: true } : {}), duracao, limites, palavras: segmentos[0].words }, null, 2));

  // ── Simulação: calcula os tempos do vídeo editado SEM renderizar (para montar o plano/camadas)
  if (CFG.simular) {
    log(`Simulação: vídeo editado teria ${fmt(duracao)}. Tempos salvos em transcricao_editada.json (nada foi renderizado).`);
    return;
  }

  // ── Portão: só edita/renderiza com plano aprovado pelo usuário
  const ap = PLANO_MOD.verificar(CFG.plano);
  if (!ap.ok) {
    console.error(`\n[Salsicha] EDIÇÃO BLOQUEADA — ${ap.motivo}`);
    console.error('          Fluxo: --dry-run (análise) → tools/frases.js → tools/quadros.js → plano.json → tools/plano.js preparar → usuário aprova → tools/plano.js aprovar → editar.\n');
    process.exit(3);
  }
  log(`Plano aprovado: ${path.relative(process.cwd(), CFG.plano)}`);
  log(`Duração editada: ${fmt(duracao)} | qualidade: ${CFG.qualidade}${CFG.maxMb ? ` | limite ${CFG.maxMb} MB` : ''}`);

  // ── Renders (legenda + camadas) começam JÁ, em paralelo, enquanto os trechos são cortados
  const camadas = lerCamadas(duracao);
  const jobs = jobsDeCamadas(camadas);
  const jobLeg = CFG.legendas ? jobLegenda(segmentos, limites, duracao, camadas) : null;
  if (jobLeg) jobs.push(jobLeg);
  if (jobs.length) etapa('5', 'Legenda e camadas (em paralelo com o corte)');
  const renders = renderizarEmParalelo(jobs);
  renders.catch(() => {});   // o erro é tratado no await abaixo

  etapa(jobs.length ? '6' : '5', `Cortando ${trechos.length} trecho(s) direto dos originais`);
  const segs = [];
  let alterna = 1, ultimo = null, doCache = 0;
  trechos.forEach((c, i) => {
    let zoom = c.zoomEnfase || c.zoom;
    if (!zoom && CFG.zoom === 'auto') {
      const chave = `${c.clipe}|${c.nota}`;
      if (chave !== ultimo) alterna ^= 1;   // muda o enquadramento a cada novo corte editorial
      ultimo = chave;
      zoom = alterna ? 1.08 : 1.0;
    }
    const sg = cortarTrecho(arquivos[c.clipe], c, zoom, i);
    if (sg.doCache) doCache++;
    log(`    ${i + 1}. clipe ${c.clipe + 1} ${fmt(c.start)}→${fmt(c.end)}${zoom && zoom > 1 ? ` zoom ${zoom}` : ''}${c.zoomEnfase ? ' (ênfase)' : ''}${sg.doCache ? ' [cache]' : ''} ${c.nota}`);
    segs.push(sg);
  });
  const video = concatenar(segs);
  marcar(`corte de ${segs.length} trechos${doCache ? ` (${doCache} do cache)` : ''}`);
  log('Tempos do vídeo editado salvos em transcricao_editada.json (use para posicionar camadas).');

  if (jobs.length) { log('  Aguardando legenda/camadas...'); await renders; marcar('legenda e camadas (o que sobrou após o corte)'); }

  etapa(jobs.length ? '7' : '6', `Montagem final: ${camadas.length ? camadas.length + ' camada(s) + ' : ''}${jobLeg ? 'legenda + ' : ''}áudio −14 LUFS — uma codificação`);
  montarFinal(video, camadas, jobLeg ? jobLeg.dest : null, duracao, CFG.outputFile);
  marcar('codificação final');

  const mb = (fs.statSync(CFG.outputFile).size / 1048576).toFixed(1);
  const total = (Date.now() - T0) / 1000;
  console.log(`\n${SEP}\n  CONCLUÍDO em ${fmt(total)}\n${SEP}\n  Arquivo: ${CFG.outputFile}\n  Duração: ${fmt(duracaoVideo(CFG.outputFile))} | ${mb} MB\n  Tempo por etapa: ${tempos.map(([n, t]) => `${n} ${fmt(t)}`).join(' · ')}\n${SEP}\n`);
  try { fs.writeFileSync(path.join(OUT_DIR, 'tempos.json'), JSON.stringify({ total: +total.toFixed(1), etapas: tempos.map(([n, t]) => ({ etapa: n, s: +t.toFixed(1) })) }, null, 2)); } catch {}

  if (CFG.qa) {
    const lims = limites.concat(camadas.flatMap(c => [c.inicio, c.fim])).map(x => x.toFixed(3));
    const mot = camadas.map(c => `${c.inicio.toFixed(2)}-${c.fim.toFixed(2)}`).join(',');
    const qaArgs = [path.join(__dirname, 'tools', 'qa_video.js'), CFG.outputFile, '--limites', lims.join(',') || '0'];
    if (mot) qaArgs.push('--motion', mot);
    if (CFG.maxMb) qaArgs.push('--max-mb', String(CFG.maxMb));
    spawnSync('node', qaArgs, { stdio: 'inherit' });
  }
  // temp/ é descartável; cache/ fica para as rodadas de ajuste (o Fred apaga na aprovação final)
  try { fs.rmSync(TEMP_DIR, { recursive: true, force: true }); } catch {}
}

main().catch(err => { console.error(`\n[Salsicha] ERRO: ${err.message}`); process.exit(1); });
