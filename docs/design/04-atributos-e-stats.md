# 04 — Atributos e Stats

## Atributos primários (do personagem)

| Atributo | Sigla | Efeito principal |
|----------|-------|------------------|
| **Força** | FOR | Dano físico (Espada/Machado), vida extra |
| **Destreza** | DES | Dano à distância (Arco), chance de crítico, evasão |
| **Energia** | ENE | Dano mágico/verdadeiro (Clave), mana |
| **Vitalidade** | VIT | Vida máxima, resistência |
| **Sorte** | SOR | Chance de raridade alta no drop, chance crítica marginal |

Cada nível do Forjador concede pontos de atributo distribuíveis (ver `07-progressao-e-niveis.md`).

## Stats derivados (combate)

| Stat | Fórmula-base (exemplo) |
|------|------------------------|
| Ataque | `arma.dano × (1 + FOR/200)` (ou DES/ENE conforme o tipo) |
| Vida (HP) | `100 + VIT×12 + FOR×2` |
| Defesa | `soma(defesa dos equipamentos)` |
| Chance Crítica | `5% + DES×0.05% + afixos` |
| Dano Crítico | `150% + afixos` |
| Velocidade de Ataque | base do tipo de arma × afixos |
| Penetração | reduz % da defesa inimiga (favorecido pela Clave) |
| Roubo de Vida | % do dano convertido em cura (afixo/passivo) |

## Atributos nos itens

Um item carrega dois grupos:

1. **Atributos base** — definidos pela `ItemBase` e pelo `slot`. Ex.: uma arma tem `dano`; uma armadura tem `defesa`; asas têm `defesa` + `velocidade`.
2. **Afixos** — bônus adicionais rolados conforme a raridade (ver `03`).

### Rolagem de atributo base

```
valor = round( random(faixaMin, faixaMax)
               × multiplicadorRaridade
               × (1 + itemLevel × fatorNivel)
               × qualidadeRolagem )
```

- `faixaMin/faixaMax` vêm da base do item.
- `multiplicadorRaridade` da tabela de raridade (ver `03`).
- `qualidadeRolagem` ∈ [pisoRaridade, 1.0] — raridades altas têm piso mais alto (rolam melhor).

## Afixos (prefixos e sufixos)

Afixos são modificadores nomeados sorteados de pools por slot e faixa de itemLevel.

| Exemplo de afixo | Tipo | Efeito |
|------------------|------|--------|
| "Flamejante" | prefixo | +X dano de fogo |
| "do Titã" | sufixo | +X% Vida |
| "Afiado" | prefixo | +X% Chance Crítica |
| "da Águia" | sufixo | +X Destreza |
| "Impenetrável" | prefixo | +X Defesa |
| "do Vampiro" | sufixo | +X% Roubo de Vida |

Regras:
- Cada afixo tem sua própria **faixa de rolagem**, também escalada por itemLevel.
- Não há afixos duplicados no mesmo item.
- Prefixos e sufixos têm pools separados; a raridade define quantos de cada.
- **Re-rolar afixos** consome **Essência** e sorteia novos valores/afixos (fase posterior).

## Bônus de refino sobre stats

O refino (+N) aplica um bônus **por cima** dos atributos + afixos. Ver a tabela de bônus por nível em `05-sistema-de-refino.md`.

## Ordem de cálculo (pipeline de stats do item)

```
1. Atributo base rolado
2. × multiplicador de raridade
3. + afixos
4. + bônus de refino (+N)
= stat final do item
→ somado aos stats do personagem no cálculo de combate
```

## Gear Score

Número único que resume o poder do equipamento:

```
gearScore = Σ ( statPonderado(item) ) por slot equipado
```

Usado para: matchmaking de Fratura recomendada, ordenação de inventário e comparação rápida. Detalhe dos pesos em `13-modelo-de-dados.md`.
