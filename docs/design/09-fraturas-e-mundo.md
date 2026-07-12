# 09 — Fraturas e Mundo

## Conceito

O mundo de **Aetheria** se partiu em **Fraturas** — fendas dimensionais que geram monstros e loot. As Fraturas são as "dungeons" do jogo e definem o **tier** (nível) do conteúdo e dos drops.

> Nota de design: "Fratura" é também a metáfora da arquitetura — o jogo é fragmentado em módulos independentes (ver `docs/design/`). Mundo fraturado, código fraturado.

## Anatomia de uma Fratura

```
Fratura
├─ id
├─ nome / bioma        → tema visual (Cripta, Abismo, Santuário...)
├─ tier                → 1..N (define nível dos mobs e itemLevel dos drops)
├─ nivelRecomendado    → nível do Forjador sugerido
├─ custoEntrada        → Fragmentos de Fratura (tiers altos)
├─ ondas[]             → sequência de encontros de mobs
├─ chefe               → mob boss no fim
├─ modificadores[]     → afixos de Fratura (ver abaixo)
└─ recompensas         → curva de raridade + recursos garantidos
```

## Tiers de Fratura

| Tier | Nível recomendado | Curva de raridade | Recursos |
|------|-------------------|-------------------|----------|
| 1–2 | 1–15 | favorece Comum/Incomum | pedra bruta/polida |
| 3–4 | 15–35 | Raro comum, Épico ocasional | polida/arcana |
| 5–6 | 35–55 | Épico comum, Lendário possível | arcana/estelar, selos |
| 7+ | 55+ | Lendário+, chance de Mítico/Divino | estelar, selos, fragmentos |

Subir de tier é a principal **parede de progressão**: exige gear e nível melhores.

## Modificadores de Fratura (afixos de dungeon)

Fraturas podem rolar modificadores que aumentam risco **e** recompensa:

| Modificador | Efeito | Recompensa |
|-------------|--------|------------|
| "Enxame" | +50% de mobs | +drops |
| "Blindada" | mobs +defesa | +chance de Raro+ |
| "Corrompida" | todos os mobs viram Fraturados | +raridade forte |
| "Abençoada" | +X% chance de raridade alta | — (bônus puro) |
| "Cronometrada" | tempo-limite | +recursos se cumprir |

## Fratura do dia

- Uma Fratura rotativa diária com **bônus de drop** e recompensa extra na primeira limpeza.
- Gera hábito de retorno diário.

## Geração procedural (leve)

- O **layout** (ordem/número de ondas, bioma, modificadores) é gerado a partir de um **seed** por tier.
- Os **mobs** vêm de pools por bioma/tier.
- Mantém variedade sem exigir level design manual por Fratura.

## Progressão pelo mundo

```
Tier 1  →  Tier 2  →  ...  →  Tier N
   ▲          gate: nível + gearScore + Fragmentos          ▲
   └── loop de farm em cada tier até ter gear p/ o próximo ──┘
```

## Dados

Biomas, pools de mob por tier, curvas de raridade e modificadores são data-driven (`data/`).
