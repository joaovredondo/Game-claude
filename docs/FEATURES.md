# FEATURES — Tracker Vivo

> **Este é o documento vivo do projeto.** A cada implementação, atualize o status, a data e o commit da feature correspondente. Mantém a rastreabilidade entre design → roadmap → código.

**Status:** ⬜ Pendente · 🟨 Em andamento · ✅ Concluído · 🧊 Adiado

**Última atualização:** 2026-07-12 — _Fase 0 (Fundações) concluída (commit `a256686`)._

---

## Resumo por fase

| Fase | Features | Concluídas | Progresso |
|------|----------|-----------|-----------|
| 0 — Fundações | 7 | 7 | ✅ 100% |
| 1 — Núcleo de Itens | 7 | 0 | 0% |
| 2 — Inventário & Equipamento | 6 | 0 | 0% |
| 3 — Refino & Forja Ativa | 8 | 0 | 0% |
| 4 — Combate & Fraturas | 7 | 0 | 0% |
| 5 — Progressão & Economia | 6 | 0 | 0% |
| 6 — Polish Visual | 5 | 0 | 0% |
| 7 — Persistência & Meta | 5 | 0 | 0% |
| 8 — Conteúdo & Live-ops | 5 | 0 | 0% |
| **TOTAL** | **56** | **7** | **12.5%** |

---

## Detalhe das features

Colunas: **ID · Feature · Status · Doc de referência · Data · Commit**

### Fase 0 — Fundações
| ID | Feature | Status | Ref | Data | Commit |
|----|---------|--------|-----|------|--------|
| F0.1 | Scaffold Vite + React + TS | ✅ | design/12 | 2026-07-12 | a256686 |
| F0.2 | Tailwind + design tokens | ✅ | design/11 | 2026-07-12 | a256686 |
| F0.3 | Estrutura de pastas core/state/ui/data | ✅ | design/12 | 2026-07-12 | a256686 |
| F0.4 | RNG semeado + testes | ✅ | design/12 | 2026-07-12 | a256686 |
| F0.5 | Loader + validação (zod) dos JSON | ✅ | design/12,13 | 2026-07-12 | a256686 |
| F0.6 | Vitest + ESLint + Prettier | ✅ | design/12 | 2026-07-12 | a256686 |
| F0.7 | CI (lint + typecheck + testes + build) | ✅ | design/12 | 2026-07-12 | a256686 |

### Fase 1 — Núcleo de Itens
| ID | Feature | Status | Ref | Data | Commit |
|----|---------|--------|-----|------|--------|
| F1.1 | Tipos TS do modelo de dados | ⬜ | design/13 | — | — |
| F1.2 | Sorteio de raridade por peso | ⬜ | design/03,06 | — | — |
| F1.3 | Geração de item (base→itemLevel→rolagem) | ⬜ | design/02,04 | — | — |
| F1.4 | Sistema de afixos | ⬜ | design/04 | — | — |
| F1.5 | Pipeline de cálculo de stats | ⬜ | design/04 | — | — |
| F1.6 | Nome derivado (base + afixos + refino) | ⬜ | design/02 | — | — |
| F1.7 | Testes de distribuição de drop | ⬜ | design/12 | — | — |

### Fase 2 — Inventário & Equipamento
| ID | Feature | Status | Ref | Data | Commit |
|----|---------|--------|-----|------|--------|
| F2.1 | Store de inventário/equipamento | ⬜ | design/12 | — | — |
| F2.2 | Regras de equipar (slot + nível) | ⬜ | design/02 | — | — |
| F2.3 | Stats do personagem (soma equipados) | ⬜ | design/04 | — | — |
| F2.4 | Gear Score | ⬜ | design/04,13 | — | — |
| F2.5 | UI: grid + tooltip + comparação | ⬜ | design/11 | — | — |
| F2.6 | Ações: trancar/descartar/fundir/filtros | ⬜ | design/02,06 | — | — |

