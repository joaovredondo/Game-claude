# Arte de itens

Coloque aqui a arte ilustrada de cada item, nomeada `{icon}.png` — onde `{icon}`
é o valor do campo `icon` do `ItemBase` correspondente em `data/items.sample.json`
(ex.: `sword_iron.png`, `wings_archangel.png`).

Nenhuma mudança de código é necessária: o componente `ItemArt`
(`src/ui/components/ItemArt.tsx`) já busca `/items/{icon}.png` automaticamente
e cai num ícone vetorial de fallback enquanto o arquivo não existir.

Prompts prontos para gerar cada imagem: ver `docs/design/art-prompts.json` e
o guia de estilo em `docs/design/14-arte-de-itens.md`.
