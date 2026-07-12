# 13 — Modelo de Dados

Contratos TypeScript que servem de fonte da verdade. Os JSON em `data/` validam contra estes tipos no carregamento.

## Raridade

```ts
type Rarity =
  | "common" | "uncommon" | "rare" | "epic"
  | "legendary" | "mythic" | "divine";

interface RarityDef {
  id: Rarity;
  nome: string;
  cor: string;          // hex neon
  numAfixos: number;    // quantos afixos o item pode ter
  multStats: number;    // multiplicador de atributos
  pisoRolagem: number;  // qualidade mínima da rolagem [0..1]
  pesoDropBase: number; // peso na tabela de drop
}
```

## Slots e tipos

```ts
type Slot =
  | "weapon" | "offhand" | "helmet" | "chest"
  | "gloves" | "boots" | "wings" | "ring" | "amulet";

type WeaponType = "sword" | "axe" | "bow" | "mace";
```

## Base de item

```ts
interface ItemBase {
  id: string;               // "asa_arcanjo"
  nome: string;             // "Asas de Arcanjo"
  slot: Slot;
  weaponType?: WeaponType;
  icon: string;             // asset id
  nivelRequeridoBase: number;
  faixasBase: Record<string, [number, number]>; // ex.: { dano: [40,60] } ou { defesa, velocidade }
  poolAfixos: { prefixos: string[]; sufixos: string[] };
  passivoRaridade?: string; // efeito a partir de Épico
  tierTematico: number;     // agrupamento de progressão
}
```

## Afixo

```ts
interface AffixDef {
  id: string;               // "flamejante"
  nome: string;             // "Flamejante"
  tipo: "prefixo" | "sufixo";
  stat: string;             // qual stat afeta
  faixa: [number, number];  // faixa de rolagem (escala por itemLevel)
  slotsPermitidos: Slot[];
}

interface AffixRoll {
  affixId: string;
  stat: string;
  valor: number;
}
```

## Estado de refino

```ts
interface RefineState {
  nivel: number;            // 0..cap (11)
  cap: number;              // teto de refino do item
  passivoRefino?: string;   // desbloqueado no topo (+11)
}
```

## Item (instância)

```ts
interface Item {
  uid: string;              // id único da instância
  baseId: string;
  nome: string;             // base + afixos + "+N"
  icon: string;             // chave do asset de arte (ver design/14) — copiada da ItemBase
  slot: Slot;
  weaponType?: WeaponType;
  rarity: Rarity;
  itemLevel: number;
  nivelRequerido: number;
  atributosBase: Record<string, number>;
  afixos: AffixRoll[];
  refino: RefineState;
  bloqueado: boolean;
}
```

## Refino — configuração

```ts
interface RefineTierConfig {
  nivelAlvo: number;        // 1..11
  chanceBase: number;       // 0..1
  falha: "nada" | "menos1" | "menos1_ou_destroi";
  custoOuro: number;
}

interface StoneDef {
  id: string;               // "pedra_estelar"
  nome: string;
  bonusChance: number;      // ex.: 0.25
}

interface RefineConfig {
  cap: number;              // 11
  tiers: RefineTierConfig[];
  stones: StoneDef[];
  fatoresPedra: number[];   // retorno decrescente [1,1,0.85,0.7,0.55]
  forjaAtiva: {             // mini-jogo
    bonusPerfeito: number;  // ex.: 0.15
    bonusBom: number;       // ex.: 0.06
    larguraBasePerfeito: number;
  };
  bonusStatsPorNivel: Record<number, number>;
}
```

## Mob e loot

```ts
interface Mob {
  id: string;
  nome: string;
  tipo: "trash" | "elite" | "boss" | "corrupted";
  nivel: number;
  hp: number; ataque: number; defesa: number;
  resistencias: Record<string, number>;
  skills: string[];
  lootTableId: string;
  xp: number; ouroMin: number; ouroMax: number;
}

interface LootEntry { itemPoolId: string; chance: number; quantidade: [number, number]; }

interface LootTable {
  id: string;
  garantidos: LootEntry[];
  entradas: LootEntry[];
  pesosRaridadeOverride?: Partial<Record<Rarity, number>>;
  recursos: { recurso: string; chance: number; quantidade: [number, number] }[];
}
```

## Fratura

```ts
interface Fratura {
  id: string;
  nome: string;
  bioma: string;
  tier: number;
  nivelRecomendado: number;
  custoEntrada: { recurso: string; quantidade: number } | null;
  ondas: string[][];        // ids de mob por onda
  chefeId: string;
  modificadores: string[];
  curvaRaridade: Partial<Record<Rarity, number>>; // shift por tier
}
```

## Jogador e save

```ts
interface Player {
  nivel: number; xp: number;
  atributos: { FOR: number; DES: number; ENE: number; VIT: number; SOR: number };
  pontosNaoGastos: number;
  recursos: Record<string, number>; // ouro, pedras, selos, essência, fragmentos...
}

interface SaveGame {
  saveVersion: number;
  seed: number;             // RNG semeado
  player: Player;
  inventario: Item[];
  equipamento: Partial<Record<Slot, string>>; // slot -> uid
  progressoFraturas: Record<string, { maiorTierLimpo: number }>;
  criadoEm: number; atualizadoEm: number;
}
```

## Gear Score (referência)

```ts
// pesos por stat, somados sobre itens equipados (inclui refino e afixos)
const PESOS_GEARSCORE = {
  dano: 1.0, defesa: 0.8, hp: 0.1, critChance: 4, critDmg: 1, /* ... */
};
```

Estes tipos guiam a implementação da Fase 1 em diante e são validados (ex.: `zod`) ao carregar `data/`.
