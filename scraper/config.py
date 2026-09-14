"""
scraper/config.py
------------------------------------------------------------------
Configurações do scraper. O agendamento agora é feito pelo GitHub
Actions (.github/workflows/scrape.yml), não por um processo rodando
o tempo todo — então não existe mais um "intervalo" configurado
aqui, isso vira o cron do workflow.
------------------------------------------------------------------
"""

import os

# User-Agent "normal" de navegador — só pra não ser bloqueado por
# identificar como bot óbvio. Não usamos nada pra burlar captcha,
# rotacionar IP ou driblar bloqueio ativo.
DEFAULT_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "pt-BR,pt;q=0.9",
}

# Intervalo mínimo entre requisições ao MESMO domínio, em segundos.
# Existe pra não sobrecarregar as lojas — ajuste pra cima se notar
# bloqueios, nunca ignore.
REQUEST_DELAY_SECONDS = float(os.getenv("REQUEST_DELAY_SECONDS", "2.5"))

# Timeout de rede por requisição/página.
REQUEST_TIMEOUT_SECONDS = int(os.getenv("REQUEST_TIMEOUT_SECONDS", "20"))
