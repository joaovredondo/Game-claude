# 11 — UI / UX e Direção Visual

> Requisito central do projeto: **visual moderno**. Nada pixelado. Interface escura, limpa, com neon por raridade e animações suaves.

## Direção de arte

- **Estética:** *dark fantasy* moderno + toques de sci-fi arcano (as Fraturas são fendas de energia).
- **Sem pixel art.** Ícones e itens são **vetoriais / render 3D estilizado** com gradientes e brilho.
- **Glassmorphism** nos painéis (fundo translúcido, blur, bordas sutis).
- **Neon por raridade** como linguagem de valor (ver `03`).
- **Movimento:** micro-animações em tudo (hover, drop, refino), com curvas suaves (easing).

## Sistema de design (tokens)

```
Cores base:
  --bg-900: #0B0E14   (fundo)
  --bg-800: #121722
  --surface: rgba(255,255,255,0.04)  (vidro)
  --border: rgba(255,255,255,0.08)
  --text-1: #E6EDF3
  --text-2: #9AA5B1
  --accent: #22D3EE   (ciano — energia da Fratura)

Cores de raridade (neon):
  common #9AA5B1 · uncommon #3FB950 · rare #3B82F6
  epic #A855F7 · legendary #F59E0B · mythic #EF4444 · divine #22D3EE

Tipografia:
  Display: fonte geométrica/tech (ex.: "Space Grotesk", "Orbitron" p/ títulos)
  Texto:   sans legível (ex.: "Inter")

Raio: 14px (cards) · Blur do vidro: 16px · Sombra: suave, colorida por contexto
Espaçamento: escala 4/8px
```

Tokens vivem como CSS variables + config Tailwind (ver `12`).

## Telas principais

| Tela | Conteúdo |
|------|----------|
| **Hub / Base** | Personagem 3D-ish, atalhos (Fratura, Forja, Inventário), resumo de recursos |
| **Seleção de Fratura** | Cards de Fratura por tier, modificadores, recompensas, botão entrar |
| **Combate** | Painéis de HP, skills, barra de ritmo, efeitos |
| **Resultado / Loot** | Itens dropados com reveal animado por raridade |
| **Inventário** | Grid de itens, filtros, comparação, ações em massa |
| **Forja** | Item + slots de pedra/selo, chance, mini-jogo da Forja Ativa |
| **Personagem** | Atributos, stats derivados, gear score |

## Momentos "juicy" (feedback)

- **Drop de raridade alta:** flash da cor, partículas, som próprio, leve slow-motion.
- **Refino com sucesso:** shake da tela, brilho crescente, número do +N subindo.
- **Refino falho:** dessaturação breve, som grave. Destruição: efeito dramático (mas evitável com Selo).
- **Level up:** anel de energia + realce dos novos atributos.

Feedback é o que faz o loop "grudar" — prioridade de polish (ver Fase 6 no roadmap).

## Acessibilidade

- Não depender só de cor: ícones/rótulos de raridade + cor.
- Modo "auto" para Forja Ativa e timed strikes (remove exigência de timing).
- Escala de UI e contraste ajustáveis.
- Suporte a teclado e a toque (mobile).
- Respeitar `prefers-reduced-motion` (reduz animações intensas).

## Responsividade

- **Desktop-first**, mas layout responsivo: painéis viram abas/bottom-sheet no mobile.
- Grid de inventário adapta colunas ao viewport.
- Alvos de toque ≥ 44px.

## Componentes reutilizáveis (design system)

`Button`, `Panel(glass)`, `ItemCard`, `ItemTooltip`, `RarityBadge`, `ResourceChip`, `StatRow`, `ProgressBar`, `Modal`, `ForgeMeter`, `RhythmBar`. Catalogados em Storybook (fase de polish).
