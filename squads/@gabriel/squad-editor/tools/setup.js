// SETUP AUTOMÁTICO DA SQUAD — confere e instala o que falta no computador
//
// Roda sozinho na primeira vez que a Dafne ou o Salsicha são usados numa máquina
// (e de novo se algo sumir). Também pode ser rodado à mão:
//
//   node tools/setup.js            confere e instala o que faltar
//   node tools/setup.js --forcar   refaz a conferência mesmo com tudo ok
//
// O que faz:
//   1. Node >= 18 (só confere — é o que está rodando este script)
//   2. Pacotes do npm (puppeteer, gsap...) → npm install na pasta da squad
//   3. FFmpeg → procura no PATH e na pasta do winget; se faltar: winget (Windows) / brew (Mac)
//   4. Python 3 → procura py/python/python3 (ignora o atalho da Microsoft Store);
//      se faltar: winget (Windows) / brew (Mac)
//   5. faster-whisper (transcrição) → pip install
//
// Resultado salvo em .ambiente.json (vale só para ESTE computador; ao compartilhar a squad,
// cada máquina gera o seu na primeira execução).

'use strict';
const path = require('path');
const fs = require('fs');
const os = require('os');
const { spawnSync } = require('child_process');

const RAIZ = path.resolve(__dirname, '..');
const CACHE = path.join(RAIZ, '.ambiente.json');
const WIN = process.platform === 'win32';
const MAC = process.platform === 'darwin';

const log = (...a) => console.log('[Setup]', ...a);
const existe = p => { try { return !!p && fs.existsSync(p); } catch { return false; } };

function rodar(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { encoding: 'utf8', maxBuffer: 50 * 1024 * 1024, windowsHide: true, ...opts });
  return { ok: r.status === 0 && !r.error, out: ((r.stdout || '') + (r.stderr || '')).trim(), status: r.status };
}
// npm, winget e brew no Windows são .cmd/.exe resolvidos pelo shell
const rodarShell = (linha, opts = {}) => rodar(linha, [], { shell: true, stdio: opts.mostrar ? 'inherit' : 'pipe', ...opts });

// aceitarStore: o winget vive em WindowsApps; o python de lá é só o atalho da Store
function onde(nome, aceitarStore = false) {
  const r = rodar(WIN ? 'where' : 'which', [nome]);
  if (!r.ok) return null;
  return r.out.split(/\r?\n/).map(s => s.trim()).find(p => existe(p) && (aceitarStore || !/\\WindowsApps\\/i.test(p))) || null;
}

