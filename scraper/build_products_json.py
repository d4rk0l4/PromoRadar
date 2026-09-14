"""
scraper/build_products_json.py
------------------------------------------------------------------
Roda todos os adapters ativos e escreve ../data/products.json —
o arquivo estático que o frontend (js/products.js) busca via fetch.

Não usa banco de dados nem processo em background: isso é pensado
pra rodar do zero a cada execução, disparado pelo GitHub Actions
(.github/workflows/scrape.yml), sem nenhum servidor pago.

Uso:
    cd scraper
    python build_products_json.py              → roda todas as lojas ativas
    python build_products_json.py mercadolivre  → roda só uma loja (debug)
------------------------------------------------------------------
"""

import json
import sys
import logging
from datetime import datetime, timezone
from pathlib import Path

from adapters import ACTIVE_ADAPTERS

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("promoradar.build_json")

OUTPUT_PATH = Path(__file__).resolve().parent.parent / "data" / "products.json"


def offer_to_dict(offer, product_id: int) -> dict:
    discount = 0
    if offer.old_price and offer.old_price > offer.current_price:
        discount = round((offer.old_price - offer.current_price) / offer.old_price * 100)

    return {
        "id": product_id,
        "name": offer.name,
        "store": offer.store,
        "category": offer.category,
        "brand": offer.brand,
        "currentPrice": offer.current_price,
        "oldPrice": offer.old_price,
        "discount": discount,
        "image": offer.image,
        "url": offer.url,
        "dateAdded": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
    }


def build(adapters=None):
    adapters = adapters or ACTIVE_ADAPTERS
    all_products = []
    next_id = 1

    for adapter in adapters:
        logger.info("Buscando ofertas em %s...", adapter.store_name)
        offers = adapter.safe_fetch_offers()
        logger.info("%s: %d oferta(s) encontrada(s)", adapter.store_name, len(offers))

        for offer in offers:
            all_products.append(offer_to_dict(offer, next_id))
            next_id += 1

    payload = {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "products": all_products,
    }

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    logger.info("Escrito %s com %d produto(s).", OUTPUT_PATH, len(all_products))


def run_single(store_key: str):
    matches = [a for a in ACTIVE_ADAPTERS if store_key.lower() in a.store_name.lower().replace(" ", "")]
    if not matches:
        print(f"Nenhum adapter encontrado pra '{store_key}'. Ativos: {[a.store_name for a in ACTIVE_ADAPTERS]}")
        return
    build(adapters=matches)


if __name__ == "__main__":
    if len(sys.argv) > 1:
        run_single(sys.argv[1])
    else:
        build()
