// VOZ — gera a narração do roteiro com a voz da Osiany no ElevenLabs (padrão de toda narração da squad)
//
// Uso:
//   node tools/voz.js --roteiro output/vN/roteiro.txt --out output/vN/narracao.mp3 [--velocidade 1.05]
//
// Gera:
//   output/vN/narracao.mp3              → a voz (MP3 44,1 kHz)
//   output/vN/narracao_palavras.json    → tempo exato de cada palavra, vindo do próprio ElevenLabs (sem Whisper)
// Depois:
//   node tools/narracao.js --audio output/vN/narracao.mp3 --roteiro output/vN/roteiro.txt \
//        --transcricao output/vN/narracao_palavras.json --out output/vN/narracao.json
//
// A VOZ vem SEMPRE do .env da raiz (Elevenlabs_voz_id) — não passe --voz. Ajustes (velocidade 0,95 etc.) vêm de config/elevenlabs.json.
// A chave vem de ELEVENLABS_API_KEY (.env.local) e nunca é impressa.
// Custo: 1 crédito por caractere do roteiro (plano Starter = 40.000/mês). O script mostra o custo antes de gerar.

'use strict';
const fs = require('fs');
const path = require('path');
const { config, chamar, args } = require('./elevenlabs');

(async function main() {
  const opt = args(process.argv.slice(2));
  if (!opt.roteiro && !opt.texto) { console.error('Uso: node tools/voz.js --roteiro roteiro.txt --out narracao.mp3'); process.exit(1); }
  const cfg = config().voz;
  const texto = (opt.texto || fs.readFileSync(opt.roteiro, 'utf8')).replace(/^﻿/, '').trim();
  if (texto.length > 9500) { console.error(`[Voz] Roteiro com ${texto.length} caracteres: o limite por geração é ~10.000. Divida o roteiro.`); process.exit(1); }
  const out = path.resolve(opt.out || 'narracao.mp3');
  const voiceId = cfg.voice_id;   // = Elevenlabs_voz_id do .env (tools/elevenlabs.js)
  if (opt.voz && opt.voz !== voiceId) console.warn(`[Voz] --voz ignorado: a narração usa sempre a voz do .env (${voiceId}).`);
  const ajustes = { ...cfg.ajustes };
  if (opt.velocidade) ajustes.speed = parseFloat(opt.velocidade);

  console.log(`[Voz] ${cfg.nome} (${voiceId}, origem: ${cfg.origem}) · ${cfg.modelo} · ${texto.length} caracteres ≈ ${texto.length} créditos`);
  const r = await chamar(`/v1/text-to-speech/${voiceId}/with-timestamps?output_format=${cfg.formato}`, {
    text: texto, model_id: cfg.modelo, language_code: 'pt', voice_settings: ajustes,
  });

  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, Buffer.from(r.audio_base64, 'base64'));

  // caracteres → palavras (formato que tools/narracao.js aceita em --transcricao)
  const al = r.alignment || r.normalized_alignment;
  const palavras = [];
  let atual = null;
  al.characters.forEach((c, i) => {
    if (/\s/.test(c)) { if (atual) { palavras.push(atual); atual = null; } return; }
    if (!atual) atual = { word: '', start: al.character_start_times_seconds[i], end: 0 };
    atual.word += c; atual.end = al.character_end_times_seconds[i];
  });
  if (atual) palavras.push(atual);
  const pj = out.replace(/\.[^.]+$/, '') + '_palavras.json';
  fs.writeFileSync(pj, JSON.stringify({ fonte: 'elevenlabs', voz: cfg.nome, voice_id: voiceId, palavras }, null, 2), 'utf8');

  const dur = palavras.length ? palavras[palavras.length - 1].end : 0;
  console.log(`[Voz] Narração → ${out} (${dur.toFixed(2)} s, ${palavras.length} palavras)`);
  console.log(`[Voz] Tempos por palavra → ${pj}`);
  console.log(`[Voz] Próximo: node tools/narracao.js --audio "${path.relative(process.cwd(), out)}" --roteiro <roteiro.txt> --transcricao "${path.relative(process.cwd(), pj)}" --out ${path.relative(process.cwd(), path.join(path.dirname(out), 'narracao.json'))}`);
})().catch(e => { console.error('[Voz] ' + e.message); process.exit(1); });
