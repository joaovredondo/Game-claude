# 05 — Sistema de Refino (Forja Ativa)

> O coração autoral do jogo. Evolua um item de **+0 até +11** (cap configurável). Ex.: *Asas de Arcanjo* → *Asas de Arcanjo +1* → *+2* → … → *+11*. Cada nível é mais arriscado e mais poderoso.

## 1. Recursos de refino

| Recurso | Função |
|---------|--------|
| **Pedra de Refino** | Consumível que dá a base de chance. Vem em qualidades. |
| **Selo de Proteção** | Impede **destruição** do item em falha de alto nível. |
| **Ouro** | Custo por tentativa (escala com o nível-alvo). |

### Qualidades de Pedra de Refino

| Pedra (`stoneId`) | Bônus de chance (por pedra) | Onde consegue |
|-------------------|-----------------------------|----------------|
| `pedra_bruta` | +0% (base) | Drop comum |
| `pedra_polida` | +5% | Drop / fusão |
| `pedra_arcana` | +12% | Fraturas de tier médio+ |
| `pedra_estelar` | +25% | Fraturas altas / chefes |

Você pode **empilhar até 5 pedras** por tentativa. As pedras somam seus bônus (com retorno decrescente acima de 3 pedras — ver fórmula).

## 2. Tabela de chances por nível-alvo

Chance **base** de sucesso ao tentar subir de `N` para `N+1`, e o comportamento em caso de falha:

| Nível-alvo | Chance base | Falha → resultado | Custo (ouro) | Pedras recomendadas |
|-----------|-------------|-------------------|--------------|---------------------|
| +1 | 95% | nada acontece (seguro) | 100 | 1× bruta |
| +2 | 90% | seguro | 200 | 1× bruta |
| +3 | 82% | seguro | 400 | 1× polida |
| +4 | 74% | seguro | 700 | 1× polida |
| +5 | 62% | **−1 nível** | 1.200 | 2× polida |
| +6 | 50% | −1 nível | 2.000 | 2× arcana |
| +7 | 40% | −1 nível | 3.200 | 3× arcana |
| +8 | 30% | −1 nível **ou destrói*** | 5.000 | 3× arcana + Selo |
| +9 | 22% | −1 nível **ou destrói*** | 8.000 | 4× estelar + Selo |
| +10 | 15% | −1 nível **ou destrói*** | 12.000 | 5× estelar + Selo |
| +11 | 9% | −1 nível **ou destrói*** | 18.000 | 5× estelar + Selo |

`*` **Destruição** só ocorre em +8..+11 **sem Selo de Proteção**. Com Selo, a pior falha é −1 nível (o Selo é consumido).

### Bandas de risco (resumo)

- **+1 → +4 (Seguro):** falha não reduz nível. Só perde recursos.
- **+5 → +7 (Arriscado):** falha reduz 1 nível.
- **+8 → +11 (Perigoso):** falha reduz 1 nível **ou destrói** o item (Selo evita a destruição).

## 3. Fórmula de chance final

```
chanceFinal = clamp(
    chanceBase[nívelAlvo]
  + bônusPedras
  + bônusForjaAtiva            // mini-jogo (ver §4)
  + bônusEventos,             // buffs de live-ops (opcional)
    min = 1%, max = 100%
)

bônusPedras = Σ pedras, com retorno decrescente:
  pedra_i contribui (bônusPedra_i × fator_i)
  fator = [1.0, 1.0, 0.85, 0.7, 0.55] para a 1ª..5ª pedra
```

Exemplo (+10, chance base 15%): 5× `pedra_estelar` (+25% cada, com decaimento)
≈ 15% + (25 + 25 + 21.25 + 17.5 + 13.75) = 15% + 102.5% → capado, mas antes do cap somamos a Forja Ativa negativa/positiva; na prática pedras estelares em +10 tornam o sucesso quase garantido, por isso são raríssimas e caras (design de *pity* para whales de tempo).

> Os números são **placeholders de balanceamento** e vivem em `data/refinement.json`. Ajustar = editar dados.

## 4. Forja Ativa (mecânica autoral) 🔨

O diferencial: refino **não é RNG puro**. Antes de confirmar, o jogador joga um mini-desafio de **precisão**:

```
[■■■■░░░░████░░░░■■■■]   ← barra com uma "zona quente" (████)
              ▲ marcador desliza rápido; jogador clica/aperta para travar
```

- Um marcador percorre a barra. O jogador trava no tempo certo.
- **Zona quente (perfect):** `+bônusForjaAtiva` alto (ex.: +15%).
- **Zona morna (good):** bônus médio (ex.: +6%).
- **Fora da zona (miss):** bônus 0% (ou pequena penalidade em modo hardcore).
- A **largura** da zona quente diminui conforme o nível-alvo sobe (fica mais difícil no +10/+11) e aumenta com pedras de maior qualidade (a pedra "estabiliza" a forja).

Isso cria **domínio de habilidade**: jogadores bons de timing refinam com menos recursos. É a assinatura do jogo.

> **Acessibilidade:** modo "auto-forja" desliga o mini-jogo e usa o bônus médio fixo, para quem prefere só RNG.

## 5. Bônus de stats por nível de refino

Cada +N aplica um bônus multiplicativo/aditivo sobre os stats do item:

| Nível | Bônus de stats do item | Efeito visual |
|-------|------------------------|----------------|
| +1..+4 | +3% por nível | leve brilho |
| +5..+7 | +5% por nível | aura colorida |
| +8..+9 | +7% por nível | partículas |
| +10 | +10% | efeito especial |
| +11 | +14% + **passivo de refino** | efeito épico + nome com ✦ |

No topo (+11), o item ganha um **passivo de refino** temático (ex.: *Asas de Arcanjo +11* → "Bênção Celestial: +8% de todos os atributos").

## 6. Fluxo de UI da Forja

```
[Selecionar item] → [Ver chance atual / próximo nível]
     → [Escolher pedras (1–5) e Selo?]
     → [FORJA ATIVA: mini-jogo de precisão]
     → [Resultado: sucesso ↑ / falha −1 / destruição]
     → [Feedback dramático: som, shake, partículas]
```

## 7. Regras de segurança / anti-frustração

- Confirmar consumo de recursos antes de tentar (evita clique acidental).
- Selo de Proteção destacado quando o nível é "Perigoso".
- Histórico de tentativas (log) para transparência do RNG.
- RNG **semeado e auditável** em testes (ver `12-arquitetura-tecnica.md`).

## 8. Extensões futuras

- Cap configurável acima de +11 (ex.: +13/+15) via item especial "Núcleo de Fratura".
- Transferência de refino entre itens (com perda).
- Eventos de "forja abençoada" (chance global +X% por tempo limitado).

Dados: `data/refinement.json`.
