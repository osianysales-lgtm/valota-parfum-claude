// COR — gravações em HDR (iPhone grava em HDR/HLG por padrão) viram SDR (bt709) com tone mapping.
//
// Sem isso, o vídeo final sai com imagem lavada/acinzentada na maioria das telas, e as cores da marca
// (legenda, camadas) mudam de tom nos aparelhos que leem o vídeo como HDR. Usado pelo Salsicha (cortes),
// pelo painel/quadros (imagens de análise) e pela folha de miniaturas.

'use strict';
const { spawnSync } = require('child_process');

// HLG/PQ → linear → bt709 com curva "hable" (preserva pele e altas luzes sem estourar)
const TONEMAP = 'zscale=t=linear:npl=100,format=gbrpf32le,zscale=p=bt709,tonemap=tonemap=hable:desat=0,zscale=t=bt709:m=bt709:r=tv,format=yuv420p';

const cacheZ = new Map(), cacheH = new Map();

function temZscale(ffmpeg) {
  if (!cacheZ.has(ffmpeg)) {
    const r = spawnSync(ffmpeg, ['-hide_banner', '-filters'], { encoding: 'utf8' });
    cacheZ.set(ffmpeg, / zscale /.test(r.stdout || ''));
  }
  return cacheZ.get(ffmpeg);
}

function ffprobeDe(ffmpeg) { return String(ffmpeg).replace(/ffmpeg(\.exe)?$/i, 'ffprobe$1'); }

/** true se o vídeo é HDR (HLG ou PQ). */
function ehHDR(video, ffprobe) {
  if (!cacheH.has(video)) {
    const r = spawnSync(ffprobe, ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=color_transfer', '-of', 'csv=p=0', video], { encoding: 'utf8' });
    cacheH.set(video, /arib-std-b67|smpte2084/i.test(r.stdout || ''));
  }
  return cacheH.get(video);
}

/** Filtro a pôr no início do -vf ('' se o vídeo não é HDR ou se o FFmpeg não tem zscale). */
function filtroHDR(video, ffmpeg, ffprobe) {
  ffprobe = ffprobe || ffprobeDe(ffmpeg);
  if (!ehHDR(video, ffprobe)) return '';
  if (!temZscale(ffmpeg)) {
    console.warn(`[Cor] ${video} é HDR, mas este FFmpeg não tem o filtro zscale: a imagem pode sair lavada. Atualize o FFmpeg (build "full").`);
    return '';
  }
  return TONEMAP;
}

module.exports = { TONEMAP, ehHDR, filtroHDR, temZscale };
