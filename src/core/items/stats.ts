/**
 * Pipeline de cálculo de stats de um item — ver docs/design/04.
 *
 * Rolagem de atributo base:
 *   valor = round( random(faixaMin, faixaMax)
 *                  × multiplicadorRaridade
 *                  × (1 + itemLevel × fatorNivel)
 *                  × qualidadeRolagem )
 *
 * Stats finais do item = atributosBase (já escalado pela raridade) + soma dos afixos.
 * O bônus de refino (+N) é aplicado na Fase 3, quando o refino existir de fato.
 */
import type { Rng } from '../rng';
import type { ItemBase, RarityDef } from '../data/schema';
import type { AffixRoll } from './types';

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

/** Soma os atributos base aos valores dos afixos, por stat. */
export function computeItemStats(
  atributosBase: Record<string, number>,
  afixos: readonly AffixRoll[],
): Record<string, number> {
  const total: Record<string, number> = { ...atributosBase };
  for (const afixo of afixos) {
    total[afixo.stat] = (total[afixo.stat] ?? 0) + afixo.valor;
  }
  return total;
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
