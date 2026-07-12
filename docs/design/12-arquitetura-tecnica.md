# 12 — Arquitetura Técnica

## Stack recomendada

| Camada | Escolha | Porquê |
|--------|---------|--------|
| Build/Dev | **Vite** | HMR rápido, moderno |
| Linguagem | **TypeScript** | Tipagem forte para itens/stats/RNG |
| UI | **React 18** | Ecossistema, componentização da UI pesada em painéis |
| Estilo | **Tailwind CSS** + CSS vars | Design tokens (ver `11`), rápido e consistente |
| Estado | **Zustand** | Store simples e performática (inventário, jogador, RNG) |
| Animação | **Framer Motion** | Micro-animações e reveals "juicy" |
| Efeitos de combate | **PixiJS** | Partículas/efeitos WebGL sobre a UI |
| Testes | **Vitest** + Testing Library | Unit de regras (RNG, refino, drop) e componentes |
| Persistência (MVP) | **localStorage** (via camada de save) | Zero backend para o MVP |
| Persistência (full) | **Node (Fastify) + Postgres + Prisma** | Contas, leaderboard, anti-cheat |

> Alternativa considerada: **Phaser 4** para o combate. Decisão: como a UI é dominada por painéis (inventário/forja), React+Tailwind lidera e **PixiJS** cobre efeitos. Phaser fica como opção se o combate evoluir para ação em cena.

## Princípios de arquitetura

1. **Data-driven total.** Itens, raridades, refino, mobs, Fraturas vivem em JSON (`data/`). Regras leem dados; balancear ≠ recompilar.
2. **Núcleo de regras puro e sem UI.** Um pacote `core/` (TS puro) com toda a lógica: geração de item, cálculo de stats, RNG de drop, matemática do refino, resolução de combate. Testável sem DOM.
3. **RNG determinístico e semeado.** Um gerador semeado (ex.: mulberry32) injetado em todas as regras → testes reproduzíveis, replays, e futura auditoria anti-cheat.
4. **UI é uma projeção do estado.** React renderiza o estado da store; a store chama o `core/`. Sem lógica de jogo dentro de componentes.
5. **Separação em módulos ("fraturas").** Cada sistema do design vira um módulo isolado.

## Estrutura de pastas (proposta)

```
src/
  core/                 # regras puras, sem React (100% testável)
    rng.ts              # RNG semeado
    items/
      generate.ts       # geração de item (raridade → base → rolagem)
      affixes.ts
      stats.ts          # pipeline de cálculo de stats
    refine/
      refine.ts         # chance final, resultado, bônus de forja
    loot/
      drop.ts           # sorteio de raridade + item por loot table
    combat/
      engine.ts         # máquina de estados de combate
    progression/
      level.ts
  data/                 # (ou raiz /data) JSON data-driven
  state/                # stores Zustand
  ui/                   # componentes React + design system
    components/
    screens/
    forge/              # Forja Ativa (mini-jogo)
    combat/             # tela de combate + PixiJS
  app/                  # bootstrap, roteamento
  save/                 # serialização/localStorage (+ migrations)
tests/                  # Vitest
```

## Contratos de dados

Todos os esquemas em `13-modelo-de-dados.md` como interfaces TypeScript. Os JSON de `data/` validam contra eles (ex.: com `zod`) no load, falhando cedo se um dado estiver malformado.

## Save / migrations

- Save serializa: jogador, inventário, equipamento, recursos, progresso de Fratura, seed.
- Versionar o save (`saveVersion`) + migrations para evoluir o schema sem quebrar saves antigos.
- MVP: localStorage. Full: sincroniza com backend.

## Qualidade

- **Testes de regra** obrigatórios para: matemática do refino, sorteio de raridade (distribuição estatística), pipeline de stats, cálculo de dano.
- **Testes de distribuição:** rodar 100k drops semeados e verificar que a curva de raridade bate com o esperado (±tolerância).
- **Lint/format:** ESLint + Prettier.
- **CI:** rodar lint + testes no push (ver Fase 0 do roadmap).

## Performance

- Inventários grandes: virtualização de listas.
- PixiJS só na tela de combate (lazy-load).
- Memoização de cálculos de stat por item (invalidar em refino/afixo).

## Anti-cheat (fase full, com backend)

- Regras executadas/validadas no servidor para ações com recompensa (drop, refino).
- RNG semeado no servidor; cliente não decide resultados de valor.
- Cliente prevê para responsividade; servidor é a verdade.
