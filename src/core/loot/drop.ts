/**
 * Sorteio de raridade por peso (ver docs/design/03 e docs/design/06).
 *
 * Nesta fase (Fase 1) só existe o peso base de cada raridade. Modificadores
 * de Fratura (tier) e bônus de Sorte do jogador entram na Fase 4/9 — o
 * parâmetro `modifiers` já existe para essa extensão sem quebrar a API.
 */
import type { Rng } from '../rng';
import type { RarityDef, RarityId } from '../data/schema';

export interface RarityRollModifiers {
  /** Multiplicador aplicado ao peso de cada raridade (ex.: curva de tier de Fratura). */
  multiplicador?: Partial<Record<RarityId, number>>;
  /** Peso somado ao peso base de cada raridade (ex.: bônus de Sorte, só em raridades altas). */
  bonusAditivo?: Partial<Record<RarityId, number>>;
}

/** Sorteia uma raridade a partir dos pesos de `rarities`, com modificadores opcionais. */
export function rollRarity(
  rng: Rng,
  rarities: readonly RarityDef[],
  modifiers?: RarityRollModifiers,
): RarityId {
  const entries = rarities.map((r) => {
    const mult = modifiers?.multiplicador?.[r.id] ?? 1;
    const bonus = modifiers?.bonusAditivo?.[r.id] ?? 0;
    const weight = Math.max(0, r.pesoDropBase * mult + bonus);
    return { value: r.id, weight };
  });
  return rng.weighted(entries);
}
