# 02 — Itens e Slots

## Slots de equipamento

O Forjador possui **9 slots** de equipamento:

| Slot | Categoria | Observações |
|------|-----------|-------------|
| Arma principal | `weapon` | Espada, Machado, Arco ou Clave (exclusivos entre si) |
| Off-hand | `offhand` | Escudo, Aljava, Tomo, Foco — depende do build |
| Elmo | `helmet` | Armadura de cabeça |
| Armadura | `chest` | Peitoral |
| Manoplas | `gloves` | Mãos |
| Botas | `boots` | Pés |
| **Asas** | `wings` | Slot das costas — item de prestígio, refino de alto valor |
| Anel | `ring` | Acessório (pode haver 1–2 slots) |
| Amuleto | `amulet` | Acessório |

## Tipos de arma e identidade

Cada tipo de arma tem **escalonamento e atributos favorecidos diferentes** — respondendo à regra de que "o tipo de item pode ter atributos melhores que os outros".

| Tipo (`weaponType`) | Estilo | Atributo favorecido | Perfil |
|---------------------|--------|---------------------|--------|
| **Espada** (`sword`) | Equilibrado | Força / Ataque | Dano médio, cadência média, versátil |
| **Machado** (`axe`) | Bruto | Força / Dano crítico | Alto dano por golpe, cadência lenta, alta variância |
| **Arco** (`bow`) | Preciso | Destreza / Chance crítica | Dano à distância, cadência rápida, escala com crítico |
| **Clave** (`mace`) | Arcano/Sagrado | Energia / Penetração | Dano mágico/verdadeiro, ignora parte da defesa |

> **Asas** não são arma, mas seguem a mesma lógica de raridade/refino e concedem atributos defensivos + bônus de movimento/velocidade e um efeito passivo por raridade.

## Anatomia de um item

Todo item é uma instância gerada a partir de uma **base** (`ItemBase`) mais rolagens:

```
Item
├─ baseId            → referência à base (ex.: "asa_arcanjo")
├─ nome              → derivado da base + afixos
├─ tipo/slot         → weapon/wings/helmet...
├─ weaponType?       → sword/axe/bow/mace (se arma)
├─ raridade          → common ... divine  (ver 03)
├─ itemLevel         → nível do item (vem do tier da Fratura)
├─ nivelRequerido    → nível mínimo do Forjador para equipar
├─ atributosBase     → stats rolados dentro de faixas (ver 04)
├─ afixos[]          → prefixos/sufixos extras conforme a raridade
├─ refino            → estado de refino (+0..+11) (ver 05)
└─ bloqueado         → flag "trancado" p/ não descartar sem querer
```

## Base de item (`ItemBase`)

A base define o "molde" de onde os itens saem. Exemplos de bases de **Asas** demonstrando progressão temática:

| baseId | Nome | Tier temático | nivelRequerido base |
|--------|------|---------------|---------------------|
| `asa_couro` | Asas de Couro | Iniciante | 5 |
| `asa_espirito` | Asas Espirituais | Intermediário | 25 |
| `asa_arcanjo` | Asas de Arcanjo | Avançado | 50 |
| `asa_seraphim` | Asas de Serafim | Endgame | 80 |

A **raridade** e o **itemLevel** modulam os números finais; a base define faixas, ícone, slot e efeito passivo.

## Nível requerido

- Cada item exige `nivelRequerido` para ser equipado.
- `nivelRequerido` = `base.nivelRequerido` ajustado pelo `itemLevel` e por afixos que aumentem poder.
- Refinar um item **não** altera o nível requerido (mantém a acessibilidade), mas aumenta seus stats.

## Ações sobre itens

- **Equipar / Desequipar** — respeita `nivelRequerido` e slot.
- **Comparar** — tooltip lado a lado com o item equipado (delta de stats).
- **Trancar (lock)** — protege de descarte/fusão em massa.
- **Fundir / Desmontar** — converte itens indesejados em recursos (pó, essências, pedras).
- **Refinar** — leva o item para a Forja (ver `05`).
- **Re-rolar afixos** — usa Essência (fase posterior).

Ver esquema de dados completo em `13-modelo-de-dados.md`.
