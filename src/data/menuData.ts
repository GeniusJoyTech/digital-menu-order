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
  popular?: boolean;
}

export interface CartItem extends MenuItem {
  selectedSize: string;
  selectedPrice: number;
  quantity: number;
}

export const menuCategories = [
  { id: "tradicionais", name: "Milk Shakes Tradicionais", icon: "🥤" },
  { id: "especiais", name: "Milk Shakes Especiais", icon: "⭐" },
  { id: "acai", name: "Açaí", icon: "🫐" },
];

export const menuItems: MenuItem[] = [
  // Milk Shakes Tradicionais
  {
    id: "ovomaltine",
    name: "Ovomaltine",
    description: "Cremoso milk shake com flocos crocantes de Ovomaltine",
    prices: [
      { size: "300ml", price: 20 },
      { size: "500ml", price: 25 },
    ],
    category: "tradicionais",
    image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&h=400&fit=crop",
    popular: true,
  },
  {
    id: "maltine-top",
    name: "Maltine Top",
    description: "Milk shake com Maltine cremoso e irresistível",
    prices: [
      { size: "300ml", price: 20 },
      { size: "500ml", price: 25 },
    ],
    category: "tradicionais",
    image: "https://images.unsplash.com/photo-1579954115545-a95591f28bfc?w=400&h=400&fit=crop",
  },
  {
    id: "ouro-branco",
    name: "Ouro Branco",
    description: "Delicioso milk shake sabor Ouro Branco",
    prices: [
      { size: "300ml", price: 20 },
      { size: "500ml", price: 25 },
    ],
    category: "tradicionais",
    image: "https://images.unsplash.com/photo-1568901839119-631418a3910d?w=400&h=400&fit=crop",
  },
  {
    id: "cookies-and-cream",
    name: "Cookies and Cream",
    description: "Milk shake com pedaços de biscoito Oreo",
    prices: [
      { size: "300ml", price: 20 },
      { size: "500ml", price: 25 },
    ],
    category: "tradicionais",
    image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=400&fit=crop",
    popular: true,
  },
  {
    id: "mousse-maracuja",
    name: "Mousse de Maracujá",
    description: "Refrescante milk shake com mousse de maracujá",
    prices: [
      { size: "300ml", price: 20 },
      { size: "500ml", price: 25 },
    ],
    category: "tradicionais",
    image: "https://images.unsplash.com/photo-1587314168485-3236d6710814?w=400&h=400&fit=crop",
  },
  {
    id: "ninho-morango",
    name: "Ninho com Morango",
    description: "Milk shake de leite ninho com calda de morango",
    prices: [
      { size: "300ml", price: 20 },
      { size: "500ml", price: 25 },
    ],
    category: "tradicionais",
    image: "https://images.unsplash.com/photo-1553787499-6f9133860278?w=400&h=400&fit=crop",
    popular: true,
  },
  {
    id: "ninho",
    name: "Ninho",
    description: "Clássico milk shake de leite ninho",
    prices: [
      { size: "300ml", price: 20 },
      { size: "500ml", price: 25 },
    ],
    category: "tradicionais",
    image: "https://images.unsplash.com/photo-1541658016709-82535e94bc69?w=400&h=400&fit=crop",
  },
  {
    id: "ninho-nutella",
    name: "Ninho com Nutella",
    description: "Milk shake de leite ninho com Nutella",
    prices: [
      { size: "300ml", price: 20 },
      { size: "500ml", price: 25 },
    ],
    category: "tradicionais",
    image: "https://images.unsplash.com/photo-1619158401201-8fa932695178?w=400&h=400&fit=crop",
    popular: true,
  },
  {
    id: "morango-nutella",
    name: "Morango com Nutella",
    description: "Combinação perfeita de morango com Nutella",
    prices: [
      { size: "300ml", price: 20 },
      { size: "500ml", price: 25 },
    ],
    category: "tradicionais",
    image: "https://images.unsplash.com/photo-1586917049673-86436e07de8c?w=400&h=400&fit=crop",
  },
  {
    id: "nutella",
    name: "Nutella",
    description: "Puro prazer de Nutella em forma de milk shake",
    prices: [
      { size: "300ml", price: 20 },
      { size: "500ml", price: 25 },
    ],
    category: "tradicionais",
    image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&h=400&fit=crop",
  },
  // Especiais
  {
    id: "kit-kat",
    name: "Kit Kat",
    description: "Milk shake cremoso com pedaços de Kit Kat",
    prices: [
      { size: "300ml", price: 22 },
      { size: "500ml", price: 28 },
    ],
    category: "especiais",
    image: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=400&fit=crop",
    popular: true,
  },
  {
    id: "ferrero-rocher",
    name: "Ferrero Rocher",
    description: "Luxuoso milk shake com Ferrero Rocher",
    prices: [
      { size: "300ml", price: 25 },
      { size: "500ml", price: 32 },
    ],
    category: "especiais",
    image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=400&fit=crop",
  },
  {
    id: "brigadeiro",
    name: "Brigadeiro",
    description: "Milk shake com genuíno sabor de brigadeiro",
    prices: [
      { size: "300ml", price: 22 },
      { size: "500ml", price: 28 },
    ],
    category: "especiais",
    image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&h=400&fit=crop",
  },
  // Açaí
  {
    id: "acai-tradicional",
    name: "Açaí Tradicional",
    description: "Açaí cremoso com banana e granola",
    prices: [
      { size: "300ml", price: 18 },
      { size: "500ml", price: 24 },
    ],
    category: "acai",
    image: "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400&h=400&fit=crop",
    popular: true,
  },
  {
    id: "acai-morango",
    name: "Açaí com Morango",
    description: "Açaí com morangos frescos e leite condensado",
    prices: [
      { size: "300ml", price: 20 },
      { size: "500ml", price: 26 },
    ],
    category: "acai",
    image: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400&h=400&fit=crop",
  },
  {
    id: "acai-nutella",
    name: "Açaí com Nutella",
    description: "Açaí premium com generosa porção de Nutella",
    prices: [
      { size: "300ml", price: 22 },
      { size: "500ml", price: 28 },
    ],
    category: "acai",
    image: "https://images.unsplash.com/photo-1590301157284-75a0a4d72e13?w=400&h=400&fit=crop",
  },
];
