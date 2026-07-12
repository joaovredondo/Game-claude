# 07 — Progressão e Níveis

## Nível do Forjador

- Ganha **XP** matando mobs e completando Fraturas.
- Cada nível concede:
  - **Pontos de atributo** distribuíveis (FOR/DES/ENE/VIT/SOR).
  - Aumento de stats base (HP, etc.).
  - Desbloqueio de Fraturas de tier superior e de itens de `nivelRequerido` maior.

### Curva de XP (exemplo)

```
xpParaProximo(nivel) = round( 50 × nivel^1.6 )
```

Progressão rápida no início (dopamina), desacelerando no endgame. Nível máximo inicial: **60** (expansível).

## Três eixos de poder

O poder do jogador cresce por **três eixos independentes** — isso mantém sempre algo a fazer:

| Eixo | Como sobe | Teto |
|------|-----------|------|
| **Nível do personagem** | XP de combate | Nível máx. (ex.: 60) |
| **Qualidade do equipamento** | Loot melhor de Fraturas altas | Divino / itemLevel máx. |
| **Refino** | Forja Ativa (+0..+11) | +11 por item |

Gear Score (ver `04`) agrega os eixos 2 e 3 num número único.

## Desbloqueios por marco

| Marco | Desbloqueia |
|-------|-------------|
| Nível 5 | Slot de Asas + primeira Fratura tier 2 |
| Nível 10 | Forja Ativa (refino) |
| Nível 20 | Re-roll de afixos (Essência) |
| Nível 30 | Fraturas Fraturadas (corrupted) |
| Nível 40 | Segundo slot de Anel |
| Nível 50 | Fraturas endgame / itens `asa_seraphim` |

## Atributos distribuíveis

- Cada nível concede **5 pontos**.
- Respec disponível por custo de ouro/recurso (permite experimentar builds).
- Builds emergem da sinergia entre tipo de arma (ver `02`) e atributos (ver `04`).

## Meta-progressão (endgame)

Quando o nível estabiliza, a progressão migra para:
- **Escalar tiers de Fratura** (dificuldade infinita escalonada).
- **Perseguir o build perfeito** (item + afixos + refino ideais).
- **Ranking / leaderboard** por gear score ou maior tier limpo (fase posterior).
- **Coleção / compêndio** de itens e raridades descobertos.

## Balanceamento da progressão

- Tempo-alvo para o **primeiro Épico**: ~30–45 min de jogo.
- Tempo-alvo para o **primeiro +7**: ~2–3 h.
- Endgame (+10/+11, Divino) é maratona intencional de dezenas de horas.
- Todos os números vivem em dados/config para tuning sem recompilar.
