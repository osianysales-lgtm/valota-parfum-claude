// AVATAR — gera o vídeo do avatar da Osiany na HeyGen falando a narração (Caminho 4)
//
// Uso:
//   node tools/avatar.js --audio output/vN/narracao.mp3 --out output/vN/gravacao/avatar.mp4            (só mostra o pedido, não gasta)
//   node tools/avatar.js --audio output/vN/narracao.mp3 --out output/vN/gravacao/avatar.mp4 --confirmar (gera e baixa)
//   node tools/avatar.js --roteiro output/vN/roteiro.txt --out output/vN/gravacao/avatar.mp4 [--confirmar]
//        → voz da HeyGen (heygen_voz_id do .env) em vez da narração do ElevenLabs. Só quando a pessoa pedir a voz da HeyGen.
//   Opcionais: --engine avatar_iv|avatar_v  --motion "gestos leves com as mãos"  --fundo "#111111"  --titulo "nome"
//              --video-id <id>  (só baixa um vídeo já gerado, sem gerar outro)
//              --avatar <look_id>  (um look/visual específico do avatar escolhido; outro avatar é ignorado)
//              --perfil <nome>     (outro avatar do .env: lê heygen_avatar_<nome>, ex. --perfil osianyreal → heygen_avatar_osianyreal)
//
// Regras:
//   • AVATAR = SEMPRE do .env da raiz: heygen_avatar_id (padrão) ou heygen_avatar_<nome> com --perfil. Nunca fixo em comando ou config.
//   • ÁUDIO (padrão) = a narração da voz da Osiany no ElevenLabs (tools/voz.js); a HeyGen só faz o lip-sync.
//     Com --roteiro: a HeyGen narra com a voz do .env (heygen_voz_id). Nunca a voz padrão do avatar (é pública, em inglês).
//   • Precisa da CLI `heygen` logada (heygen auth status). Gasta créditos premium da assinatura: por isso, sem --confirmar,
//     o script só mostra o que vai pedir e sai.
//   • O vídeo baixado vira o "material gravado" do Caminho 4: a pasta de --out é a --input do scrappy_editor.js.

'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { RAIZ_SQUAD, args, carregarEnv } = require('./elevenlabs');

function heygen(argv) {
  let saida;
  try {
    saida = execFileSync('heygen', argv, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 64 * 1024 * 1024 });
  } catch (e) {
    if (e.code === 'ENOENT') throw new Error('CLI heygen não encontrada. Instale e rode: heygen auth login --oauth');
    const txt = (e.stdout || '') + (e.stderr || '');
    throw new Error(`heygen ${argv[0]} ${argv[1] || ''} falhou: ${txt.split('\n').find(l => l.trim()) || e.message}`);
  }
  const linha = saida.split('\n').find(l => l.trim().startsWith('{'));
  return linha ? JSON.parse(linha) : {};
}

function doEnv(nomes) {
  carregarEnv();
  for (const [k, v] of Object.entries(process.env)) if (nomes.includes(k.toUpperCase()) && v && v.trim()) return v.trim();
  return null;
}
const avatarDoEnv = (perfil) => doEnv([perfil ? `HEYGEN_AVATAR_${String(perfil).toUpperCase()}` : 'HEYGEN_AVATAR_ID']);
const vozHeygenDoEnv = () => doEnv(['HEYGEN_VOZ_ID', 'HEYGEN_VOICE_ID']);

