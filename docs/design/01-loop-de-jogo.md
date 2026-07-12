# 01 — Loop de Jogo

## Loop central (core loop)

```
        ┌────────────────────────────────────────────────┐
        │                                                 │
        ▼                                                 │
  1. ENTRAR NA FRATURA  ──►  2. COMBATE (Ritmo)  ──►  3. DROP DE LOOT
        ▲                                                 │
        │                                                 ▼
  6. VOLTAR / SUBIR TIER ◄── 5. FORJA (Refino Ativo) ◄── 4. INVENTÁRIO / EQUIPAR
```

1. **Entrar na Fratura** — escolhe uma Fratura de um tier compatível com seu nível. Gasta Fragmentos de Fratura para tiers altos.
2. **Combate** — encontros sequenciais de mobs; usa skills e *timed strikes* (ver `10-combate.md`).
3. **Drop de loot** — mobs dropam itens (raridade + atributos rolados), ouro, pedras e recursos.
4. **Inventário / Equipar** — compara, equipa, descarta/funde itens ruins em recursos.
5. **Forja (Refino Ativo)** — usa Pedras de Refino + mini-jogo de precisão para evoluir itens.
6. **Voltar / Subir tier** — com gear melhor, encara Fraturas mais fortes → loot melhor. Repete.

## Loops secundários

- **Loop de sessão (5–20 min):** algumas corridas em Fraturas + uma leva de refinos.
- **Loop diário:** Fratura do dia (bônus de drop), missões diárias, reset de energia (opcional).
- **Loop de meta (semanas):** montar o build perfeito, subir gear score, escalar Fraturas de tier alto, leaderboard.

## Motivadores de retenção

| Gatilho | Mecânica |
|---------|----------|
| **Antecipação** | Abrir uma Fratura / dropar de um chefe — "e se cair um lendário?" |
| **Quase lá** | Refino que quase deu certo → tentar de novo. A Forja Ativa dá agência. |
| **Colecionismo** | Compêndio de itens/raridades descobertas. |
| **Domínio** | Melhorar o timing da Forja Ativa e dos *timed strikes* de combate. |
| **Escalada** | Cada tier de Fratura é uma parede a vencer. |

## Estados do jogador (fluxo de telas)

```
[Base / Hub]
   ├─► [Seleção de Fratura] ─► [Combate] ─► [Resultado / Loot]
   ├─► [Inventário / Equipamento]
   ├─► [Forja] ─► [Refino Ativo]
   ├─► [Personagem / Atributos]
   └─► [Loja / Recursos]  (fase posterior)
```

## Regra de ouro do loop

Todo o loop deve dar **feedback de progresso a cada 30–60s**: um drop, um refino, XP, ouro ou desbloqueio. Se o jogador ficar mais de um minuto sem recompensa visível, o ritmo quebrou.
