/**
 * products.js
 * ------------------------------------------------------------------
 * MODO DEMONSTRAÇÃO
 * Todos os produtos abaixo são fictícios. Preços, descontos, lojas e
 * links NÃO representam ofertas reais — servem apenas para testar a
 * interface do PromoRadar.
 *
 * Este arquivo também expõe a camada de acesso a dados (getProducts).
 * Hoje ela devolve o array de demonstração; no futuro, basta trocar
 * o corpo da função por uma chamada fetch() a uma API real que o
 * resto do app continua funcionando sem alterações.
 * ------------------------------------------------------------------
 */

const IS_DEMO_MODE = true;

function img(seed, color) {
  // Placeholder de demonstração — não são fotos reais de produtos.
  return `https://placehold.co/400x400/${color}/f2ede6?text=${encodeURIComponent(seed)}&font=roboto`;
}

const demoProducts = [
  { id: 1, name: "Mouse Gamer Vortex X7", store: "Shopee", category: "Informática", brand: "Vortex", currentPrice: 89.90, oldPrice: 129.90, image: img("Mouse", "2b2118"), url: "https://example.com/produto/1", dateAdded: "2026-09-10" },
  { id: 2, name: "Teclado Mecânico Nébula 60%", store: "Kabum", category: "Informática", brand: "Nébula", currentPrice: 249.90, oldPrice: 349.90, image: img("Teclado", "1e1a16"), url: "https://example.com/produto/2", dateAdded: "2026-09-11" },
  { id: 3, name: "SSD NVMe 1TB Raio Rápido", store: "Terabyte", category: "Informática", brand: "Raio", currentPrice: 329.00, oldPrice: 459.00, image: img("SSD+1TB", "2b2118"), url: "https://example.com/produto/3", dateAdded: "2026-09-12" },
  { id: 4, name: "Monitor 27\" 165Hz ClearView", store: "Pichau", category: "Informática", brand: "ClearView", currentPrice: 1299.00, oldPrice: 1799.00, image: img("Monitor", "1e1a16"), url: "https://example.com/produto/4", dateAdded: "2026-09-08" },
  { id: 5, name: "Memória RAM 16GB DDR4 Turbo", store: "Kabum", category: "Informática", brand: "Turbo", currentPrice: 219.90, oldPrice: 279.90, image: img("RAM+16GB", "2b2118"), url: "https://example.com/produto/5", dateAdded: "2026-09-09" },
  { id: 6, name: "Headset Gamer Sonora Pro", store: "Pichau", category: "Games", brand: "Sonora", currentPrice: 179.90, oldPrice: 259.90, image: img("Headset", "1e1a16"), url: "https://example.com/produto/6", dateAdded: "2026-09-05" },
  { id: 7, name: "Controle Sem Fio DualPulse", store: "Amazon", category: "Games", brand: "DualPulse", currentPrice: 299.00, oldPrice: 399.00, image: img("Controle", "2b2118"), url: "https://example.com/produto/7", dateAdded: "2026-09-01" },
  { id: 8, name: "Cadeira Gamer Estrutura Aço", store: "Magalu", category: "Games", brand: "Estrutura", currentPrice: 899.00, oldPrice: 1499.00, image: img("Cadeira", "1e1a16"), url: "https://example.com/produto/8", dateAdded: "2026-08-30" },
  { id: 9, name: "Console Retrô Mini 620 Jogos", store: "AliExpress", category: "Games", brand: "RetroBox", currentPrice: 159.90, oldPrice: 229.90, image: img("Console", "2b2118"), url: "https://example.com/produto/9", dateAdded: "2026-08-28" },
  { id: 10, name: "Celular Prisma Z40 128GB", store: "Magalu", category: "Celulares", brand: "Prisma", currentPrice: 1199.00, oldPrice: 1599.00, image: img("Celular", "1e1a16"), url: "https://example.com/produto/10", dateAdded: "2026-09-11" },
  { id: 11, name: "Celular Prisma Z40 Lite 64GB", store: "Casas Bahia", category: "Celulares", brand: "Prisma", currentPrice: 899.00, oldPrice: 1099.00, image: img("Celular+Lite", "2b2118"), url: "https://example.com/produto/11", dateAdded: "2026-09-07" },
  { id: 12, name: "Capinha Silicone Premium", store: "Shopee", category: "Acessórios", brand: "SoftCase", currentPrice: 24.90, oldPrice: 39.90, image: img("Capinha", "1e1a16"), url: "https://example.com/produto/12", dateAdded: "2026-09-06" },
  { id: 13, name: "Carregador Turbo 65W GaN", store: "AliExpress", category: "Eletrônicos", brand: "VoltGo", currentPrice: 69.90, oldPrice: 119.90, image: img("Carregador", "2b2118"), url: "https://example.com/produto/13", dateAdded: "2026-09-04" },
  { id: 14, name: "Fone Bluetooth Aro Clear", store: "Amazon", category: "Eletrônicos", brand: "Aro", currentPrice: 149.00, oldPrice: 229.00, image: img("Fone", "1e1a16"), url: "https://example.com/produto/14", dateAdded: "2026-09-03" },
  { id: 15, name: "Smartwatch Pulse Fit 2", store: "Shopee", category: "Eletrônicos", brand: "Pulse", currentPrice: 219.90, oldPrice: 329.90, image: img("Smartwatch", "2b2118"), url: "https://example.com/produto/15", dateAdded: "2026-08-27" },
  { id: 16, name: "Caixa de Som Portátil Bloom", store: "Magalu", category: "Eletrônicos", brand: "Bloom", currentPrice: 189.00, oldPrice: 259.00, image: img("Caixa+Som", "1e1a16"), url: "https://example.com/produto/16", dateAdded: "2026-08-25" },
  { id: 17, name: "Air Fryer 5L CrocanteJá", store: "Casas Bahia", category: "Casa", brand: "CrocanteJá", currentPrice: 279.00, oldPrice: 399.00, image: img("Air+Fryer", "2b2118"), url: "https://example.com/produto/17", dateAdded: "2026-09-02" },
  { id: 18, name: "Aspirador Robô Varre Tudo", store: "Amazon", category: "Casa", brand: "Varre Tudo", currentPrice: 799.00, oldPrice: 1299.00, image: img("Aspirador", "1e1a16"), url: "https://example.com/produto/18", dateAdded: "2026-08-31" },
  { id: 19, name: "Jogo de Panelas Antiaderente 5pç", store: "Magalu", category: "Casa", brand: "ChefLar", currentPrice: 199.90, oldPrice: 289.90, image: img("Panelas", "2b2118"), url: "https://example.com/produto/19", dateAdded: "2026-08-29" },
  { id: 20, name: "Luminária LED de Mesa Foco", store: "Shopee", category: "Casa", brand: "Foco", currentPrice: 59.90, oldPrice: 89.90, image: img("Luminária", "1e1a16"), url: "https://example.com/produto/20", dateAdded: "2026-08-26" },
  { id: 21, name: "Tênis Runner Nimbus Trail", store: "Mercado Livre", category: "Calçados", brand: "Nimbus", currentPrice: 249.90, oldPrice: 399.90, image: img("Tênis", "2b2118"), url: "https://example.com/produto/21", dateAdded: "2026-09-12" },
  { id: 22, name: "Tênis Casual Urbano Flex", store: "Magalu", category: "Calçados", brand: "Urbano", currentPrice: 159.90, oldPrice: 219.90, image: img("Tênis+Flex", "1e1a16"), url: "https://example.com/produto/22", dateAdded: "2026-09-10" },
  { id: 23, name: "Chinelo Slide Conforto+", store: "Shopee", category: "Calçados", brand: "Conforto+", currentPrice: 39.90, oldPrice: 59.90, image: img("Chinelo", "2b2118"), url: "https://example.com/produto/23", dateAdded: "2026-09-05" },
  { id: 24, name: "Jaqueta Corta-Vento Windshell", store: "Mercado Livre", category: "Roupas", brand: "Windshell", currentPrice: 189.90, oldPrice: 289.90, image: img("Jaqueta", "1e1a16"), url: "https://example.com/produto/24", dateAdded: "2026-09-01" },
  { id: 25, name: "Camiseta Básica Algodão Premium", store: "Shopee", category: "Roupas", brand: "Basics", currentPrice: 39.90, oldPrice: 64.90, image: img("Camiseta", "2b2118"), url: "https://example.com/produto/25", dateAdded: "2026-08-30" },
  { id: 26, name: "Calça Jogger Confort Move", store: "AliExpress", category: "Roupas", brand: "Move", currentPrice: 79.90, oldPrice: 129.90, image: img("Calça", "1e1a16"), url: "https://example.com/produto/26", dateAdded: "2026-08-24" },
  { id: 27, name: "Mochila Notebook Urbana 15.6\"", store: "Amazon", category: "Acessórios", brand: "Urbana", currentPrice: 129.90, oldPrice: 199.90, image: img("Mochila", "2b2118"), url: "https://example.com/produto/27", dateAdded: "2026-09-06" },
  { id: 28, name: "Óculos de Sol Polarizado Horizon", store: "Mercado Livre", category: "Acessórios", brand: "Horizon", currentPrice: 89.90, oldPrice: 149.90, image: img("Óculos", "1e1a16"), url: "https://example.com/produto/28", dateAdded: "2026-08-22" },
  { id: 29, name: "Garrafa Térmica Aço Inox 1L", store: "Casas Bahia", category: "Outros", brand: "TermoLar", currentPrice: 49.90, oldPrice: 79.90, image: img("Garrafa", "2b2118"), url: "https://example.com/produto/29", dateAdded: "2026-08-20" },
  { id: 30, name: "Kit Ferramentas 40 peças MultiUso", store: "Magalu", category: "Outros", brand: "MultiUso", currentPrice: 119.90, oldPrice: 189.90, image: img("Ferramentas", "1e1a16"), url: "https://example.com/produto/30", dateAdded: "2026-08-18" },
  { id: 31, name: "Webcam Full HD StreamEye", store: "Kabum", category: "Informática", brand: "StreamEye", currentPrice: 159.90, oldPrice: 219.90, image: img("Webcam", "2b2118"), url: "https://example.com/produto/31", dateAdded: "2026-09-07" },
  { id: 32, name: "Mousepad Gamer XL Estelar", store: "Pichau", category: "Games", brand: "Estelar", currentPrice: 49.90, oldPrice: 74.90, image: img("Mousepad", "1e1a16"), url: "https://example.com/produto/32", dateAdded: "2026-08-19" },
];

// Calcula o desconto percentual a partir dos preços — mantém os dados
// consistentes mesmo que alguém edite os preços acima.
demoProducts.forEach((p) => {
  p.discount = Math.round(((p.oldPrice - p.currentPrice) / p.oldPrice) * 100);
});

/**
 * Camada de acesso a dados. Hoje devolve os dados de demonstração.
 * No futuro, troque o corpo por algo como:
 *
 *   const response = await fetch("https://api.seudominio.com/ofertas");
 *   if (!response.ok) throw new Error("Falha ao buscar ofertas");
 *   return await response.json();
 *
 * Nenhum outro arquivo precisa mudar quando isso acontecer — o app.js
 * só chama getProducts() e trabalha com o array que ela devolver.
 */
async function getProducts() {
  return demoProducts;
}