function procurarEm(dir, alvo, prof = 6) {
  if (!existe(dir) || prof < 0) return null;
  let itens = [];
  try { itens = fs.readdirSync(dir, { withFileTypes: true }); } catch { return null; }
  for (const it of itens) if (it.isFile() && it.name.toLowerCase() === alvo) return path.join(dir, it.name);
  for (const it of itens) if (it.isDirectory()) { const r = procurarEm(path.join(dir, it.name), alvo, prof - 1); if (r) return r; }
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1-2. Node e pacotes npm
// ─────────────────────────────────────────────────────────────────────────────
function pacotesOk() {
  const pkg = JSON.parse(fs.readFileSync(path.join(RAIZ, 'package.json'), 'utf8').replace(/^\uFEFF/, ''));
  return Object.keys(pkg.dependencies || {}).every(d => existe(path.join(RAIZ, 'node_modules', d, 'package.json')));
}

function garantirPacotes() {
  if (pacotesOk()) return true;
  log('Instalando pacotes do npm (puppeteer, gsap...) — só na primeira vez, pode levar alguns minutos...');
  const r = rodarShell('npm install --no-audit --no-fund', { cwd: RAIZ, mostrar: true });
  if (r.ok && pacotesOk()) { log('Pacotes instalados.'); return true; }
  log('Não consegui instalar os pacotes do npm.');
  log('  Se a squad estiver num drive de rede/Google Drive, copie a pasta para o disco local (ex.: Documentos) e rode de lá.');
  return false;
}

// Navegador do puppeteer (a Dafne renderiza com ele). O npm baixa o Chrome sozinho na instalação, mas em rede com
// proxy/antivírus esse download pode falhar em silêncio — então confere e, se faltar, baixa de novo.
function caminhoNavegador() {
  if (process.env.PUPPETEER_EXECUTABLE_PATH) return process.env.PUPPETEER_EXECUTABLE_PATH;
  // executablePath() é síncrona nas versões antigas do puppeteer e assíncrona (Promise) nas novas: Promise.resolve cobre as duas
  const r = rodar(process.execPath, ['-e', "Promise.resolve(require('puppeteer').executablePath()).then(p => process.stdout.write(String(p)))"], { cwd: RAIZ });
  return r.ok ? r.out.split(/\r?\n/).pop().trim() : null;
}
function garantirNavegador() {
  let p = caminhoNavegador();
  if (existe(p)) return p;
  log('Baixando o navegador usado no render (Chrome do puppeteer) — só na primeira vez...');
  rodarShell('npx --yes puppeteer browsers install chrome', { cwd: RAIZ, mostrar: true });
  p = caminhoNavegador();
  if (existe(p)) { log('Navegador instalado.'); return p; }
  log('Não consegui baixar o navegador do render. Confira a internet/proxy e rode de novo: npx puppeteer browsers install chrome');
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. FFmpeg
// ─────────────────────────────────────────────────────────────────────────────
function acharFFmpeg() {
  const exe = WIN ? 'ffmpeg.exe' : 'ffmpeg';
  const cands = [onde('ffmpeg')];
  if (WIN) {
    const la = process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local');
    cands.push(path.join(la, 'Microsoft', 'WinGet', 'Links', exe));
    const pk = path.join(la, 'Microsoft', 'WinGet', 'Packages');
    if (existe(pk)) for (const d of fs.readdirSync(pk).filter(n => /ffmpeg/i.test(n))) cands.push(procurarEm(path.join(pk, d), exe));
    cands.push('C:\\ffmpeg\\bin\\ffmpeg.exe', 'C:\\Program Files\\ffmpeg\\bin\\ffmpeg.exe');
  } else {
    cands.push('/opt/homebrew/bin/ffmpeg', '/usr/local/bin/ffmpeg', '/usr/bin/ffmpeg');
  }
  for (const c of cands) {
    if (!existe(c)) continue;
    const probe = c.replace(/ffmpeg(\.exe)?$/i, (m, e) => 'ffprobe' + (e || ''));
    if (rodar(c, ['-version']).ok && existe(probe)) return { ffmpeg: c, ffprobe: probe };
  }
  // Último recurso (Mac sem Homebrew): binários dos pacotes npm @ffmpeg-installer/ffmpeg + @ffprobe-installer/ffprobe
  try {
    const f = require(path.join(RAIZ, 'node_modules', '@ffmpeg-installer', 'ffmpeg')).path;
    const p = require(path.join(RAIZ, 'node_modules', '@ffprobe-installer', 'ffprobe')).path;
    for (const b of [f, p]) try { fs.chmodSync(b, 0o755); } catch {}
    if (existe(f) && existe(p) && rodar(f, ['-version']).ok) return { ffmpeg: f, ffprobe: p };
  } catch {}
  return null;
}

function garantirFFmpeg() {
  let f = acharFFmpeg();
  if (f) return f;
  log('FFmpeg não encontrado. Instalando...');
  if (WIN && onde('winget', true)) {
    rodarShell('winget install -e --id Gyan.FFmpeg --accept-source-agreements --accept-package-agreements --silent', { mostrar: true });
  } else if (MAC && onde('brew')) {
    rodarShell('brew install ffmpeg', { mostrar: true });
  }
  f = acharFFmpeg();
  if (f) { log('FFmpeg instalado:', f.ffmpeg); return f; }
  log('Não consegui instalar o FFmpeg automaticamente.');
  log(WIN ? '  Instale pelo terminal: winget install ffmpeg   (ou baixe em https://www.gyan.dev/ffmpeg/builds/)'
          : '  Instale: brew install ffmpeg (Mac) ou sudo apt install ffmpeg (Linux)');
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// 4-5. Python + faster-whisper
// ─────────────────────────────────────────────────────────────────────────────
// Devolve o caminho REAL do executável (sys.executable), para nunca cair no atalho da Store
function testarPython(cmd, extra = []) {
  const r = rodar(cmd, [...extra, '-c', 'import sys;print(sys.executable);print(sys.version_info[0]*100+sys.version_info[1])'], { timeout: 20000 });
  if (!r.ok) return null;
  const [exe, ver] = r.out.split(/\r?\n/).map(s => s.trim());
  if (!existe(exe) || +ver < 308 || /\\WindowsApps\\/i.test(exe)) return null;
  return exe;
}

function acharPython() {
  if (process.env.SCRAPPY_PYTHON) { const p = testarPython(process.env.SCRAPPY_PYTHON); if (p) return p; }
  // Python próprio da squad (uv venv --python 3.12 .venv-whisper): usado quando o Python do sistema
  // é novo demais para o faster-whisper (ex.: 3.15 no Mac da Osiany, o PyAV não compila)
  const venv = path.join(__dirname, '..', '.venv-whisper', WIN ? 'Scripts/python.exe' : 'bin/python');
  if (existe(venv)) { const p = testarPython(venv); if (p) return p; }
  const tentativas = WIN ? [['py', ['-3']], ['python', []], ['python3', []]] : [['python3', []], ['python', []]];
  for (const [c, a] of tentativas) { const p = testarPython(c, a); if (p) return p; }
  if (WIN) { // instalado pelo winget/python.org mas ainda fora do PATH deste terminal
    const la = process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local');
    const base = path.join(la, 'Programs', 'Python');
    if (existe(base)) for (const d of fs.readdirSync(base).sort().reverse()) {
      const p = testarPython(path.join(base, d, 'python.exe')); if (p) return p;
    }
  }
  return null;
}

function garantirPython() {
  let py = acharPython();
  if (py) return py;
  log('Python 3 não encontrado. Instalando...');
  if (WIN && onde('winget', true)) {
    rodarShell('winget install -e --id Python.Python.3.12 --scope user --accept-source-agreements --accept-package-agreements --silent', { mostrar: true });
  } else if (MAC && onde('brew')) {
    rodarShell('brew install python', { mostrar: true });
  }
  py = acharPython();
  if (py) { log('Python instalado:', py); return py; }
  log('Não consegui instalar o Python automaticamente.');
  log('  Baixe em https://www.python.org/downloads/ e marque "Add python.exe to PATH" na instalação.');
  return null;
}

const temModulo = (py, mod) => rodar(py, ['-c', `import ${mod}`], { timeout: 60000 }).ok;

function garantirWhisper(py) {
  if (temModulo(py, 'faster_whisper')) return 'faster-whisper';
  log('Instalando o motor de transcrição (faster-whisper) — só na primeira vez...');
  const tent = [
    ['-m', 'pip', 'install', '--upgrade', 'faster-whisper'],
    ['-m', 'pip', 'install', '--user', 'faster-whisper'],
    ['-m', 'pip', 'install', '--user', '--break-system-packages', 'faster-whisper'],
  ];
  for (const a of tent) {
    rodar(py, a, { stdio: 'inherit', timeout: 1800000 });
    if (temModulo(py, 'faster_whisper')) { log('faster-whisper instalado. (O modelo de voz é baixado na primeira transcrição.)'); return 'faster-whisper'; }
  }
  if (temModulo(py, 'whisper')) { log('faster-whisper não instalou; vou usar o openai-whisper que já existe (mais lento).'); return 'openai-whisper'; }
  log('Não consegui instalar o motor de transcrição. Rode no terminal: ' + `"${py}" -m pip install faster-whisper`);
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Cache por computador
// ─────────────────────────────────────────────────────────────────────────────
function lerCache() {
  try {
    const c = JSON.parse(fs.readFileSync(CACHE, 'utf8'));
    if (c.maquina !== os.hostname() || c.plataforma !== process.platform) return {};
    return c;
  } catch { return {}; }
}
function salvarCache(c) {
  try { fs.writeFileSync(CACHE, JSON.stringify({ ...c, maquina: os.hostname(), plataforma: process.platform, atualizado: new Date().toISOString() }, null, 2)); } catch {}
}

/**
 * Garante o ambiente. `precisa`: lista de 'pacotes' | 'ffmpeg' | 'python' | 'whisper'.
 * Rápido quando já está tudo ok (só confere se os caminhos salvos ainda existem).
 * Lança erro com mensagem clara se algo obrigatório não puder ser instalado.
 */
function garantir(precisa = ['pacotes', 'ffmpeg'], { forcar = false } = {}) {
  const maj = +process.versions.node.split('.')[0];
  if (maj < 18) throw new Error(`Node ${process.versions.node} é antigo. Instale o Node 18 ou mais novo: https://nodejs.org`);

  const c = forcar ? {} : lerCache();
  const faltas = [];

  if (precisa.includes('pacotes')) {
    if (!pacotesOk() && !garantirPacotes()) faltas.push('pacotes do npm');
    else if (!existe(c.navegador)) { const n = garantirNavegador(); if (n) c.navegador = n; else faltas.push('navegador do render (Chrome do puppeteer)'); }
  }
  if (precisa.includes('ffmpeg')) {
    if (!(existe(c.ffmpeg) && existe(c.ffprobe))) {
      const f = garantirFFmpeg();
      if (f) Object.assign(c, f); else faltas.push('FFmpeg');
    }
  }
  if (precisa.includes('python') || precisa.includes('whisper')) {
    if (!existe(c.python)) { const p = garantirPython(); if (p) c.python = p; else faltas.push('Python 3'); }
    if (c.python && precisa.includes('whisper') && !(c.whisper && temModuloRapido(c))) {
      // O Python salvo pode ter quebrado (ex.: 14/11/2026, o .venv-whisper antigo ficou em Documentos e o
      // iCloud tirou os arquivos do Mac). Antes de reinstalar, procura de novo: o .venv-whisper da própria squad vem primeiro.
      const novo = acharPython();
      if (novo && novo !== c.python && temModulo(novo, 'faster_whisper')) {
        log(`O Python salvo não transcreve mais; usando ${novo}`);
        c.python = novo; c.whisper = 'faster-whisper'; _modOk = true;
      }
    }
    if (c.python && precisa.includes('whisper') && !(c.whisper && temModuloRapido(c))) {
      const w = garantirWhisper(c.python);
      if (w) c.whisper = w; else faltas.push('faster-whisper');
    }
  }
  salvarCache(c);
  if (faltas.length) throw new Error(`Falta instalar: ${faltas.join(', ')}. Veja as mensagens [Setup] acima.`);
  return c;
}
// Confere o módulo salvo só uma vez por execução
let _modOk = null;
function temModuloRapido(c) {
  if (_modOk === null) _modOk = temModulo(c.python, c.whisper === 'openai-whisper' ? 'whisper' : 'faster_whisper');
  return _modOk;
}

/** Só lê o que já foi encontrado (sem instalar nada). */
function ambiente() { return lerCache(); }

module.exports = { garantir, ambiente };

if (require.main === module) {
  const forcar = process.argv.includes('--forcar');
  console.log('\n══ Setup da Squad Editor ══\n');
  try {
    const c = garantir(['pacotes', 'ffmpeg', 'python', 'whisper'], { forcar });
    log('Node     ', process.versions.node);
    log('Pacotes   ok');
    log('Navegador', c.navegador);
    log('FFmpeg   ', c.ffmpeg);
    log('Python   ', c.python);
    log('Transcrição', c.whisper);
    console.log('\nTudo pronto. A squad já pode ser usada neste computador.\n');
  } catch (e) {
    console.error('\n[Setup] ' + e.message + '\n');
    process.exit(1);
  }
}
