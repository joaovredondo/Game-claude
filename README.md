# AETHERFORGE — Caçadores da Fratura

> Um jogo web de **caça, loot e forja** com visual moderno. Sem pixel art: interface limpa, escura, com acentos em neon por raridade, animações suaves e ícones vetoriais/3D renderizados.

Aetherforge é um **action-loot RPG** jogado no navegador. O mundo de Aetheria se partiu em **Fraturas** — fendas dimensionais que cospem monstros. Você é um **Forjador**: caça mobs nas Fraturas, coleta equipamentos com raridade e atributos aleatórios, e usa a **Forja Ativa** (mecânica autoral que mistura sorte + habilidade) para refinar seus itens rumo ao +11 e além.

## O que torna o estilo de jogo novo

1. **Forja Ativa** — o refino não é RNG puro. Uma mini-mecânica de precisão (marcador em movimento que você trava numa "zona quente") concede bônus à chance de sucesso. Sorte + skill.
2. **Ritmo de Combate** — combate semi-idle com *timed strikes*: skills em cooldown e golpes cronometrados para dano bônus. Nada de puzzle, nada de pixel.
3. **Fraturas como mundo e como módulos** — o mundo é fragmentado em Fraturas de tiers crescentes; o próprio design do jogo também é fragmentado em módulos independentes (ver `docs/design/`).

## Estrutura do repositório

```
docs/
  design/            # Cada sistema do jogo documentado separadamente
    00-visao-geral.md
    01-loop-de-jogo.md
    02-itens-e-slots.md
    03-sistema-de-raridade.md
    04-atributos-e-stats.md
    05-sistema-de-refino.md
    06-mobs-e-drops.md
    07-progressao-e-niveis.md
    08-economia-e-recursos.md
    09-fraturas-e-mundo.md
    10-combate.md
    11-ui-ux-visual.md
    12-arquitetura-tecnica.md
    13-modelo-de-dados.md
  ROADMAP.md         # Roadmap por fases (fonte do PDF)
  FEATURES.md        # Tracker VIVO — atualizado a cada implementação
data/                # Definições data-driven (fonte da verdade)
  rarities.json
  refinement.json
  items.sample.json
src/                  # Aplicação (Fase 0+)
  core/               # regras puras, sem UI (RNG, validação de dados)
  data/               # acesso único aos dados validados
  state/              # store Zustand
  ui/combat/          # PhaserMount — seam da cena de ação
  app/                # App shell React
scripts/
  build-pdf.mjs      # Renderiza o roadmap para PDF via Chromium/Playwright
dist/
  Aetherforge-Roadmap.pdf   # PDF gerado (versionado)
build/                # saída do build web (ignorada no git)
```

## Rodar o jogo (dev)

> Fase 0 (Fundações) concluída — o app já sobe. Ver `docs/FEATURES.md`.

```bash
npm install
npm run dev        # servidor de desenvolvimento (Vite)
npm run build      # build de produção → ./build
npm run preview    # serve o build
```

Qualidade:

```bash
npm run typecheck  # tsc -b
npm run lint       # ESLint (flat config)
npm test           # Vitest
```

## Gerar o PDF do roadmap

```bash
npm run pdf        # ou: node scripts/build-pdf.mjs
# Saída: dist/Aetherforge-Roadmap.pdf
```

## Fluxo de trabalho

- **Design primeiro:** cada sistema vive em seu próprio arquivo em `docs/design/`.
- **Roadmap** define as fases de implementação (`docs/ROADMAP.md`).
- **FEATURES.md** é o tracker vivo: a cada feature implementada, o item correspondente é marcado e datado.
- O **PDF** é regenerado sempre que o roadmap muda.

## Stack recomendada (resumo)

React 18 + TypeScript + Vite + Tailwind + Zustand + Framer Motion na interface; **PixiJS** para efeitos de combate; dados 100% *data-driven* em JSON; RNG determinístico e semeado para testes. Detalhes em `docs/design/12-arquitetura-tecnica.md`.
