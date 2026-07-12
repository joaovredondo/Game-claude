# 14 — Arte de Itens

> Como cada item ganha uma imagem própria (não só nome), e o que fazer quando ela ainda não existe.

## Decisão

O usuário escolheu **arte ilustrada única por item-base** (não ícone vetorial genérico por tipo). Uma imagem por `ItemBase` — não por raridade, não por instância rolada. Isso é consistente com `03-sistema-de-raridade.md`: a raridade se expressa pela **moldura/glow** ao redor da arte (aplicada em CSS pelo componente), não pela arte em si. Uma "Espada de Ferro" Comum e uma "Afiada Espada de Ferro do Titã" Raro usam a mesma imagem, só a moldura muda.

## Como funciona hoje (código já pronto, sem depender de nenhuma imagem existir)

```
ItemBase.icon  (ex.: "sword_iron")
      │
      ├─ copiado para Item.icon na geração (core/items/generate.ts)
      │
      ▼
<ItemArt icon="sword_iron" slot="weapon" weaponType="sword" rarity="epic" />
      │
      ├─ tenta carregar  /items/sword_iron.png
      │     ├─ existe   → mostra a arte, moldura colorida pela raridade
      │     └─ não existe → nunca mostra o <img> quebrado; fica só o
      │                      ícone vetorial de fallback (mesma moldura)
      │
      └─ ids que falharam ficam em cache (memória) pra não tentar de novo
         na mesma sessão
```

**Ou seja: o jogo já funciona hoje, mostrando ícones vetoriais simples (espada, machado, arco, clave, asas, elmo...) coloridos pela raridade. Quando uma arte real for gerada e salva no lugar certo, ela aparece automaticamente — nenhuma mudança de código é necessária.**

## Onde colocar uma imagem gerada

```
public/items/{icon}.png
```

`{icon}` é o valor do campo `icon` do `ItemBase` em `data/items.sample.json` (ex.: `wings_leather`, `sword_iron`). Formato: **PNG**, 1024×1024 (ou próximo disso — o componente usa `object-cover` num container quadrado, então qualquer proporção próxima de 1:1 funciona). PNG e não WebP por enquanto: é o que geradores de imagem exportam direto, sem precisar de um passo de conversão. Se o catálogo de itens crescer muito (dezenas+), uma conversão em lote pra WebP é uma otimização futura razoável — não bloqueia nada hoje.

## Template de estilo (usar em toda imagem, pra manter consistência visual)

```
Ícone de item de RPG de fantasia sombria moderna, pintura digital
semi-realista de alta qualidade (não pixel art, não ícone flat vetorial
simples). Item centralizado ocupando cerca de 80% do quadro, composição
quadrada 1:1. Fundo escuro em tons de ardósia e roxo profundo, com leve
névoa e um brilho sutil de energia arcana ciano ao redor do item
(referência: as "Fraturas" do jogo emitem uma energia ciano). Iluminação
de estúdio dramática vindo de cima e da lateral, alta definição de
textura de material (metal, couro, pena, cristal, conforme o item). Sem
texto, sem marca d'água, sem moldura desenhada (a moldura é aplicada
depois via CSS). Resolução 1024x1024.
```

Cada item soma a esse template uma descrição específica (o que é o objeto). Os prompts finais (template + descrição, prontos pra copiar) estão em [`art-prompts.json`](./art-prompts.json) — um registro por `ItemBase`, com `iconId`, `itemBaseId`, `nome`, `descricaoEspecifica` e `promptFinal`.

> `iconId` e `itemBaseId` são campos separados de propósito, mesmo hoje sendo 1:1: permite reaproveitar uma mesma arte em mais de uma base no futuro (ex.: uma variante temática de espada que usa a arte de `sword_iron` pra economizar orçamento de arte), sem precisar remodelar o registro.

## Por que este arquivo fica em `docs/design/`, não em `data/`

Tudo em `data/` (`rarities.json`, `refinement.json`, `items.sample.json`) é lido em runtime pelo jogo e validado contra um schema Zod (`src/data/index.ts`, `core/data/load.ts`) — se o JSON estiver malformado, o app não sobe. `art-prompts.json` é o oposto: é **conteúdo de autoria**, lido por um humano (ou uma ferramenta de geração de imagem) fora do runtime do jogo. Colocá-lo em `data/` sem integrá-lo ao pipeline de validação criaria um arquivo "órfão" que quebra essa convenção implícita — por isso ele mora aqui, ao lado desta doc.

## Workflow de geração (hoje manual; integração futura)

1. Abra `art-prompts.json`, copie o `promptFinal` do item desejado.
2. Gere a imagem numa ferramenta de geração de imagem (ex.: Gemini "Nano Banana", ou outra à escolha).
3. Salve o resultado como `public/items/{iconId}.png`.
4. Pronto — nenhuma mudança de código necessária, o `ItemArt` já vai carregar a imagem no próximo load.

**Automação futura (não implementada ainda):** um script que lê `art-prompts.json`, verifica quais `iconId` ainda não têm arquivo em `public/items/`, chama uma API de geração de imagem para cada um faltante, e salva o resultado. Fica pendente até haver uma ferramenta/API de geração de imagem disponível no ambiente de execução.

## Quando adicionar uma nova `ItemBase` (Fase 8 e além)

Toda nova base de item precisa de uma entrada nova em `art-prompts.json` (mesmo template + nova descrição específica) — sem isso, ela funciona normalmente (cai no ícone vetorial de fallback por slot/tipo de arma), só não tem arte própria ainda.