### Fase 3 — Refino & Forja Ativa
| ID | Feature | Status | Ref | Data | Commit |
|----|---------|--------|-----|------|--------|
| F3.1 | Config de refino data-driven | ⬜ | design/05,13 | — | — |
| F3.2 | Cálculo de chance final | ⬜ | design/05 | — | — |
| F3.3 | Resolução de refino (sucesso/-1/destrói) | ⬜ | design/05 | — | — |
| F3.4 | Selo de Proteção | ⬜ | design/05 | — | — |
| F3.5 | Bônus de stats por nível de refino | ⬜ | design/05 | — | — |
| F3.6 | Forja Ativa (mini-jogo de precisão) | ⬜ | design/05 | — | — |
| F3.7 | Modo auto-forja (acessibilidade) | ⬜ | design/05,11 | — | — |
| F3.8 | UI da Forja + log de tentativas | ⬜ | design/05,11 | — | — |

### Fase 4 — Combate & Fraturas
| ID | Feature | Status | Ref | Data | Commit |
|----|---------|--------|-----|------|--------|
| F4.1 | Máquina de estados de combate | ⬜ | design/10 | — | — |
| F4.2 | Cálculo de dano (+ timed strike) | ⬜ | design/04,10 | — | — |
| F4.3 | Mobs + loot tables data-driven | ⬜ | design/06 | — | — |
| F4.4 | Drop completo (curva por tier + Sorte) | ⬜ | design/06,09 | — | — |
| F4.5 | 1 Fratura jogável (ondas+chefe+recompensa) | ⬜ | design/09 | — | — |
| F4.6 | Ritmo de Combate (timed strikes + skills) | ⬜ | design/10 | — | — |
| F4.7 | Tela de combate (PixiJS) + reveal de loot | ⬜ | design/10,11 | — | — |

### Fase 5 — Progressão & Economia
| ID | Feature | Status | Ref | Data | Commit |
|----|---------|--------|-----|------|--------|
| F5.1 | XP e nível + curva | ⬜ | design/07 | — | — |
| F5.2 | Atributos distribuíveis + respec | ⬜ | design/07 | — | — |
| F5.3 | Recursos e sumidouros | ⬜ | design/08 | — | — |
| F5.4 | Craft de pedras + re-roll de afixos | ⬜ | design/08 | — | — |
| F5.5 | Tiers de Fratura + gates | ⬜ | design/09 | — | — |
| F5.6 | Fratura do dia | ⬜ | design/09 | — | — |

### Fase 6 — Polish Visual
| ID | Feature | Status | Ref | Data | Commit |
|----|---------|--------|-----|------|--------|
| F6.1 | Design system + Storybook | ⬜ | design/11 | — | — |
| F6.2 | Animações (Framer Motion) | ⬜ | design/11 | — | — |
| F6.3 | Momentos juicy | ⬜ | design/11 | — | — |
| F6.4 | Responsividade + acessibilidade | ⬜ | design/11 | — | — |
| F6.5 | Som e feedback | ⬜ | design/11 | — | — |

### Fase 7 — Persistência & Meta
| ID | Feature | Status | Ref | Data | Commit |
|----|---------|--------|-----|------|--------|
| F7.1 | Save + migrations (localStorage) | ⬜ | design/12 | — | — |
| F7.2 | Backend + contas | ⬜ | design/12 | — | — |
| F7.3 | Validação no servidor (anti-cheat) | ⬜ | design/12 | — | — |
| F7.4 | Leaderboard | ⬜ | design/07 | — | — |
| F7.5 | Compêndio/coleção | ⬜ | design/07 | — | — |

### Fase 8 — Conteúdo & Live-ops
| ID | Feature | Status | Ref | Data | Commit |
|----|---------|--------|-----|------|--------|
| F8.1 | Novas Fraturas/biomas/chefes | ⬜ | design/09 | — | — |
| F8.2 | Novas bases/afixos/passivos | ⬜ | design/02,04 | — | — |
| F8.3 | Eventos temporários | ⬜ | design/09 | — | — |
| F8.4 | Cap de refino estendido (+13/+15) | ⬜ | design/05 | — | — |
| F8.5 | Telemetria e balanceamento | ⬜ | design/08 | — | — |

---

## Como atualizar este arquivo

1. Ao **iniciar** uma feature: mude o status para 🟨.
2. Ao **concluir**: mude para ✅, preencha **Data** (AAAA-MM-DD) e **Commit** (hash curto).
3. Atualize a linha correspondente na tabela **Resumo por fase** e o total.
4. Atualize o campo **Última atualização** no topo.
5. Se o roadmap mudou de forma relevante, regenere o PDF: `node scripts/build-pdf.mjs`.
