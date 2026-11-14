// ELEVENLABS — base comum de tools/voz.js e tools/sfx.js
// Lê a chave de ELEVENLABS_API_KEY (procura .env.local / .env subindo a partir da squad) e a config em config/elevenlabs.json.
// VOZ: a voz padrão de TODA narração é a do .env da raiz do projeto, variável Elevenlabs_voz_id
// (aceita também ELEVENLABS_VOZ_ID / ELEVENLABS_VOICE_ID, sem diferença de maiúsculas). Ela substitui o voice_id
// de config/elevenlabs.json, que fica só como reserva caso a variável não exista. Para trocar a voz, troque no .env.
'use strict';
const fs = require('fs');
const path = require('path');

const RAIZ_SQUAD = path.resolve(__dirname, '..');

let envCarregado = false;
function carregarEnv() {
  if (envCarregado) return; envCarregado = true;
  let dir = RAIZ_SQUAD;
  for (let i = 0; i < 6; i++) {
    for (const nome of ['.env.local', '.env']) {
      const p = path.join(dir, nome);
      if (!fs.existsSync(p)) continue;
      for (const linha of fs.readFileSync(p, 'utf8').split(/\r?\n/)) {
        const m = linha.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*?)\s*$/);
        if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
      }
    }
    const pai = path.dirname(dir); if (pai === dir) break; dir = pai;
  }
}

// voz padrão do .env (Elevenlabs_voz_id), sem diferença de maiúsculas
function vozDoEnv() {
  carregarEnv();
  const nomes = ['ELEVENLABS_VOZ_ID', 'ELEVENLABS_VOICE_ID'];
  for (const [k, v] of Object.entries(process.env)) if (nomes.includes(k.toUpperCase()) && v && v.trim()) return v.trim();
  return null;
}

function config() {
  const p = path.join(RAIZ_SQUAD, 'config', 'elevenlabs.json');
  const c = JSON.parse(fs.readFileSync(p, 'utf8'));
  const env = vozDoEnv();
  if (env) { if (env !== c.voz.voice_id) c.voz.nome = 'voz do .env'; c.voz.voice_id = env; c.voz.origem = '.env (Elevenlabs_voz_id)'; }
  else { c.voz.origem = 'config/elevenlabs.json (Elevenlabs_voz_id não encontrada no .env)'; console.warn('[ElevenLabs] AVISO: Elevenlabs_voz_id não está no .env; usando a voz reserva do config.'); }
  return c;
}

function chave() {
  carregarEnv();
  const k = process.env.ELEVENLABS_API_KEY;
  if (!k) { console.error('[ElevenLabs] ELEVENLABS_API_KEY não encontrada (.env.local na raiz do projeto).'); process.exit(2); }
  return k;
}

async function chamar(rota, corpo, { binario = false } = {}) {
  const r = await fetch('https://api.elevenlabs.io' + rota, {
    method: 'POST',
    headers: { 'xi-api-key': chave(), 'Content-Type': 'application/json', Accept: binario ? 'audio/mpeg' : 'application/json' },
    body: JSON.stringify(corpo),
  });
  if (!r.ok) {
    const txt = await r.text();
    throw new Error(`ElevenLabs ${r.status} em ${rota.split('?')[0]}: ${txt.slice(0, 500)}`);
  }
  return binario ? Buffer.from(await r.arrayBuffer()) : r.json();
}

function args(argv) {
  const opt = {};
  for (let i = 0; i < argv.length; i++) if (argv[i].startsWith('--')) {
    const k = argv[i].slice(2);
    opt[k] = (i + 1 < argv.length && !argv[i + 1].startsWith('--')) ? argv[++i] : true;
  }
  return opt;
}

module.exports = { RAIZ_SQUAD, config, chamar, args, vozDoEnv, carregarEnv };
