# 06 — Mobs e Drops

## Tipos de mob

| Tipo | Descrição | Papel no loot |
|------|-----------|----------------|
| **Comum** (`trash`) | Inimigo básico em levas | Ouro, pedras, drops de baixa raridade |
| **Elite** (`elite`) | Mais forte, aparece esporádico | Chance elevada de Raro+ |
| **Chefe** (`boss`) | Fim da Fratura | Drop garantido de qualidade + recursos raros |
| **Fraturado** (`corrupted`) | Variante rara de qualquer mob (aura) | Loot muito melhor, sempre 1+ item Raro+ |

## Ficha de um mob

```
Mob
├─ id
├─ nome
├─ tipo            → trash/elite/boss/corrupted
├─ nivel           → escala com o tier da Fratura
├─ hp, ataque, defesa
├─ resistências[]  → físico/mágico/etc.
├─ skills[]        → padrões de ataque (fase de combate)
├─ lootTableId     → referência à tabela de drop
└─ xp, ouroMin/Max
```

## Tabela de drop (loot table)

Cada mob referencia uma **loot table** que define o que pode cair:

```
LootTable
├─ id
├─ garantidos[]    → drops certos (ex.: boss sempre dropa 1 item)
├─ entradas[]      → { itemPoolId, chance, quantidade }
├─ pesosRaridade   → override/curva de raridade deste mob
└─ recursos[]      → ouro, pedras, essências, fragmentos
```

## Determinação da raridade no drop

Quando um item cai, a raridade é sorteada por peso:

```
pesoEfetivo(raridade) =
    pesoBase(raridade)                       // ver 03
  × modificadorFratura(tier, raridade)       // tiers altos favorecem raridades altas
  + bônusSorte(SOR, raridade)                // só afeta raridades ≥ Raro

raridadeSorteada = weightedRandom(pesosEfetivos)
```

- **Sorte (SOR)** do jogador soma peso apenas nas raridades ≥ Raro (evita inflar Comuns).
- O **tier da Fratura** desloca a curva inteira para cima (ver `09`).
- **Mobs Fraturados/Chefes** aplicam um multiplicador extra nas raridades altas.

## Determinação do item (após a raridade)

```
1. Sorteia a raridade (acima)
2. Sorteia a base (ItemBase) do pool compatível com o slot/tier
3. Define itemLevel = f(tier da Fratura) ± variância
4. Rola atributos base + afixos (ver 04)
5. Define nivelRequerido a partir da base + itemLevel
```

## Drops garantidos de chefe

Todo chefe garante:
- **1 item** de raridade mínima escalando com o tier (ex.: tier 5 garante ≥ Épico).
- Recursos: pedras de qualidade do tier, chance de Selo de Proteção.
- **Fragmentos de Fratura** (moeda para abrir Fraturas de tier superior).

## Anti-inflação / faxina de loot

- Itens muito abaixo do gear score atual podem ser marcados para **auto-fusão** em recursos.
- Filtros de loot: mostrar só ≥ Raro, ou só do meu tipo de arma, etc.
- Descarte em massa converte itens em **pó de forja** (recurso menor).

## Dados

Mobs, loot tables e pools de itens são data-driven (`data/`), permitindo balancear drop sem tocar em código.
