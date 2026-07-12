/**
 * Agregação de stats do personagem a partir dos itens equipados — ver
 * docs/design/04 ("stat final do item → somado aos stats do personagem").
 */
import type { RefinementConfig } from '../data/schema';
import type { Item } from '../items/types';
import { resolveItemStats } from '../items/stats';

/** Soma os stats finais (base + afixos + refino) de todos os itens equipados, por stat. */
export function computeCharacterStats(
  equippedItems: readonly Item[],
  refinement?: RefinementConfig,
): Record<string, number> {
  const total: Record<string, number> = {};
  for (const item of equippedItems) {
    const stats = resolveItemStats(item, refinement);
    for (const [stat, valor] of Object.entries(stats)) {
      total[stat] = (total[stat] ?? 0) + valor;
    }
  }
  return total;
}
