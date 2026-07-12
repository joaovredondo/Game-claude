/**
 * Filtros de inventário — ver docs/design/02 ("filtros de loot").
 */
import type { RarityDef, Slot, WeaponType } from '../data/schema';
import type { Item } from './types';

export interface ItemFilterCriteria {
  slot?: Slot;
  weaponType?: WeaponType;
  /** Só itens de raridade >= este índice na lista `rarities` (ordem crescente de poder). */
  minRarityIndex?: number;
  /** Exclui itens trancados (útil antes de uma fusão/descarte em massa). */
  somenteDesbloqueados?: boolean;
}

export function filterItems(
  items: readonly Item[],
  rarities: readonly RarityDef[],
  criteria: ItemFilterCriteria,
): Item[] {
  const rarityIndex = new Map(rarities.map((r, i) => [r.id, i]));

  return items.filter((item) => {
    if (criteria.slot && item.slot !== criteria.slot) return false;
    if (criteria.weaponType && item.weaponType !== criteria.weaponType) return false;
    if (
      criteria.minRarityIndex !== undefined &&
      (rarityIndex.get(item.rarity) ?? 0) < criteria.minRarityIndex
    ) {
      return false;
    }
    if (criteria.somenteDesbloqueados && item.bloqueado) return false;
    return true;
  });
}
