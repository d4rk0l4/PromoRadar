"""
adapters/amazon.py
------------------------------------------------------------------
⚠️ O mais frágil dos três, ainda mais que a Shopee. A Amazon tem
detecção anti-bot forte (px-captcha e afins) e costuma bloquear
scraping bem mais rápido, mesmo com headers de navegador normal e
Playwright.

Este código NÃO tenta resolver captcha nem usar proxy/rotação de IP
pra escapar de bloqueio — se a Amazon passar a devolver captcha, o
comportamento esperado é essa loja ficar sem dados naquela rodada,
não forçar a entrada.

Valide os seletores abaixo no devtools de
https://www.amazon.com.br/gp/goldbox antes de rodar de verdade —
este ambiente não tem acesso de rede pra validar contra o site real
agora.

Dado o quanto isso tende a quebrar, uma opção realista é manter este
adapter mais como "melhor esforço": rode com pouca frequência
(ex: 1x por dia) pra reduzir a chance de bloqueio.
------------------------------------------------------------------
"""

import re
from typing import List, Optional

from playwright.sync_api import sync_playwright

from adapters.base import BaseAdapter, RawOffer
from config import DEFAULT_HEADERS

OFFERS_URL = "https://www.amazon.com.br/gp/goldbox"


def _parse_price(text: Optional[str]) -> Optional[float]:
    if not text:
        return None
    digits = re.sub(r"[^\d,]", "", text).replace(",", ".")
    try:
        return float(digits)
    except ValueError:
        return None


class AmazonAdapter(BaseAdapter):
    store_name = "Amazon"

    def fetch_offers(self) -> List[RawOffer]:
        offers: List[RawOffer] = []

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page(user_agent=DEFAULT_HEADERS["User-Agent"])
            try:
                page.goto(OFFERS_URL, timeout=30000, wait_until="networkidle")
                self._throttle()

                if page.query_selector("form[action*='validateCaptcha']"):
                    # A Amazon pediu captcha — desistimos dessa rodada em vez de tentar resolver.
                    return []

                # Ajuste este seletor conforme o que aparecer no devtools.
                cards = page.query_selector_all("[data-testid='product-card'], .DealGridItem-module__dealItemCard")

                for card in cards:
                    offer = self._parse_card(card)
                    if offer:
                        offers.append(offer)
            finally:
                browser.close()

        return offers

    def _parse_card(self, card) -> Optional[RawOffer]:
        name_el = card.query_selector("[data-testid='product-card-title'], .a-truncate-full")
        price_el = card.query_selector(".a-price .a-offscreen, [data-testid='price']")
        link_el = card.query_selector("a")
        image_el = card.query_selector("img")

        if not (name_el and price_el and link_el):
            return None

        name = name_el.inner_text().strip()
        current_price = _parse_price(price_el.inner_text())
        href = link_el.get_attribute("href") or ""
        url = href if href.startswith("http") else f"https://www.amazon.com.br{href}"
        image = image_el.get_attribute("src") if image_el else None

        if not name or current_price is None:
            return None

        return RawOffer(
            name=name,
            store=self.store_name,
            category="Outros",
            current_price=current_price,
            old_price=None,
            image=image,
            url=url,
        )
