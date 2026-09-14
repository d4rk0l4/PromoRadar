/**
 * filters.js
 * ------------------------------------------------------------------
 * Funções puras de busca, filtro e ordenação. Não tocam no DOM —
 * recebem uma lista de produtos e os critérios atuais, e devolvem
 * uma nova lista. Isso facilita testar e reaproveitar a lógica.
 * ------------------------------------------------------------------
 */

function searchProducts(products, term) {
  const q = term.trim().toLowerCase();
  if (!q) return products;
  return products.filter((p) =>
    [p.name, p.category, p.brand, p.store].some((field) =>
      field.toLowerCase().includes(q)
    )
  );
}

function filterByStore(products, store) {
  if (!store || store === "all") return products;
  return products.filter((p) => p.store === store);
}

function filterByCategory(products, category) {
  if (!category || category === "all") return products;
  return products.filter((p) => p.category === category);
}

function filterByPrice(products, min, max) {
  return products.filter((p) => {
    const aboveMin = min == null || min === "" ? true : p.currentPrice >= Number(min);
    const belowMax = max == null || max === "" ? true : p.currentPrice <= Number(max);
    return aboveMin && belowMax;
  });
}

function filterByDiscount(products, minDiscount) {
  if (!minDiscount || minDiscount === "all") return products;
  return products.filter((p) => p.discount >= Number(minDiscount));
}

function filterByFavorites(products, favoriteIds, onlyFavorites) {
  if (!onlyFavorites) return products;
  return products.filter((p) => favoriteIds.has(p.id));
}

function sortProducts(products, sortBy) {
  const list = [...products];
  switch (sortBy) {
    case "price-asc":
      return list.sort((a, b) => a.currentPrice - b.currentPrice);
    case "price-desc":
      return list.sort((a, b) => b.currentPrice - a.currentPrice);
    case "discount-desc":
      return list.sort((a, b) => b.discount - a.discount);
    case "recent":
      return list.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
    case "relevance":
    default:
      // "Mais relevantes": prioriza maior desconto, depois mais recente.
      return list.sort((a, b) => b.discount - a.discount || new Date(b.dateAdded) - new Date(a.dateAdded));
  }
}

/**
 * Aplica todos os critérios em conjunto (busca E filtros E ordenação),
 * na ordem esperada pelo app.
 */
function applyAllFilters(products, criteria, favoriteIds) {
  let result = products;
  result = searchProducts(result, criteria.term);
  result = filterByStore(result, criteria.store);
  result = filterByCategory(result, criteria.category);
  result = filterByPrice(result, criteria.minPrice, criteria.maxPrice);
  result = filterByDiscount(result, criteria.minDiscount);
  result = filterByFavorites(result, favoriteIds, criteria.onlyFavorites);
  result = sortProducts(result, criteria.sortBy);
  return result;
}
