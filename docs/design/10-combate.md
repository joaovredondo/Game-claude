# 10 — Combate (Ritmo de Combate)

> Não é puzzle, não é pixel-action. É um combate por **encontros**, semi-idle, com camada de habilidade via *timed strikes*.

## Visão do combate

O combate acontece em uma tela de encontro limpa e moderna (painéis + efeitos PixiJS). O Forjador enfrenta ondas de mobs de uma Fratura.

```
[ FORJADOR ]            vs            [ MOB / ONDA ]
  HP ▓▓▓▓▓░                              HP ▓▓▓▓▓▓▓▓
  Skills: [Q] [W] [E] [R]  (cooldowns)   Intenção do mob: ⚔ em 2s
  Barra de Ritmo: ─────●──── (timed strike)
```

## Fluxo de resolução

1. **Auto-ataque:** o Forjador ataca automaticamente na sua velocidade de ataque.
2. **Timed strike:** durante o auto-ataque, uma janela de timing aparece; acertar concede **dano bônus/crítico garantido**. É a camada de skill (mesma filosofia da Forja Ativa).
3. **Skills ativas:** 4 habilidades em cooldown (dano, buff, cura, controle), acionadas pelo jogador.
4. **Intenção do mob:** mobs telegrafam o próximo golpe; o jogador pode reagir (defender/skill).
5. **Fim da onda → próxima onda → chefe → recompensa.**

## Timed strike (camada de habilidade)

```
Barra de Ritmo:  ├──────[■■■]──────┤
                        ▲ acerte a zona no tempo do auto-ataque
- Perfeito → crítico garantido + dano bônus
- Bom     → dano bônus menor
- Errou   → dano normal
```

- Coerente com a Forja Ativa: **timing recompensa domínio**.
- Modo "auto-combate" desliga os timed strikes (usa média), para sessões idle/acessibilidade.

## Skills (exemplo por tipo de arma)

| Arma | Skill assinatura |
|------|------------------|
| Espada | "Investida" — dano frontal + avanço |
| Machado | "Rachadura" — alto dano, ignora parte da defesa |
| Arco | "Chuva de Flechas" — dano em área à distância |
| Clave | "Julgamento" — dano verdadeiro + cura leve |

Skills escalam com atributos e afixos do equipamento.

## Cálculo de dano (resumo)

```
dano = ataque × modificadorSkill
     × (1 + timedStrikeBonus)
     × (crítico? danoCrítico : 1)
     × (1 − reduçãoDefesaInimigo)   // penetração reduz a redução
- variância aleatória leve (±5%)
```

Ver stats e fórmulas em `04-atributos-e-stats.md`.

## Morte e falha

- Se o HP zera, a corrida na Fratura falha: **perde o progresso da corrida**, mas mantém o loot já coletado (design não-punitivo).
- Modo hardcore opcional (fase posterior): perder recursos ao morrer.

## Ritmo e duração

- Uma corrida de Fratura: ~2–5 min.
- Combate rápido o suficiente para caber no loop de sessão (ver `01`).

## Estados técnicos

Combate é uma máquina de estados determinística e semeada (para testes/replays):
```
IDLE → ENCOUNTER_START → PLAYER_TURN/AUTO → MOB_INTENT → RESOLVE → (loop) → BOSS → LOOT → END
```

Detalhes de arquitetura em `12-arquitetura-tecnica.md`.
