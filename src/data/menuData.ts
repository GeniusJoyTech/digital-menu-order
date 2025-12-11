export interface MenuItem {
  id: string;
  name: string;
  description: string;
  prices: {
    size: string;
    price: number;
  }[];
  category: string;
  image: string;
}

export interface CartItem extends MenuItem {
  selectedSize: string;
  selectedPrice: number;
  quantity: number;
}

export const menuCategories = [
  { id: "tradicionais", name: "Tradicionais", color: "pastel-peach" },
  { id: "especiais", name: "Especiais", color: "pastel-blue" },
  { id: "alcoolicos", name: "Alcoólicos", color: "pastel-lavender" },
  { id: "acai", name: "Açaí", color: "pastel-mint" },
  { id: "outros", name: "Outros", color: "pastel-yellow" },
];

export const menuItems: MenuItem[] = [
  // Tradicionais - 500ml R$25 / 300ml R$20
  {
    id: "ovomaltine",
    name: "Ovomaltine",
    description: "Brigadeiro caseiro, sorvete de baunilha e ovomaltine",
    prices: [
      { size: "500ml", price: 25 },
      { size: "300ml", price: 20 },
    ],
    category: "tradicionais",
    image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=200&h=200&fit=crop",
  },
  {
    id: "maltine-top",
    name: "Maltine top",
    description: "Brigadeiro caseiro de ninho, sorvete de baunilha, ovomaltine e leite em pó",
    prices: [
      { size: "500ml", price: 25 },
      { size: "300ml", price: 20 },
    ],
    category: "tradicionais",
    image: "https://images.unsplash.com/photo-1579954115545-a95591f28bfc?w=200&h=200&fit=crop",
  },
  {
    id: "ouro-branco",
    name: "Ouro branco",
    description: "Brigadeiro caseiro de ninho, sorvete de baunilha e ouro branco",
    prices: [
      { size: "500ml", price: 25 },
      { size: "300ml", price: 20 },
    ],
    category: "tradicionais",
    image: "https://images.unsplash.com/photo-1568901839119-631418a3910d?w=200&h=200&fit=crop",
  },
  {
    id: "cookies-and-cream",
    name: "Cookies and cream",
    description: "Brigadeiro caseiro de baunilha, oreo e leite em pó",
    prices: [
      { size: "500ml", price: 25 },
      { size: "300ml", price: 20 },
    ],
    category: "tradicionais",
    image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=200&h=200&fit=crop",
  },
  {
    id: "mousse-maracuja",
    name: "Mousse de Maracujá",
    description: "Geleia de maracujá, brigadeiro de ninho, leite em pó, sorvete de baunilha",
    prices: [
      { size: "500ml", price: 25 },
      { size: "300ml", price: 20 },
    ],
    category: "tradicionais",
    image: "https://images.unsplash.com/photo-1587314168485-3236d6710814?w=200&h=200&fit=crop",
  },
  {
    id: "ninho-morango",
    name: "Ninho com morango",
    description: "Brigadeiro caseiro de ninho, sorvete de baunilha, calda de morango em pedaços e leite em pó",
    prices: [
      { size: "500ml", price: 25 },
      { size: "300ml", price: 20 },
    ],
    category: "tradicionais",
    image: "https://images.unsplash.com/photo-1553787499-6f9133860278?w=200&h=200&fit=crop",
  },
  {
    id: "ninho",
    name: "Ninho",
    description: "Brigadeiro caseiro de ninho, sorvete de baunilha e leite em pó",
    prices: [
      { size: "500ml", price: 25 },
      { size: "300ml", price: 20 },
    ],
    category: "tradicionais",
    image: "https://images.unsplash.com/photo-1541658016709-82535e94bc69?w=200&h=200&fit=crop",
  },
  {
    id: "ninho-nutella",
    name: "Ninho com Nutella",
    description: "Brigadeiro caseiro de ninho, sorvete de baunilha, nutella e leite em pó",
    prices: [
      { size: "500ml", price: 25 },
      { size: "300ml", price: 20 },
    ],
    category: "tradicionais",
    image: "https://images.unsplash.com/photo-1619158401201-8fa932695178?w=200&h=200&fit=crop",
  },
  {
    id: "morango-nutella",
    name: "Morango com Nutella",
    description: "Calda de morango em pedaços, nutella, sorvete de baunilha",
    prices: [
      { size: "500ml", price: 25 },
      { size: "300ml", price: 20 },
    ],
    category: "tradicionais",
    image: "https://images.unsplash.com/photo-1586917049673-86436e07de8c?w=200&h=200&fit=crop",
  },
  {
    id: "nutella",
    name: "Nutella",
    description: "Sorvete de baunilha e creme de nutella",
    prices: [
      { size: "500ml", price: 25 },
      { size: "300ml", price: 20 },
    ],
    category: "tradicionais",
    image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=200&h=200&fit=crop",
  },
  {
    id: "pacoquinha",
    name: "Paçoquinha",
    description: "Sorvete de baunilha, paçoquinha e pasta de amendoim",
    prices: [
      { size: "500ml", price: 25 },
      { size: "300ml", price: 20 },
    ],
    category: "tradicionais",
    image: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=200&h=200&fit=crop",
  },
  {
    id: "churros",
    name: "Churros",
    description: "Doce de leite, sorvete de baunilha e canela em pó",
    prices: [
      { size: "500ml", price: 25 },
      { size: "300ml", price: 20 },
    ],
    category: "tradicionais",
    image: "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=200&h=200&fit=crop",
  },
  {
    id: "kit-kat",
    name: "Kit kat",
    description: "Brigadeiro, sorvete de baunilha e kit kat",
    prices: [
      { size: "500ml", price: 25 },
      { size: "300ml", price: 20 },
    ],
    category: "tradicionais",
    image: "https://images.unsplash.com/photo-1534119428213-bd2626145164?w=200&h=200&fit=crop",
  },
  {
    id: "sonho-valsa",
    name: "Sonho de valsa",
    description: "Sorvete de baunilha, brigadeiro e sonho de valsa",
    prices: [
      { size: "500ml", price: 25 },
      { size: "300ml", price: 20 },
    ],
    category: "tradicionais",
    image: "https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=200&h=200&fit=crop",
  },
  {
    id: "twix",
    name: "Twix",
    description: "Sorvete de baunilha, calda de caramelo e pedaços de twix",
    prices: [
      { size: "500ml", price: 25 },
      { size: "300ml", price: 20 },
    ],
    category: "tradicionais",
    image: "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=200&h=200&fit=crop",
  },
  {
    id: "prestigio",
    name: "Prestígio",
    description: "Brigadeiro caseiro de ninho, sorvete de baunilha, coco ralado, nutella e prestígio",
    prices: [
      { size: "500ml", price: 25 },
      { size: "300ml", price: 20 },
    ],
    category: "tradicionais",
    image: "https://images.unsplash.com/photo-1587132137056-bfbf0166836e?w=200&h=200&fit=crop",
  },
  {
    id: "brigadeiro",
    name: "Brigadeiro",
    description: "Brigadeiro caseiro, sorvete de baunilha e chocolate granulado",
    prices: [
      { size: "500ml", price: 25 },
      { size: "300ml", price: 20 },
    ],
    category: "tradicionais",
    image: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=200&h=200&fit=crop",
  },
  {
    id: "banoffe",
    name: "Banoffe",
    description: "Doce de leite, biscoito de maizena, banana, sorvete de baunilha e canela",
    prices: [
      { size: "500ml", price: 25 },
      { size: "300ml", price: 20 },
    ],
    category: "tradicionais",
    image: "https://images.unsplash.com/photo-1568901839119-631418a3910d?w=200&h=200&fit=crop",
  },
  {
    id: "nesquik",
    name: "Nesquik",
    description: "Brigadeiro caseiro de nesquik, sorvete de baunilha e nesquik",
    prices: [
      { size: "500ml", price: 25 },
      { size: "300ml", price: 20 },
    ],
    category: "tradicionais",
    image: "https://images.unsplash.com/photo-1579954115545-a95591f28bfc?w=200&h=200&fit=crop",
  },
  {
    id: "kids",
    name: "Kids",
    description: "Sorvete de baunilha, brigadeiro, M&M e marshmallow fini",
    prices: [
      { size: "500ml", price: 25 },
      { size: "300ml", price: 20 },
    ],
    category: "tradicionais",
    image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=200&h=200&fit=crop",
  },
  {
    id: "morango",
    name: "Morango",
    description: "Sorvete de baunilha e calda de morango em pedaços",
    prices: [
      { size: "500ml", price: 25 },
      { size: "300ml", price: 20 },
    ],
    category: "tradicionais",
    image: "https://images.unsplash.com/photo-1553787499-6f9133860278?w=200&h=200&fit=crop",
  },
  {
    id: "milho-verde",
    name: "Milho Verde",
    description: "Sorvete de baunilha, batido com milho verde, finalizado com brigadeiro branco",
    prices: [
      { size: "500ml", price: 25 },
      { size: "300ml", price: 20 },
    ],
    category: "tradicionais",
    image: "https://images.unsplash.com/photo-1587314168485-3236d6710814?w=200&h=200&fit=crop",
  },
  {
    id: "doce-leite-coco",
    name: "Doce de leite com coco",
    description: "Doce de leite, leite de coco, sorvete de baunilha e coco ralado",
    prices: [
      { size: "500ml", price: 25 },
      { size: "300ml", price: 20 },
    ],
    category: "tradicionais",
    image: "https://images.unsplash.com/photo-1541658016709-82535e94bc69?w=200&h=200&fit=crop",
  },

  // Especiais - 500ml R$27 / 300ml R$22
  {
    id: "kinder-bueno",
    name: "Kinder Bueno",
    description: "Brigadeiro branco, pedaços de kinder bueno, sorvete de baunilha e nutella",
    prices: [
      { size: "500ml", price: 27 },
      { size: "300ml", price: 22 },
    ],
    category: "especiais",
    image: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=200&h=200&fit=crop",
  },
  {
    id: "pistache",
    name: "Pistache",
    description: "Calda de pistache e sorvete de baunilha",
    prices: [
      { size: "500ml", price: 27 },
      { size: "300ml", price: 22 },
    ],
    category: "especiais",
    image: "https://images.unsplash.com/photo-1560008581-09826d1de69e?w=200&h=200&fit=crop",
  },
  {
    id: "rafaello",
    name: "Rafaello",
    description: "Brigadeiro caseiro de ninho, sorvete de baunilha, pedaços de rafaello e coco ralado",
    prices: [
      { size: "500ml", price: 27 },
      { size: "300ml", price: 22 },
    ],
    category: "especiais",
    image: "https://images.unsplash.com/photo-1568901839119-631418a3910d?w=200&h=200&fit=crop",
  },
  {
    id: "ferreiro-rocher",
    name: "Ferreiro rocher",
    description: "Sorvete de baunilha, bombom, ferreiro rocher e nutella",
    prices: [
      { size: "500ml", price: 27 },
      { size: "300ml", price: 22 },
    ],
    category: "especiais",
    image: "https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=200&h=200&fit=crop",
  },
  {
    id: "amarena-nutella",
    name: "Amarena com Nutella",
    description: "Sorvete de baunilha, calda em pedaços de amarena e nutella",
    prices: [
      { size: "500ml", price: 27 },
      { size: "300ml", price: 22 },
    ],
    category: "especiais",
    image: "https://images.unsplash.com/photo-1586917049673-86436e07de8c?w=200&h=200&fit=crop",
  },
  {
    id: "amarena-ninho",
    name: "Amarena com ninho",
    description: "Sorvete de baunilha, calda de amarena, brigadeiro de ninho e leite em pó",
    prices: [
      { size: "500ml", price: 27 },
      { size: "300ml", price: 22 },
    ],
    category: "especiais",
    image: "https://images.unsplash.com/photo-1553787499-6f9133860278?w=200&h=200&fit=crop",
  },
  {
    id: "fini-bananinhas",
    name: "Fini bananinhas",
    description: "Calda de fini bananinhas, sorvete de baunilha, finalizado com gomas bananinhas fini",
    prices: [
      { size: "500ml", price: 27 },
      { size: "300ml", price: 22 },
    ],
    category: "especiais",
    image: "https://images.unsplash.com/photo-1587314168485-3236d6710814?w=200&h=200&fit=crop",
  },
  {
    id: "fini-dentaduras",
    name: "Fini dentaduras",
    description: "Sorvete de baunilha, calda de fini dentaduras, finalizado com gomas fini dentaduras",
    prices: [
      { size: "500ml", price: 27 },
      { size: "300ml", price: 22 },
    ],
    category: "especiais",
    image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=200&h=200&fit=crop",
  },
  {
    id: "fini-beijos",
    name: "Fini beijos",
    description: "Sorvete de baunilha, calda de fini beijos, finalizado com gomas beijos fini",
    prices: [
      { size: "500ml", price: 27 },
      { size: "300ml", price: 22 },
    ],
    category: "especiais",
    image: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=200&h=200&fit=crop",
  },

  // Alcoólicos - 500ml R$32 / 300ml R$25
  {
    id: "amarula",
    name: "Amarula",
    description: "Sorvete de baunilha, amarula, calda de morango em pedaços, nutella",
    prices: [
      { size: "500ml", price: 32 },
      { size: "300ml", price: 25 },
    ],
    category: "alcoolicos",
    image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=200&h=200&fit=crop",
  },
  {
    id: "jack-daniels",
    name: "Jack Daniel's",
    description: "Sorvete de baunilha, brigadeiro, Jack Daniel's",
    prices: [
      { size: "500ml", price: 32 },
      { size: "300ml", price: 25 },
    ],
    category: "alcoolicos",
    image: "https://images.unsplash.com/photo-1579954115545-a95591f28bfc?w=200&h=200&fit=crop",
  },
  {
    id: "vodka-smirnoff",
    name: "Vodka Smirnoff",
    description: "Calda de limão, sorvete de baunilha, vodka",
    prices: [
      { size: "500ml", price: 32 },
      { size: "300ml", price: 25 },
    ],
    category: "alcoolicos",
    image: "https://images.unsplash.com/photo-1568901839119-631418a3910d?w=200&h=200&fit=crop",
  },

  // Açaí - 500ml R$25 / 300ml R$20
  {
    id: "acai",
    name: "Açaí",
    description: "Escolha 5 toppings: Morango, uva, banana, granola, paçoca, amendoim, leite em pó, leite condensado, coco ralado, ovomaltine, oreo",
    prices: [
      { size: "500ml", price: 25 },
      { size: "300ml", price: 20 },
    ],
    category: "acai",
    image: "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=200&h=200&fit=crop",
  },

  // Outros
  {
    id: "ice-yes",
    name: "Ice yes 240ml",
    description: "Opções: kit kat, Twix, Prestígio, Ovomaltine, Fini beijos, Fini banana, Fini dentadura",
    prices: [{ size: "240ml", price: 16.90 }],
    category: "outros",
    image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=200&h=200&fit=crop",
  },
  {
    id: "churros-tradicional",
    name: "Churros tradicional",
    description: "Doce de leite",
    prices: [{ size: "Unidade", price: 15 }],
    category: "outros",
    image: "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=200&h=200&fit=crop",
  },
  {
    id: "churros-gourmet",
    name: "Churros gourmets",
    description: "Kit Kat, Kinder bueno, Ninho com Nutella e morangos, Nutella, Nutella com morango, Ninho com morango, Banoffe, Ouro branco",
    prices: [{ size: "Unidade", price: 20 }],
    category: "outros",
    image: "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=200&h=200&fit=crop",
  },
  {
    id: "chuvete",
    name: "Chuvete",
    description: "Escolha uma fruta (Morango, Banana, Uva) e uma cobertura (Doce de leite, Brigadeiro de ninho, Nutella, Creme de ovomaltine)",
    prices: [{ size: "Unidade", price: 25 }],
    category: "outros",
    image: "https://images.unsplash.com/photo-1568901839119-631418a3910d?w=200&h=200&fit=crop",
  },
  {
    id: "churros-espanhol",
    name: "Churros espanhol",
    description: "Porção com 6 churros. Escolha uma cobertura: Creme de ovomaltine, Brigadeiro de ninho, Doce de leite, Nutella",
    prices: [{ size: "Porção", price: 22 }],
    category: "outros",
    image: "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=200&h=200&fit=crop",
  },
  {
    id: "casquinha-baunilha",
    name: "Casquinha Baunilha",
    description: "Sorvete de baunilha na casquinha",
    prices: [{ size: "Unidade", price: 5 }],
    category: "outros",
    image: "https://images.unsplash.com/photo-1560008581-09826d1de69e?w=200&h=200&fit=crop",
  },
  {
    id: "casquinha-pistache",
    name: "Casquinha Pistache",
    description: "Sorvete de pistache na casquinha",
    prices: [{ size: "Unidade", price: 7 }],
    category: "outros",
    image: "https://images.unsplash.com/photo-1560008581-09826d1de69e?w=200&h=200&fit=crop",
  },
  {
    id: "sundae",
    name: "Sundae",
    description: "Sabores: Morango, Chocolate, Doce de leite e Maracujá",
    prices: [{ size: "Unidade", price: 15.90 }],
    category: "outros",
    image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=200&h=200&fit=crop",
  },
];

export const extras = [
  { id: "chantilly", name: "Adicione chantilly e tubes", price: 4 },
  { id: "refrigerante", name: "Refrigerante", price: 7 },
  { id: "agua", name: "Água", price: 4 },
];

export const acaiTurbine = [
  "Nutella",
  "Brigadeiro de ninho",
  "Doce de leite",
  "Kit kat",
  "Twix",
  "Calda de morango em pedaços",
];
