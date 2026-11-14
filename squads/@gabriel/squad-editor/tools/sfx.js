// SFX — biblioteca de efeitos sonoros da squad (biblioteca_audio/efeitos), gerada pelo ElevenLabs Sound Effects
//
// Uso:
//   node tools/sfx.js --kit                        → gera o kit básico (só o que ainda não existe; não gasta crédito à toa)
//   node tools/sfx.js --nome whoosh_seda --texto "soft silk whoosh transition" --duracao 1.2
//   node tools/sfx.js --listar
//
// Os nomes seguem o que tools/audio_inventario.js reconhece (whoosh, pop, click, impact, riser, shine, typing, bgm...).
// Custo aproximado: 40 créditos por segundo de efeito. O kit básico inteiro sai por ~1.000 créditos, uma vez só.
// Uso comercial: efeitos gerados num plano pago do ElevenLabs podem ser usados comercialmente.

'use strict';
const fs = require('fs');
const path = require('path');
const { RAIZ_SQUAD, config, chamar, args } = require('./elevenlabs');

const KIT = [
  ['whoosh_rapido', 'fast clean whoosh swoosh transition, modern social media video', 0.8],
  ['whoosh_suave', 'soft airy silk whoosh transition, elegant luxury', 1.2],
  ['pop_leve', 'light soft UI pop sound, bubbly, short', 0.5],
  ['click_ui', 'crisp clean interface click, minimal', 0.5],
  ['impact_grave', 'deep cinematic bass impact hit, punchy, short tail', 1.5],
  ['riser_curto', 'short tension riser building up, cinematic, ends abruptly', 2.0],
  ['shine_brilho', 'magical sparkle shimmer shine, glittering luxury perfume reveal', 1.5],
  ['spray_perfume', 'perfume bottle spray atomizer spritz, two quick sprays, close mic', 1.2],
  ['vidro_tilintar', 'small glass perfume bottle clink, elegant, clean', 0.8],
  ['typing_teclado', 'fast keyboard typing, light mechanical keys', 1.5],
  ['swipe_tela', 'phone screen swipe sound, smooth digital', 0.6],
  ['ding_notificacao', 'pleasant bright notification ding, positive', 0.8],
];

async function gerar(cfg, dir, nome, texto, duracao) {
  const arq = path.join(dir, nome + '.mp3');
  if (fs.existsSync(arq)) { console.log(`  = ${nome}.mp3 (já existe)`); return arq; }
  const corpo = { text: texto, model_id: cfg.modelo, prompt_influence: cfg.prompt_influence };
  if (duracao) corpo.duration_seconds = Math.min(30, Math.max(0.5, +duracao));
  const buf = await chamar('/v1/sound-generation?output_format=mp3_44100_128', corpo, { binario: true });
  fs.writeFileSync(arq, buf);
  fs.writeFileSync(path.join(dir, nome + '.txt'), `prompt: ${texto}\nduracao: ${duracao || 'auto'}\nfonte: ElevenLabs Sound Effects (${cfg.modelo})\n`);
  console.log(`  + ${nome}.mp3`);
  return arq;
}

(async function main() {
  const opt = args(process.argv.slice(2));
  const cfg = config().efeitos;
  const dir = path.resolve(RAIZ_SQUAD, opt.pasta ? path.join('biblioteca_audio', String(opt.pasta)) : cfg.pasta);   // --pasta trilhas → biblioteca_audio/trilhas
  fs.mkdirSync(dir, { recursive: true });

  if (opt.listar) {
    for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.mp3')).sort()) console.log('  ' + f);
    return;
  }
  if (opt.kit) {
    const falta = KIT.filter(([n]) => !fs.existsSync(path.join(dir, n + '.mp3')));
    const seg = falta.reduce((s, k) => s + k[2], 0);
    console.log(`[SFX] Kit básico em ${dir} — faltam ${falta.length} efeitos (~${Math.round(seg * 40)} créditos)`);
    for (const [n, t, d] of KIT) await gerar(cfg, dir, n, t, d);
    return;
  }
  if (!opt.nome || !opt.texto) { console.error('Uso: node tools/sfx.js --kit | --nome <nome> --texto "<descrição em inglês>" [--duracao s] | --listar'); process.exit(1); }
  await gerar(cfg, dir, String(opt.nome).replace(/[^\w-]+/g, '_'), opt.texto, opt.duracao);
})().catch(e => { console.error('[SFX] ' + e.message); process.exit(1); });