function duracaoAudio(arquivo) {
  const pj = arquivo.replace(/\.[^.]+$/, '') + '_palavras.json';
  if (fs.existsSync(pj)) {
    const p = JSON.parse(fs.readFileSync(pj, 'utf8')).palavras || [];
    if (p.length) return p[p.length - 1].end;
  }
  try {
    return parseFloat(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', arquivo], { encoding: 'utf8' }));
  } catch { return null; }
}

async function baixar(videoId, out, timeoutMin) {
  const limite = Date.now() + timeoutMin * 60000;
  let ultimo = '';
  for (;;) {
    const v = heygen(['video', 'get', videoId]).data || {};
    if (v.status !== ultimo) { console.log(`[Avatar] status: ${v.status}`); ultimo = v.status; }
    if (v.status === 'completed' && v.video_url) {
      const r = await fetch(v.video_url);
      if (!r.ok) throw new Error(`download do vídeo falhou (${r.status})`);
      fs.mkdirSync(path.dirname(out), { recursive: true });
      fs.writeFileSync(out, Buffer.from(await r.arrayBuffer()));
      const base = out.replace(/\.[^.]+$/, '');
      if (v.subtitle_url) {
        const rs = await fetch(v.subtitle_url);
        if (rs.ok) { fs.writeFileSync(base + '.srt', await rs.text()); console.log(`[Avatar] Legenda da HeyGen (tempos) → ${base}.srt`); }
      }
      fs.writeFileSync(base + '_heygen.json', JSON.stringify({ video_id: videoId, duracao: v.duration, pagina: v.video_page_url }, null, 2));
      console.log(`[Avatar] Vídeo → ${out} (${v.duration ? v.duration.toFixed(1) + ' s' : 'duração ?'})`);
      console.log(`[Avatar] Próximo (Caminho 4 = edição híbrida): node scrappy_editor.js --input "${path.relative(process.cwd(), path.dirname(out))}" --ficha output/vN/ficha.json --modelo large-v3-turbo --dry-run --json-out output/vN/analise.json --output output/vN/video.mp4`);
      return;
    }
    if (v.status === 'failed') throw new Error(`HeyGen falhou: ${v.failure_code || ''} ${v.failure_message || ''}`.trim());
    if (Date.now() > limite) throw new Error(`tempo esgotado (${timeoutMin} min). Baixe depois com: node tools/avatar.js --video-id ${videoId} --out ${out}`);
    await new Promise(r => setTimeout(r, 10000));
  }
}

(async function main() {
  const opt = args(process.argv.slice(2));
  const cfg = JSON.parse(fs.readFileSync(path.join(RAIZ_SQUAD, 'config', 'heygen.json'), 'utf8'));
  const out = path.resolve(opt.out || 'output/gravacao/avatar.mp4');

  if (opt['video-id']) return baixar(opt['video-id'], out, cfg.timeout_minutos || 30);

  if (!opt.audio && !opt.roteiro) { console.error('Uso: node tools/avatar.js (--audio narracao.mp3 | --roteiro roteiro.txt) --out output/vN/gravacao/avatar.mp4 [--confirmar]'); process.exit(1); }
  let audio = null, texto = null, vozId = null;
  if (opt.roteiro) {
    texto = fs.readFileSync(path.resolve(opt.roteiro), 'utf8').replace(/^\uFEFF/, '').trim();
    vozId = vozHeygenDoEnv();
    if (!vozId) { console.error('[Avatar] heygen_voz_id não está no .env da raiz do projeto (a voz padrão do avatar não serve: é pública, em inglês).'); process.exit(2); }
  } else {
    audio = path.resolve(opt.audio);
    if (!fs.existsSync(audio)) { console.error(`[Avatar] Áudio não encontrado: ${audio}`); process.exit(1); }
    if (fs.statSync(audio).size > 50 * 1024 * 1024) { console.error('[Avatar] Áudio acima de 50 MB (limite da HeyGen). Divida a narração.'); process.exit(1); }
  }

  const chaveAvatar = opt.perfil ? `heygen_avatar_${String(opt.perfil).toLowerCase()}` : 'heygen_avatar_id';
  const avatarEnv = avatarDoEnv(opt.perfil);
  if (!avatarEnv) { console.error(`[Avatar] ${chaveAvatar} não está no .env da raiz do projeto.`); process.exit(2); }
  if (opt.perfil) console.log(`[Avatar] Perfil "${opt.perfil}" (${chaveAvatar}).`);
  let avatarId = avatarEnv;
  // --avatar <look_id>: só vale se o look pertence ao avatar (grupo) do .env — outro visual da mesma pessoa
  if (opt.avatar && opt.avatar !== avatarEnv) {
    let look = {};
    try { look = heygen(['avatar', 'looks', 'get', opt.avatar]).data || {}; } catch {}
    if (look.group_id === avatarEnv) { avatarId = opt.avatar; console.log(`[Avatar] Look ${opt.avatar} (${look.name || look.avatar_type}) do avatar do .env.`); }
    else console.warn(`[Avatar] --avatar ignorado: ${opt.avatar} não é um look do avatar do .env (${avatarEnv}).`);
  }

  const auth = heygen(['auth', 'status']);
  const cred = (auth.data || {}).subscription || {};
  const restantes = ((cred.credits || {}).premium_credits || {}).remaining;
  const dur = audio ? duracaoAudio(audio) : null;

  const pedido = {
    type: 'avatar',
    avatar_id: avatarId,
    title: opt.titulo || path.basename(path.dirname(path.dirname(out))) + ' — avatar',
    aspect_ratio: cfg.aspect_ratio,
    resolution: cfg.resolution,
    fit: cfg.fit,
  };
  const engine = opt.engine || cfg.engine;
  if (engine && engine !== 'avatar_iv') pedido.engine = { type: engine };
  if (engine !== 'avatar_v' && cfg.expressiveness) pedido.expressiveness = cfg.expressiveness;
  const motion = opt.motion || cfg.motion_prompt;
  if (motion) pedido.motion_prompt = motion;
  const fundo = opt.fundo || cfg.fundo;
  if (fundo) pedido.background = { type: 'color', value: fundo };
  if (texto) {
    pedido.script = texto;
    pedido.voice_id = vozId;
    pedido.voice_settings = { speed: cfg.voz_heygen?.velocidade ?? 1, locale: cfg.voz_heygen?.locale || 'pt-BR' };
  }

  const fonte = texto ? `voz HeyGen ${vozId} (.env) · ${texto.length} caracteres` : `áudio ${path.basename(audio)}${dur ? ` (${dur.toFixed(1)} s)` : ''}`;
  console.log(`[Avatar] Avatar ${avatarId} (.env) · ${engine} · ${cfg.aspect_ratio} ${cfg.resolution} · ${fonte}`);
  console.log(`[Avatar] Conta: plano ${cred.plan || '?'} · créditos premium restantes: ${restantes ?? '?'}`);

  if (!opt.confirmar) {
    const mostrar = texto ? { ...pedido, script: texto.slice(0, 80) + '…' } : { ...pedido, audio_asset_id: '<upload de ' + path.basename(audio) + '>' };
    console.log('[Avatar] Pedido (ainda NÃO enviado):\n' + JSON.stringify(mostrar, null, 2));
    console.log('[Avatar] Isso gasta créditos da HeyGen. Com o ok do usuário, rode de novo com --confirmar.');
    return;
  }

  if (audio) {
    console.log('[Avatar] Enviando a narração para a HeyGen...');
    const asset = heygen(['asset', 'create', '--file', audio]).data || {};
    const assetId = asset.asset_id || asset.id;
    if (!assetId) throw new Error('upload do áudio não devolveu asset_id');
    pedido.audio_asset_id = assetId;
  }

  const criado = heygen(['video', 'create', '-d', JSON.stringify(pedido)]).data || {};
  const videoId = criado.video_id || criado.id;
  if (!videoId) throw new Error('a HeyGen não devolveu o id do vídeo: ' + JSON.stringify(criado).slice(0, 300));
  console.log(`[Avatar] Vídeo pedido: ${videoId} (gerando; costuma levar alguns minutos)`);
  await baixar(videoId, out, cfg.timeout_minutos || 30);
})().catch(e => { console.error('[Avatar] ' + e.message); process.exit(1); });
