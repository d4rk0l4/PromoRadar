/**
 * app.js
 * ------------------------------------------------------------------
 * Orquestra o PromoRadar: busca os produtos (via getProducts, definida
 * em products.js), aplica filtros (via filters.js) e renderiza a
 * interface. Também cuida de favoritos, tema e os estados da tela.
 * ------------------------------------------------------------------
 */

const FAVORITES_KEY = "promoradar:favorites";

const state = {
  allProducts: [],
  favoriteIds: loadFavorites(),
  criteria: {
    term: "",
    store: "all",
    category: "all",
    minPrice: "",
    maxPrice: "",
    minDiscount: "all",
    sortBy: "relevance",
    onlyFavorites: false,
  },
};

// ---------- localStorage: favoritos ----------

function loadFavorites() {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    const ids = raw ? JSON.parse(raw) : [];
    return new Set(ids);
  } catch (err) {
    console.error("Não foi possível ler os favoritos salvos:", err);
    return new Set();
  }
}

function persistFavorites() {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify([...state.favoriteIds]));
  } catch (err) {
    console.error("Não foi possível salvar os favoritos:", err);
  }
}

function toggleFavorite(id) {
  if (state.favoriteIds.has(id)) {
    state.favoriteIds.delete(id);
  } else {
    state.favoriteIds.add(id);
  }
  persistFavorites();
  updateFavoritesCount();
  render();
}

function updateFavoritesCount() {
  const el = document.getElementById("favoritesCount");
  el.textContent = state.favoriteIds.size;
  el.classList.toggle("is-hidden", state.favoriteIds.size === 0);
}

// ---------- tema claro/escuro ----------

const THEME_KEY = "promoradar:theme";

function loadTheme() {
  return localStorage.getItem(THEME_KEY) || "dark";
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  const btn = document.getElementById("themeToggle");
  btn.textContent = theme === "dark" ? "☀️ Modo claro" : "🌙 Modo escuro";
  localStorage.setItem(THEME_KEY, theme);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme");
  applyTheme(current === "dark" ? "light" : "dark");
}

// ---------- populando selects de loja/categoria ----------

const CATEGORIES = ["Eletrônicos", "Informática", "Games", "Celulares", "Casa", "Roupas", "Calçados", "Acessórios", "Outros"];
const STORES = ["Amazon", "Mercado Livre", "Shopee", "AliExpress", "Kabum", "Pichau", "Terabyte", "Magalu", "Casas Bahia"];

function populateSelect(selectEl, options) {
  options.forEach((opt) => {
    const el = document.createElement("option");
    el.value = opt;
    el.textContent = opt;
    selectEl.appendChild(el);
  });
}

// ---------- formatação ----------

function formatPrice(value) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// ---------- renderização ----------

function createProductCard(product) {
  const isFav = state.favoriteIds.has(product.id);
  const card = document.createElement("article");
  card.className = "card";

  card.innerHTML = `
    <div class="card__media">
      <img src="${product.image}" alt="${product.name}" loading="lazy" />
      <span class="card__discount">-${product.discount}%</span>
    </div>
    <div class="card__body">
      <p class="card__store">${product.store}</p>
      <h3 class="card__name">${product.name}</h3>
      <div class="card__prices">
        <span class="card__old-price">${formatPrice(product.oldPrice)}</span>
        <span class="card__price">${formatPrice(product.currentPrice)}</span>
      </div>
    </div>
    <div class="card__footer">
      <button class="card__fav ${isFav ? "is-active" : ""}" aria-label="Favoritar" data-id="${product.id}">
        ${isFav ? "❤️" : "🤍"}
      </button>
      <a class="card__cta" href="${product.url}" target="_blank" rel="noopener noreferrer">Ver oferta</a>
    </div>
  `;

  card.querySelector(".card__fav").addEventListener("click", () => toggleFavorite(product.id));
  return card;
}

