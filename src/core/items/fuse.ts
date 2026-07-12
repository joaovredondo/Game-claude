/**
 * Fusão de itens em recursos — ver docs/design/02 e docs/design/08
 * ("Fundir/Desmontar" → Pó de Forja). Rendimento cresce com a raridade e,
 * levemente, com o nível de refino do item. Valores são placeholder de
 * balanceamento (tunáveis).
 */
import type { RarityDef } from '../data/schema';
import type { Item } from './types';

const FUSE_YIELD_BY_RARITY_INDEX = [2, 4, 8, 16, 32, 64, 128];
const REFINE_YIELD_BONUS_PER_LEVEL = 0.15;

export interface FuseYield {
  recurso: 'po_forja';
  quantidade: number;
}

/** Quantidade de Pó de Forja obtida ao fundir/desmontar um item. */
export function computeFuseYield(item: Item, rarities: readonly RarityDef[]): FuseYield {
  const indiceRaridade = rarities.findIndex((r) => r.id === item.rarity);
  const base = FUSE_YIELD_BY_RARITY_INDEX[indiceRaridade] ?? FUSE_YIELD_BY_RARITY_INDEX[0];
  const multiplicadorRefino = 1 + item.refino.nivel * REFINE_YIELD_BONUS_PER_LEVEL;
  return { recurso: 'po_forja', quantidade: Math.round(base * multiplicadorRefino) };
}
