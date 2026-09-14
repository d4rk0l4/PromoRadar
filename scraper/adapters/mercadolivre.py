"""
adapters/mercadolivre.py
------------------------------------------------------------------
Mercado Livre é o adapter mais estável dos três porque a página de
ofertas é majoritariamente renderizada no servidor (dá pra ler com
requests + BeautifulSoup, sem precisar de navegador headless).

⚠️ IMPORTANTE — leia antes de rodar:
Os seletores CSS abaixo (classes como "poly-card", "andes-money-amount"
etc.) refletem a estrutura do HTML do Mercado Livre em uso comum, mas
o site muda o markup com frequência e este ambiente aqui não tem
acesso de rede para validar contra a página real no momento em que
este código foi escrito. Antes de rodar de verdade:

  1. Abra https://www.mercadolivre.com.br/ofertas no navegador.
  2. Inspecione (botão direito → Inspecionar) um card de produto.
  3. Confirme/ajuste os seletores em _parse_card() abaixo pro que
     você encontrar na hora.

Isso é manutenção normal de scraper — os sites mudam, o adapter
precisa acompanhar.
------------------------------------------------------------------
"""

import re
from typing import List, Optional

import requests
from bs4 import BeautifulSoup

from adapters.base import BaseAdapter, RawOffer
from config import DEFAULT_HEADERS, REQUEST_TIMEOUT_SECONDS

OFFERS_URL = "https://www.mercadolivre.com.br/ofertas"


def _parse_price(text: Optional[str]) -> Optional[float]:
    if not text:
        return None
    # "R$ 1.299,00" -> 1299.00
    digits = re.sub(r"[^\d,]", "", text).replace(",", ".")
    try:
        return float(digits)
    except ValueError:
        return None


class MercadoLivreAdapter(BaseAdapter):
    store_name = "Mercado Livre"

    def fetch_offers(self) -> List[RawOffer]:
        offers: List[RawOffer] = []

        response = requests.get(OFFERS_URL, headers=DEFAULT_HEADERS, timeout=REQUEST_TIMEOUT_SECONDS)
        response.raise_for_status()
        self._throttle()

        soup = BeautifulSoup(response.text, "lxml")

        # Ajuste este seletor conforme o que você encontrar no devtools.
        cards = soup.select("div.poly-card, li.ui-search-layout__item, div.andes-card")

        for card in cards:
            offer = self._parse_card(card)
            if offer:
                offers.append(offer)

        return offers

    def _parse_card(self, card) -> Optional[RawOffer]:
        name_el = card.select_one("h2, .poly-component__title, .ui-search-item__title")
        link_el = card.select_one("a")
        price_el = card.select_one(".andes-money-amount__fraction, .price-tag-fraction")
        old_price_el = card.select_one("s .andes-money-amount__fraction, .price-tag-fraction del")
        image_el = card.select_one("img")

        if not (name_el and link_el and price_el):
            return None

        name = name_el.get_text(strip=True)
        url = link_el.get("href", "")
        current_price = _parse_price(price_el.get_text(strip=True))
        old_price = _parse_price(old_price_el.get_text(strip=True)) if old_price_el else None
        image = image_el.get("data-src") or image_el.get("src") if image_el else None

        if not name or not url or current_price is None:
            return None

        return RawOffer(
            name=name,
            store=self.store_name,
            category="Outros",  # ML não segmenta por categoria clara na página de ofertas geral
            current_price=current_price,
            old_price=old_price,
            image=image,
            url=url,
        )
