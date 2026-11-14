// efeito.js: aqui o Claude escreve o efeito, do zero, para este vídeo.
// Leia guias/tecnico.md (ferramentas de base.js) e o estilo pedido em estilos/.
//
// k.t = segundos desde o início do trecho, k.d = duração do trecho
// k.quadro = quadro do vídeo, k.recorte = a pessoa sem fundo, k.rosto = { x, y, w, h, cx, cy, topo, queixo }
// k.img = as imagens de EFEITO.imagens (caminhos relativos a esta pasta), já carregadas

const EFEITO = {
  imagens: {
    // foto: 'imagens/foto.jpg',
    // reels: ['amostras/a01.jpg', 'amostras/a02.jpg'],
  },

  desenhar(g, k) {
    g.drawImage(k.quadro, 0, 0);
    // ... o efeito
  },
};
