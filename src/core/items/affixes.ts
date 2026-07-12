/**
 * Sorteio de afixos (prefixos/sufixos) de um item — ver docs/design/04.
 */
import type { Rng } from '../rng';
import type { AffixDef, ItemBase } from '../data/schema';
import type { AffixRoll } from './types';

/** Escala de crescimento de faixa de afixo por itemLevel. Placeholder de balanceamento. */
const ITEM_LEVEL_AFFIX_FACTOR = 0.02;

function shuffled<T>(rng: Rng, arr: readonly T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = rng.int(0, i);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function rollAffixValue(rng: Rng, def: AffixDef, itemLevel: number, pisoRolagem: number): number {
  const [min, max] = def.faixa;
  const base = rng.float(min, max);
  const qualidade = rng.float(pisoRolagem, 1);
  const escalaNivel = 1 + itemLevel * ITEM_LEVEL_AFFIX_FACTOR;
  return Math.round(base * escalaNivel * qualidade);
}

/**
 * Sorteia até `numAfixos` afixos para o item, divididos entre prefixos e
 * sufixos (metade/metade, arredondando prefixos para cima). Sem repetição.
 *
 * Se o pool da base (`base.poolAfixos`) não tiver afixos suficientes para o
 * número nominal da raridade, o item recebe menos afixos do que o nominal —
 * comportamento esperado para bases com poucos afixos cadastrados.
 */
export function pickAffixes(
  rng: Rng,
  base: ItemBase,
  afixDefsById: ReadonlyMap<string, AffixDef>,
  numAfixos: number,
  itemLevel: number,
  pisoRolagem: number,
): AffixRoll[] {
  if (numAfixos <= 0) return [];

  const desiredPrefixos = Math.ceil(numAfixos / 2);
  const desiredSufixos = Math.floor(numAfixos / 2);

  const prefixIds = shuffled(rng, base.poolAfixos.prefixos).slice(0, desiredPrefixos);
  const sufixoIds = shuffled(rng, base.poolAfixos.sufixos).slice(0, desiredSufixos);

  const rolls: AffixRoll[] = [];
  for (const id of [...prefixIds, ...sufixoIds]) {
    const def = afixDefsById.get(id);
    if (!def) continue; // id referenciado no pool mas ausente na lista de afixos — ignora
    rolls.push({
      affixId: def.id,
      tipo: def.tipo,
      stat: def.stat,
      valor: rollAffixValue(rng, def, itemLevel, pisoRolagem),
    });
  }
  return rolls;
}
