const sharp=require('../../node_modules/sharp');const [,,src,dst]=process.argv;const S=560,R=70;
const mask=Buffer.from(`<svg width="${S}" height="${S}"><rect width="${S}" height="${S}" rx="${R}" ry="${R}" fill="#fff"/></svg>`);
const borda=Buffer.from(`<svg width="${S}" height="${S}"><rect x="3" y="3" width="${S-6}" height="${S-6}" rx="${R-3}" ry="${R-3}" fill="none" stroke="#e8c58e" stroke-width="6"/></svg>`);
sharp(src).resize(S,S,{fit:'cover'}).composite([{input:mask,blend:'dest-in'},{input:borda}]).png().toFile(dst).then(()=>console.log(dst));
