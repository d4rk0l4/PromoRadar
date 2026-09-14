"""
adapters/__init__.py
------------------------------------------------------------------
Registro central dos adapters ativos. Pra ligar/desligar uma loja,
comente/descomente a linha correspondente aqui — nenhum outro lugar
do código precisa mudar.
------------------------------------------------------------------
"""

from .mercadolivre import MercadoLivreAdapter
from .shopee import ShopeeAdapter
from .amazon import AmazonAdapter

ACTIVE_ADAPTERS = [
    MercadoLivreAdapter(),
    ShopeeAdapter(),
    AmazonAdapter(),
]