function render() {
  const grid = document.getElementById("productGrid");
  const emptyState = document.getElementById("emptyState");
  const resultsCount = document.getElementById("resultsCount");

  const filtered = applyAllFilters(state.allProducts, state.criteria, state.favoriteIds);

  grid.innerHTML = "";
  resultsCount.textContent = `${filtered.length} oferta${filtered.length === 1 ? "" : "s"} encontrada${filtered.length === 1 ? "" : "s"}`;

  if (filtered.length === 0) {
    emptyState.classList.remove("is-hidden");
    grid.classList.add("is-hidden");
    return;
  }

  emptyState.classList.add("is-hidden");
  grid.classList.remove("is-hidden");

  const fragment = document.createDocumentFragment();
  filtered.forEach((product) => fragment.appendChild(createProductCard(product)));
  grid.appendChild(fragment);
}

function setLoading(isLoading) {
  document.getElementById("loadingState").classList.toggle("is-hidden", !isLoading);
  document.getElementById("mainContent").classList.toggle("is-hidden", isLoading);
}

function clearFilters() {
  state.criteria = {
    term: "",
    store: "all",
    category: "all",
    minPrice: "",
    maxPrice: "",
    minDiscount: "all",
    sortBy: "relevance",
    onlyFavorites: state.criteria.onlyFavorites,
  };

  document.getElementById("searchInput").value = "";
  document.getElementById("storeFilter").value = "all";
  document.getElementById("categoryFilter").value = "all";
  document.getElementById("minPrice").value = "";
  document.getElementById("maxPrice").value = "";
  document.getElementById("discountFilter").value = "all";
  document.getElementById("sortBy").value = "relevance";

  render();
}

// ---------- eventos ----------

function wireEvents() {
  document.getElementById("searchForm").addEventListener("submit", (e) => {
    e.preventDefault();
    state.criteria.term = document.getElementById("searchInput").value;
    render();
  });

  document.getElementById("clearSearch").addEventListener("click", () => {
    document.getElementById("searchInput").value = "";
    state.criteria.term = "";
    render();
  });

  document.getElementById("storeFilter").addEventListener("change", (e) => {
    state.criteria.store = e.target.value;
    render();
  });

  document.getElementById("categoryFilter").addEventListener("change", (e) => {
    state.criteria.category = e.target.value;
    render();
  });

  document.getElementById("minPrice").addEventListener("input", (e) => {
    state.criteria.minPrice = e.target.value;
    render();
  });

  document.getElementById("maxPrice").addEventListener("input", (e) => {
    state.criteria.maxPrice = e.target.value;
    render();
  });

  document.getElementById("discountFilter").addEventListener("change", (e) => {
    state.criteria.minDiscount = e.target.value;
    render();
  });

  document.getElementById("sortBy").addEventListener("change", (e) => {
    state.criteria.sortBy = e.target.value;
    render();
  });

  document.getElementById("clearFilters").addEventListener("click", clearFilters);
  document.getElementById("clearFiltersEmpty").addEventListener("click", clearFilters);

  document.getElementById("favoritesToggle").addEventListener("click", () => {
    state.criteria.onlyFavorites = !state.criteria.onlyFavorites;
    document.getElementById("favoritesToggle").classList.toggle("is-active", state.criteria.onlyFavorites);
    render();
  });

  document.getElementById("themeToggle").addEventListener("click", toggleTheme);
}

// ---------- inicialização ----------

async function init() {
  applyTheme(loadTheme());
  populateSelect(document.getElementById("storeFilter"), STORES);
  populateSelect(document.getElementById("categoryFilter"), CATEGORIES);
  updateFavoritesCount();
  wireEvents();

  setLoading(true);
  try {
    state.allProducts = await getProducts();
  } catch (err) {
    console.error("Erro ao buscar ofertas:", err);
    state.allProducts = [];
  }
  setLoading(false);
  updateDemoBanner();
  render();
}

function updateDemoBanner() {
  const banner = document.getElementById("demoBanner");
  const source = window.__promoradarDataSource || { isDemo: true };

  if (source.isDemo) {
    banner.textContent = "Dados de demonstração — integração com ofertas reais será adicionada posteriormente.";
  } else {
    const when = source.generatedAt
      ? new Date(source.generatedAt).toLocaleString("pt-BR")
      : "recentemente";
    banner.textContent = `Ofertas coletadas automaticamente das lojas — última atualização: ${when}.`;
  }
}

document.addEventListener("DOMContentLoaded", init);
