/* ============================================================
   VALOTA PARFUM — SEUS PERFUMES
   ------------------------------------------------------------
   É SÓ EDITAR ESTE ARQUIVO para adicionar/remover perfumes.

   Cada perfume tem:
     nome       → nome do perfume
     marca      → marca/casa
     categoria  → "arabe", "nicho" ou "grife"
     destaque   → true em UM perfume = vira o "Perfume do mês" no topo
     nota       → sua opinião curta (1–2 frases)
     tags       → ocasiões/estações (ex.: "Noite", "Inverno", "Trabalho")
     cor        → cor do líquido no frasco desenhado (hex)
     frasco     → formato do frasco desenhado: 1, 2 ou 3
     imagem     → (opcional) caminho de uma foto, ex.: "img/khamrah.png"
                  se ficar vazio, aparece o frasco desenhado
     video      → (opcional) link do seu TikTok sobre esse perfume
     links      → lista de lojas. "loja" pode ser:
                  "amazon", "mercadolivre", "shopee", "tiktokshop",
                  "magalu", "aliexpress", "shein" ou "outro"
                  (se for "outro", coloque também  nome: "Nome da loja")

   ⚠️ Troque os "url" abaixo pelos SEUS links de afiliado.
   ============================================================ */

const PERFIL = {
  nome: "Valota",
  sobrenome: "Parfum",
  frase: "Perfumes que eu testei na pele e recomendo. Clicou, comprou, cheirou bem.",
  tiktok: "https://www.tiktok.com/@valotaparfum",
  instagram: "", // opcional: "https://instagram.com/seuperfil"
};

const PERFUMES = [
  {
    nome: "Khamrah",
    marca: "Lattafa",
    categoria: "arabe",
    destaque: true,
    nota: "Canela, tâmara e baunilha. Cheiro de rico gastando pouco — fixação de mais de 10h na minha pele.",
    tags: ["Noite", "Inverno", "Custo-benefício"],
    cor: "#B4561F",
    frasco: 3,
    imagem: "img/khamrah.jpg",
    video: "",
    links: [
      { loja: "amazon", url: "#" },
      { loja: "mercadolivre", url: "#" },
      { loja: "shopee", url: "#" },
    ],
  },
  {
    nome: "Club de Nuit Intense Man",
    marca: "Armaf",
    categoria: "arabe",
    nota: "O clássico defumado de abacaxi e bétula. Projeção forte nas primeiras horas.",
    tags: ["Balada", "Elogios"],
    cor: "#2B2B2B",
    frasco: 2,
    imagem: "img/cdnim.jpg",
    links: [
      { loja: "amazon", url: "#" },
      { loja: "tiktokshop", url: "#" },
    ],
  },
  {
    nome: "Amber Oud Gold Edition",
    marca: "Al Haramain",
    categoria: "arabe",
    nota: "Doce, frutado e muito chamativo. Pra quem quer ser lembrado quando sai da sala.",
    tags: ["Noite", "Elogios"],
    cor: "#D9A13B",
    frasco: 1,
    imagem: "img/amber-oud-gold.jpg",
    links: [{ loja: "mercadolivre", url: "#" }],
  },
  {
    nome: "Layton",
    marca: "Parfums de Marly",
    categoria: "nicho",
    nota: "Maçã, lavanda e baunilha. Versátil, elegante e quase impossível de errar.",
    tags: ["Trabalho", "Encontro", "Outono"],
    cor: "#5B6B8C",
    frasco: 1,
    imagem: "img/layton.jpg",
    links: [{ loja: "amazon", url: "#" }],
  },
  {
    nome: "Oud for Greatness",
    marca: "Initio",
    categoria: "nicho",
    nota: "Oud limpo e marcante, com açafrão. Presença de sobra com poucas borrifadas.",
    tags: ["Noite", "Inverno"],
    cor: "#6E3B2A",
    frasco: 2,
    imagem: "img/oud-for-greatness.png",
    links: [{ loja: "outro", nome: "Loja parceira", url: "#" }],
  },
  {
    nome: "Sauvage Eau de Parfum",
    marca: "Dior",
    categoria: "grife",
    nota: "Fresco e apimentado. O perfume que todo mundo reconhece — e elogia.",
    tags: ["Dia a dia", "Trabalho"],
    cor: "#3F6E9A",
    frasco: 2,
    imagem: "img/sauvage-edp.jpg",
    links: [
      { loja: "amazon", url: "#" },
      { loja: "magalu", url: "#" },
    ],
  },
  {
    nome: "Bleu de Chanel EDP",
    marca: "Chanel",
    categoria: "grife",
    nota: "Cítrico amadeirado, sério e limpo. A escolha segura pra entrevista e reunião.",
    tags: ["Trabalho", "Dia a dia"],
    cor: "#25344F",
    frasco: 1,
    imagem: "img/bleu-de-chanel-edp.jpg",
    links: [{ loja: "amazon", url: "#" }],
  },
  {
    nome: "Y Eau de Parfum",
    marca: "Yves Saint Laurent",
    categoria: "grife",
    nota: "Maçã, sálvia e ambroxan. Jovem, moderno e funciona em qualquer lugar.",
    tags: ["Dia a dia", "Balada"],
    cor: "#4A5A6A",
    frasco: 3,
    imagem: "img/y-edp.png",
    links: [
      { loja: "mercadolivre", url: "#" },
      { loja: "shopee", url: "#" },
    ],
  },
];
