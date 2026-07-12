# 00 — Visão Geral

## Pitch

**Aetherforge — Caçadores da Fratura** é um *action-loot RPG* de navegador. O jogador caça monstros dentro de **Fraturas** (fendas dimensionais), coleta equipamentos com **raridade** e **atributos rolados** aleatoriamente, equipa seu personagem em múltiplos slots (arma, armadura, asas...) e evolui esses itens através da **Forja Ativa** — sistema de refino que mistura sorte e habilidade.

O objetivo de longo prazo é claro e viciante: **construir o build perfeito** — o item lendário certo, com os atributos certos, refinado ao máximo (+11 e além).

## Pilares de design

| Pilar | Descrição |
|-------|-----------|
| **Loot é o coração** | Cada drop importa. Raridade, tipo, nível do item e rolagem de atributos criam variação quase infinita. |
| **Progressão tangível** | Sobe de nível, desbloqueia Fraturas mais fortes, refina itens. Todo clique tem retorno visível. |
| **Sorte + Skill** | Refino e combate têm componente de habilidade ativa, não só RNG. Diferencial autoral. |
| **Visual moderno** | UI escura, glassmorphism, neon por raridade, animações suaves. Zero pixel art. |
| **Data-driven** | Itens, mobs, raridades e Fraturas definidos em JSON. Balancear = editar dados, não código. |

## Público e plataforma

- **Plataforma:** navegador (desktop primeiro, responsivo para mobile).
- **Sessão-alvo:** 5–20 min por sessão; jogável em rajadas curtas (caçar → dropar → refinar).
- **Público:** fãs de ARPGs de loot (Diablo, Path of Exile, MU Online) que querem algo rápido e acessível no browser.

## Estilo de jogo (o "novo estilo")

Não é um puzzle. É um **hack-and-loot semi-idle** com três mecânicas autorais que o diferenciam:

1. **Forja Ativa** — refino com mini-jogo de precisão (ver `05-sistema-de-refino.md`).
2. **Ritmo de Combate** — combate por encontros com *timed strikes* (ver `10-combate.md`).
3. **Fraturas** — dungeons proceduralmente tieradas que definem o nível do loot (ver `09-fraturas-e-mundo.md`).

## Escopo de MVP vs. completo

- **MVP jogável:** geração de itens + inventário/equipamento + refino (Forja Ativa) + 1 Fratura com combate e drops. Persistência local.
- **Jogo completo:** múltiplas Fraturas, chefes, economia de recursos, meta-progressão, contas/backend, leaderboard, live-ops.

Ver `docs/ROADMAP.md` para o faseamento e `docs/FEATURES.md` para o status vivo.

## Glossário rápido

- **Forjador** — o personagem do jogador.
- **Fratura** — dungeon/rift; define o tier e o nível dos drops.
- **Refino** — evolução do item (+0 → +11); usa **Pedras de Refino**.
- **Pedra de Refino** — recurso consumível que dá chance de sucesso ao refino.
- **Selo de Proteção** — impede destruição do item em refinos de alto risco.
- **Essência** — recurso para re-rolar atributos (affixes).
- **Gear Score** — número agregado que resume o poder do equipamento atual.
