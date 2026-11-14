// GET_ASSETS — Template para baixar vídeos e fotos do Pexels
// Uso: node get_assets.js
// Copie este arquivo como get_assets_<projeto>.js e adapte o main() com as queries do seu projeto.
require('dotenv').config();
const https = require('https');
const fs    = require('fs');
const path  = require('path');

const KEY     = process.env.PEXELS_API_KEY;
const ASSETS  = path.join(__dirname, 'assets');
if (!fs.existsSync(ASSETS)) fs.mkdirSync(ASSETS);

function pexelsGet(url) {
  return new Promise((resolve, reject) => {
    const opts = { headers: { Authorization: KEY } };
    https.get(url, opts, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(JSON.parse(data)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(dest)) { console.log(`  ✓ já existe: ${path.basename(dest)}`); return resolve(); }
    const file = fs.createWriteStream(dest);
    function get(u) {
      https.get(u, res => {
        if (res.statusCode === 301 || res.statusCode === 302) return get(res.headers.location);
        res.pipe(file);
        file.on('finish', () => { file.close(); console.log(`  ↓ ${path.basename(dest)}`); resolve(); });
        res.on('error', reject);
      }).on('error', reject);
    }
    get(url);
  });
}

function bestVideo(files, minW) {
  const sorted = files.filter(f => f.width >= minW).sort((a,b) => b.width - a.width);
  return sorted[0] || files.sort((a,b) => b.width - a.width)[0];
}

async function fetchVideo(query, filename, orient = 'landscape') {
  console.log(`\n[VIDEO] "${query}"`);
  const url = `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&orientation=${orient}&per_page=5&size=medium`;
  const data = await pexelsGet(url);
  if (!data.videos || !data.videos.length) { console.log('  ✗ nenhum resultado'); return null; }
  const vid  = data.videos[0];
  const file = bestVideo(vid.video_files, 1280);
  if (!file) { console.log('  ✗ sem arquivo HD'); return null; }
  const ext  = file.file_type.split('/')[1] || 'mp4';
  const dest = path.join(ASSETS, `${filename}.${ext}`);
  await downloadFile(file.link, dest);
  return dest;
}

async function fetchPhoto(query, filename, orient = 'portrait') {
  console.log(`\n[PHOTO] "${query}"`);
  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&orientation=${orient}&per_page=5&size=large`;
  const data = await pexelsGet(url);
  if (!data.photos || !data.photos.length) { console.log('  ✗ nenhum resultado'); return null; }
  const photo = data.photos[0];
  const src   = orient === 'portrait' ? photo.src.portrait : photo.src.large2x;
  const dest  = path.join(ASSETS, `${filename}.jpg`);
  await downloadFile(src, dest);
  return dest;
}

async function main() {
  console.log('=== GET ASSETS — <nome do projeto> ===\n');

  // Exemplo: adapte as queries abaixo para o tema do seu projeto
  // Orientações: 'portrait' para vídeos verticais (Reels 9:16), 'landscape' para horizontais

  // Cena 1 — background principal
  // await fetchVideo('sua query em inglês para cena 1', 'bg_s1_descricao', 'portrait');

  // Cena 2 — background secundário
  // await fetchVideo('sua query em inglês para cena 2', 'bg_s2_descricao', 'portrait');

  // Foto para overlay
  // await fetchPhoto('sua query de foto', 'img_descricao', 'portrait');

  console.log('\n✅ Assets prontos em /assets/');
}

main().catch(console.error);
