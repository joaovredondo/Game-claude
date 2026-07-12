/**
 * Gear Score — número único que resume o poder do equipamento (ver
 * docs/design/04 e docs/design/13). Pesos por stat são tuning e podem ser
 * ajustados livremente; qualquer stat sem peso explícito usa o fallback.
 */
import type { RefinementConfig } from '../data/schema';
import type { Item } from './types';
import { resolveItemStats } from './stats';

export const DEFAULT_GEAR_SCORE_WEIGHTS: Readonly<Record<string, number>> = {
  dano: 2.5,
  defesa: 1.2,
  velocidade: 3,
  danoFogo: 2,
  critChance: 6,
  hpPct: 4,
  DES: 1.5,
  rouboVida: 5,
};

const FALLBACK_WEIGHT = 1;

/** Gear Score de um único item, a partir dos seus stats finais (base + afixos). */
export function computeItemGearScore(
  stats: Readonly<Record<string, number>>,
  weights: Readonly<Record<string, number>> = DEFAULT_GEAR_SCORE_WEIGHTS,
): number {
  let score = 0;
  for (const [stat, valor] of Object.entries(stats)) {
    score += valor * (weights[stat] ?? FALLBACK_WEIGHT);
  }
  return Math.round(score);
}

/** Gear Score agregado de uma lista de itens equipados (considera o refino, se fornecido). */
export function computeTotalGearScore(
  items: readonly Item[],
  weights: Readonly<Record<string, number>> = DEFAULT_GEAR_SCORE_WEIGHTS,
  refinement?: RefinementConfig,
): number {
  return items.reduce((total, item) => {
    const stats = resolveItemStats(item, refinement);
    return total + computeItemGearScore(stats, weights);
  }, 0);
}
