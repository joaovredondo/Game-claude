/**
 * Pipeline de cálculo de stats de um item — ver docs/design/04.
 *
 * Rolagem de atributo base:
 *   valor = round( random(faixaMin, faixaMax)
 *                  × multiplicadorRaridade
 *                  × (1 + itemLevel × fatorNivel)
 *                  × qualidadeRolagem )
 *
 * Stats finais do item = (atributosBase + soma dos afixos) × (1 + bônus de refino).
 */
import type { Rng } from '../rng';
import type { ItemBase, RarityDef } from '../data/schema';
import type { RefinementConfig } from '../data/schema';
import type { AffixRoll, Item } from './types';

/** Escala de crescimento de atributo base por itemLevel. Placeholder de balanceamento. */
export const ITEM_LEVEL_STAT_FACTOR = 0.02;

/** Rola os atributos base de um item a partir das faixas da sua `ItemBase`. */
export function rollBaseAttributes(
  rng: Rng,
  base: ItemBase,
  rarity: RarityDef,
  itemLevel: number,
): Record<string, number> {
  const atributos: Record<string, number> = {};
  const escalaNivel = 1 + itemLevel * ITEM_LEVEL_STAT_FACTOR;

  for (const [stat, [min, max]] of Object.entries(base.faixasBase)) {
    const bruto = rng.float(min, max);
    const qualidade = rng.float(rarity.pisoRolagem, 1);
    atributos[stat] = Math.round(bruto * rarity.multStats * escalaNivel * qualidade);
  }
  return atributos;
}

/**
 * Soma os atributos base aos valores dos afixos, por stat, e aplica por
 * cima o bônus percentual de refino (0 por padrão — ver docs/design/04 §
 * "Bônus de refino sobre stats" e docs/design/05 §5).
 */
export function computeItemStats(
  atributosBase: Record<string, number>,
  afixos: readonly AffixRoll[],
  refinoBonusPct = 0,
): Record<string, number> {
  const total: Record<string, number> = { ...atributosBase };
  for (const afixo of afixos) {
    total[afixo.stat] = (total[afixo.stat] ?? 0) + afixo.valor;
  }
  if (refinoBonusPct > 0) {
    for (const stat of Object.keys(total)) {
      total[stat] = Math.round(total[stat] * (1 + refinoBonusPct));
    }
  }
  return total;
}

/** Bônus percentual de stats concedido pelo nível de refino atual (0 se não configurado). */
export function getRefineStatBonus(refinoNivel: number, refinement: RefinementConfig): number {
  return refinement.bonusStatsPorNivel[String(refinoNivel)] ?? 0;
}

/**
 * Stats finais de um item, já considerando o refino, quando a config de
 * refino é fornecida. Ponto único usado pela UI e por `equipment/stats.ts`
 * e `items/gearScore.ts` para não duplicar a busca do bônus por nível.
 */
export function resolveItemStats(
  item: Item,
  refinement?: RefinementConfig,
): Record<string, number> {
  const bonusPct = refinement ? getRefineStatBonus(item.refino.nivel, refinement) : 0;
  return computeItemStats(item.atributosBase, item.afixos, bonusPct);
}

/**
 * Nível requerido do item, derivado da base e do itemLevel (MVP; ver
 * docs/design/02). Ajuste fino por afixos de poder fica para uma fase
 * futura, quando houver afixos que efetivamente elevem o poder do item
 * além do que a raridade/itemLevel já cobrem.
 */
export function computeNivelRequerido(base: ItemBase, itemLevel: number): number {
  return Math.max(base.nivelRequeridoBase, Math.round(itemLevel));
}
