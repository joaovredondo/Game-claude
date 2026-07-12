# 08 — Economia e Recursos

## Recursos do jogo

| Recurso | Fonte principal | Sumidouro (gasto em) |
|---------|-----------------|----------------------|
| **Ouro** | Mobs, venda de itens | Refino, respec, loja |
| **Pedra de Refino** (4 qualidades) | Drops, fusão de itens | Forja Ativa (refino) |
| **Selo de Proteção** | Chefes, loja | Proteger refino perigoso (+8..+11) |
| **Essência** | Fusão de itens raros, chefes | Re-rolar afixos |
| **Fragmento de Fratura** | Chefes, Fratura do dia | Abrir Fraturas de tier alto |
| **Pó de Forja** | Descarte em massa | Craft menor, upgrade de pedras |

## Fontes e sumidouros (economia fechada)

O design segue a regra de **economia fechada**: toda fonte tem um sumidouro correspondente para evitar inflação.

```
Fonte  ──────────────►  Sumidouro
Ouro (mobs)            → refino (custo por tentativa cresce exponencial)
Itens ruins            → fusão → pedras/essência (reduz clutter, gera insumo)
Pedras                 → refino (consumo alto no endgame)
Fragmentos             → abrir Fraturas altas (gate de progressão)
```

## Loja (fase posterior)

- **Loja de recursos:** troca ouro/pó por pedras básicas, selos.
- **Mercador rotativo:** ofertas diárias (itens de raridade fixa, pedras de qualidade).
- **Sem pay-to-win no MVP.** Se houver monetização futura, cosmético/conveniência (ver live-ops).

## Craft / upgrade de pedras

- **Fundir** N pedras de qualidade inferior → 1 de qualidade superior (ex.: 5× bruta → 1× polida).
- Usa **Pó de Forja** como catalisador.
- Cria um sumidouro para o excesso de pedras básicas.

## Curva de custo do refino

O custo em ouro por tentativa cresce ~exponencialmente com o nível-alvo (ver tabela em `05`). Isso:
- Torna o ouro sempre útil (não "estoura o teto").
- Faz falhas de alto nível doerem (tensão dramática).
- Equilibra jogadores ricos em tempo vs. sortudos.

## Telemetria econômica (para balancear)

Métricas a instrumentar quando houver backend:
- Ouro médio por hora (fonte) vs. gasto médio (sumidouro).
- Distribuição de níveis de refino da base de jogadores.
- Taxa de destruição de itens no endgame.
- Estoque médio de cada pedra por jogador.

Todos os valores econômicos são data-driven para ajuste rápido.
