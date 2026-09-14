"""
adapters/base.py
------------------------------------------------------------------
Contrato comum que todo adapter de loja precisa seguir. O núcleo do
scraper (scheduler/run_scrape) NÃO conhece nada específico de
Mercado Livre, Shopee ou Amazon — ele só chama adapter.fetch_offers()
e recebe uma lista de RawOffer. Pra adicionar uma loja nova, basta
criar um novo arquivo aqui dentro seguindo essa mesma interface.
------------------------------------------------------------------
"""

from dataclasses import dataclass
from typing import Optional, List
import time
import logging

from config import REQUEST_DELAY_SECONDS

logger = logging.getLogger("promoradar.adapters")


@dataclass
class RawOffer:
    """Formato cru que cada adapter devolve, antes de virar um Product no banco."""
    name: str
    store: str
    category: str
    current_price: float
    old_price: Optional[float]
    image: Optional[str]
    url: str
    brand: Optional[str] = None


class BaseAdapter:
    store_name: str = "Desconhecida"

    def fetch_offers(self) -> List[RawOffer]:
        """Deve devolver a lista de ofertas encontradas nesta rodada.
        Implementar em cada subclasse. Nunca deixe uma exceção subir
        até o scheduler — capture e logue, devolvendo lista vazia,
        pra um erro numa loja não derrubar as outras."""
        raise NotImplementedError

    def _throttle(self):
        """Chame entre requisições pra não martelar o site da loja."""
        time.sleep(REQUEST_DELAY_SECONDS)

    def safe_fetch_offers(self) -> List[RawOffer]:
        try:
            return self.fetch_offers()
        except Exception as exc:  # noqa: BLE001 — queremos capturar qualquer falha aqui
            logger.error("Falha ao buscar ofertas em %s: %s", self.store_name, exc)
            return []
