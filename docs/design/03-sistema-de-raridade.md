# 03 — Sistema de Raridade

## Tiers de raridade

Sete tiers, do descartável ao topo absoluto. Cada tier tem cor, peso de drop, número de afixos e multiplicador de atributos.

| # | Raridade (`rarity`) | Cor / neon | Nº de afixos | Mult. de atributos | Peso base de drop |
|---|---------------------|-----------|--------------|--------------------|-------------------|
| 0 | **Comum** (`common`) | Cinza `#9AA5B1` | 0 | ×1.00 | 60.0 |
| 1 | **Incomum** (`uncommon`) | Verde `#3FB950` | 1 | ×1.15 | 24.0 |
| 2 | **Raro** (`rare`) | Azul `#3B82F6` | 2 | ×1.35 | 10.0 |
| 3 | **Épico** (`epic`) | Roxo `#A855F7` | 3 | ×1.60 | 4.0 |
| 4 | **Lendário** (`legendary`) | Laranja `#F59E0B` | 4 | ×1.90 | 1.6 |
| 5 | **Mítico** (`mythic`) | Vermelho `#EF4444` | 5 | ×2.25 | 0.35 |
| 6 | **Divino** (`divine`) | Ciano/arco-íris `#22D3EE` | 6 | ×2.70 | 0.05 |

> Pesos somam ~100 e são normalizados em runtime. Cada Fratura desloca a curva (tiers altos aumentam a chance de raridades altas) e a **Sorte** do jogador soma sobre os pesos das raridades ≥ Raro. Ver `06-mobs-e-drops.md`.

## Como a raridade afeta o item

1. **Número de afixos** — Comum tem só stats base; Divino tem 6 afixos (prefixos + sufixos).
2. **Multiplicador de atributos** — aplicado sobre os atributos base rolados (ver `04`).
3. **Qualidade da rolagem** — raridades altas rolam mais perto do topo da faixa (piso de rolagem sobe com a raridade).
4. **Efeitos passivos** — a partir de Épico, itens podem carregar um **passivo nomeado** (ex.: "Sede de Sangue: +5% de roubo de vida").
5. **Visual** — moldura, brilho, partículas e cor do nome seguem o neon do tier.

## Regra anti-sobreposição

Para evitar que um item de raridade menor + itemLevel maior supere um de raridade maior:

> O **piso de poder** de um item raridade *N* nunca deve cruzar o **teto de poder** da raridade *N−1* no mesmo `itemLevel`.

Isso é garantido pela combinação `multiplicador × pisoDeRolagem` por tier, validada em testes de balanceamento (ver `12-arquitetura-tecnica.md`).

## Distribuição-alvo (percepção do jogador)

Aproximadamente: **60% Comum · 24% Incomum · 10% Raro · 4% Épico · 1.6% Lendário · 0.35% Mítico · 0.05% Divino** em uma Fratura de tier baixo. Fraturas altas comprimem essa curva para cima.

## Cor como linguagem visual

A cor da raridade é usada de forma consistente em: moldura do item, nome, barra de brilho, partículas no drop, e destaque no inventário/loja. É a principal "linguagem de valor" da UI (ver `11-ui-ux-visual.md`).

## Fonte de dados

As raridades vivem em `data/rarities.json` (data-driven). Balancear pesos e multiplicadores = editar esse arquivo.
