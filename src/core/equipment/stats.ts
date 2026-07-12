/**
 * Agregação de stats do personagem a partir dos itens equipados — ver
 * docs/design/04 ("stat final do item → somado aos stats do personagem").
 */
import type { Item } from '../items/types';
import { computeItemStats } from '../items/stats';

/** Soma os stats finais (base + afixos) de todos os itens equipados, por stat. */
export function computeCharacterStats(
  equippedItems: readonly Item[],
): Record<string, number> {
  const total: Record<string, number> = {};
  for (const item of equippedItems) {
    const stats = computeItemStats(item.atributosBase, item.afixos);
    for (const [stat, valor] of Object.entries(stats)) {
      total[stat] = (total[stat] ?? 0) + valor;
    }
  }
  return total;
}
