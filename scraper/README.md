# PromoRadar — Scraper

Scraper em Python que roda via GitHub Actions (sem servidor, sem custo) e gera `../data/products.json`, o arquivo que o frontend do PromoRadar lê.

## Antes de rodar: leia isto

Os seletores CSS/HTML usados pelos adapters (`adapters/mercadolivre.py`, `adapters/shopee.py`, `adapters/amazon.py`) são um ponto de partida — este ambiente onde o código foi escrito não tem acesso de rede pra validar contra as páginas reais das lojas. **Sites mudam o HTML com frequência**, então antes da primeira rodada real:

1. Abra a página de ofertas de cada loja no navegador.
2. Clique com o botão direito num card de produto → **Inspecionar**.
3. Confira se as classes/atributos usados no adapter batem com o que você vê. Ajuste onde precisar.

Isso não é um bug — é manutenção normal de qualquer scraper.

### Sobre as 3 lojas

| Loja | Estabilidade | Como funciona |
|---|---|---|
| Mercado Livre | Mais estável | HTML renderizado no servidor, só `requests` + `BeautifulSoup` |
| Shopee | Frágil | SPA (JS), precisa de navegador headless (Playwright) |
| Amazon | Mais frágil | SPA + anti-bot forte (captcha), precisa de Playwright, tende a bloquear mais rápido |

Nenhum adapter tenta contornar captcha ou bloqueio — se a loja bloquear, o comportamento esperado é essa loja voltar sem dados naquela rodada, não insistir com truques. O GitHub Actions, sendo um runner novo a cada execução, também não tem "IP fixo banido" acumulando ao longo do tempo — mas ainda assim, execuções frequentes demais aumentam a chance de bloqueio.

## Rodando localmente (pra testar/ajustar os seletores)

```bash
cd scraper
python3 -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
playwright install chromium       # baixa o navegador headless (só na 1ª vez)
```

Testar um adapter isolado:

```bash
python build_products_json.py mercadolivre
```

Rodar tudo (gera `../data/products.json`):

```bash
python build_products_json.py
```

## Como funciona no GitHub Actions

O workflow `.github/workflows/scrape.yml`, na raiz do repositório:

1. Roda automaticamente a cada 6 horas (`cron`) — ajuste o horário editando esse arquivo.
2. Também pode ser disparado manualmente na aba **Actions** do GitHub → selecione o workflow → **Run workflow**.
3. Instala as dependências, roda `build_products_json.py`, e faz commit do `data/products.json` atualizado de volta no repositório.
4. O GitHub Pages, que já serve o resto do site, passa a servir esse JSON atualizado também — o frontend busca ele automaticamente.

Isso substitui completamente a ideia de um backend/API rodando 24/7 num serviço pago (tipo Railway): aqui não existe processo rodando o tempo todo, só uma execução pontual e agendada, de graça.

## Adicionando uma loja nova (ex: Kabum, Terabyte, Magalu, Casas Bahia)

1. Crie `adapters/nova_loja.py` seguindo o mesmo formato de `adapters/mercadolivre.py`.
2. Registre em `adapters/__init__.py`.
3. Pronto — `build_products_json.py` e o workflow não precisam de nenhuma mudança.

## Limitações atuais

- Scraping quebra quando o site muda o HTML — os seletores vão precisar de manutenção periódica.
- Shopee e Amazon usam navegador headless, mais lento e mais fácil de ser bloqueado que scraping simples.
- Nenhuma tentativa de contornar captcha/bloqueio — por design.
- `category` vem sempre como "Outros" nos 3 adapters atuais, porque as páginas de ofertas gerais não segmentam por categoria de forma confiável — dá pra refinar depois usando categorias específicas de cada loja.
- Cada execução gera a lista do zero (sem histórico de preço) — se no futuro você quiser gráfico de "preço ao longo do tempo", vai precisar guardar cada rodada em vez de sobrescrever `data/products.json`.
