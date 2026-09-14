"""
adapters/shopee.py
------------------------------------------------------------------
⚠️ Este é o adapter mais frágil dos três.

Shopee é uma SPA (o conteúdo é montado via JavaScript depois que a
página carrega) e tem proteção anti-bot bem mais agressiva que o
Mercado Livre. Por isso:

  - Usa Playwright (navegador headless de verdade) em vez de
    requests simples — é bem mais pesado em CPU/RAM.
  - Pode passar a devolver captcha ou bloquear o IP depois de pouco
    uso. Este código NÃO tenta contornar captcha nem rotacionar
    proxy pra escapar de bloqueio — se isso acontecer, é sinal de
    reduzir a frequência (SCRAPE_INTERVAL_MINUTES no config.py) ou
    aceitar que essa loja fica sem dados por um tempo.
  - Os seletores abaixo são um ponto de partida; valide/ajuste no
    devtools do navegador (inspecionar um card em
    https://shopee.com.br/flash_sale) antes de rodar de verdade —
    este ambiente não tem acesso de rede pra validar contra o site
    real agora.

Se isso se mostrar bom demais trabalhoso pra manter, uma alternativa
mais estável é remover este adapter de ACTIVE_ADAPTERS
(adapters/__init__.py) e manter só Mercado Livre + Amazon.
------------------------------------------------------------------
"""

import re
from typing import List, Optional

from playwright.sync_api import sync_playwright

from adapters.base import BaseAdapter, RawOffer

OFFERS_URL = "https://shopee.com.br/flash_sale"


def _parse_price(text: Optional[str]) -> Optional[float]:
    if not text:
        return None
    digits = re.sub(r"[^\d,]", "", text).replace(",", ".")
    try:
        return float(digits)
    except ValueError:
        return None


class ShopeeAdapter(BaseAdapter):
    store_name = "Shopee"

    def fetch_offers(self) -> List[RawOffer]:
        offers: List[RawOffer] = []

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            try:
                page.goto(OFFERS_URL, timeout=30000, wait_until="networkidle")
                self._throttle()

                # Ajuste este seletor conforme o que aparecer no devtools.
                cards = page.query_selector_all("[data-sqe='item'], .shopee-item-card")

                for card in cards:
                    offer = self._parse_card(card)
                    if offer:
                        offers.append(offer)
            finally:
                browser.close()

        return offers

    def _parse_card(self, card) -> Optional[RawOffer]:
        name_el = card.query_selector("[data-sqe='name'], .shopee-item-card__text-name")
        price_el = card.query_selector("[data-sqe='price'], .shopee-item-card__current-price")
        link_el = card
        image_el = card.query_selector("img")

        if not (name_el and price_el):
            return None

        name = name_el.inner_text().strip()
        current_price = _parse_price(price_el.inner_text())
        href = link_el.get_attribute("href") or ""
        url = href if href.startswith("http") else f"https://shopee.com.br{href}"
        image = image_el.get_attribute("src") if image_el else None

        if not name or current_price is None:
            return None

        return RawOffer(
            name=name,
            store=self.store_name,
            category="Outros",
            current_price=current_price,
            old_price=None,  # a Shopee costuma exibir o % de desconto, não o preço antigo, no card
            image=image,
            url=url,
        )
