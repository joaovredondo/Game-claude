/**
 * Geração de item — ver docs/design/02 e docs/design/04.
 *
 * Pipeline: raridade (se não fornecida) → atributos base rolados → afixos →
 * nível requerido → nome derivado.
 */
import type { Rng } from '../rng';
import type { AffixDef, ItemBase, RarityDef, RarityId } from '../data/schema';
import { rollRarity, type RarityRollModifiers } from '../loot/drop';
import { pickAffixes } from './affixes';
import { computeNivelRequerido, rollBaseAttributes } from './stats';
import type { AffixRoll, Item } from './types';

export interface GenerateItemInput {
  base: ItemBase;
  itemLevel: number;
  rarities: readonly RarityDef[];
  afixDefs: readonly AffixDef[];
  /** Cap de refino do item (data-driven; ver data/refinement.json → cap). */
  refineCap: number;
  /** Raridade fixa (pula o sorteio) — útil para testes e para chefes/garantidos. */
  rarityOverride?: RarityId;
  /** Modificadores do sorteio de raridade (curva de Fratura, Sorte). */
  rarityModifiers?: RarityRollModifiers;
}

/**
 * Substitui o sufixo "+N" de um nome de item já formatado (ou o adiciona,
 * se ainda não houver). Usado tanto na geração quanto após um refino (Fase
 * 3), sem precisar re-derivar o nome a partir da base/afixos.
 */
export function withRefineSuffix(nome: string, refinoNivel: number): string {
  const semSufixo = nome.replace(/\s*\+\d+$/, '');
  return refinoNivel > 0 ? `${semSufixo} +${refinoNivel}` : semSufixo;
}

/**
 * Monta o nome de exibição: `[Prefixo] Nome [Sufixo] [+N]`, usando o
 * primeiro prefixo/sufixo rolado (convenção comum em ARPGs — o tooltip
 * lista todos os afixos separadamente).
 */
export function formatItemName(
  base: ItemBase,
  afixos: readonly AffixRoll[],
  afixDefsById: ReadonlyMap<string, AffixDef>,
  refinoNivel: number,
): string {
  const prefixo = afixos.find((a) => a.tipo === 'prefixo');
  const sufixo = afixos.find((a) => a.tipo === 'sufixo');

  const partes: string[] = [];
  if (prefixo) partes.push(afixDefsById.get(prefixo.affixId)?.nome ?? prefixo.affixId);
  partes.push(base.nome);
  if (sufixo) partes.push(afixDefsById.get(sufixo.affixId)?.nome ?? sufixo.affixId);

  return withRefineSuffix(partes.join(' '), refinoNivel);
}

/** Gera um item completo a partir de uma base, um itemLevel e as tabelas de raridade/afixos. */
export function generateItem(rng: Rng, input: GenerateItemInput): Item {
  const { base, itemLevel, rarities, afixDefs, refineCap, rarityOverride, rarityModifiers } =
    input;

  const rarityId = rarityOverride ?? rollRarity(rng, rarities, rarityModifiers);
  const rarity = rarities.find((r) => r.id === rarityId);
  if (!rarity) throw new Error(`generateItem: raridade "${rarityId}" não encontrada`);

  const afixDefsById = new Map(afixDefs.map((a) => [a.id, a]));
  const atributosBase = rollBaseAttributes(rng, base, rarity, itemLevel);
  const afixos = pickAffixes(
    rng,
    base,
    afixDefsById,
    rarity.numAfixos,
    itemLevel,
    rarity.pisoRolagem,
  );

  const refino = { nivel: 0, cap: refineCap };

  return {
    uid: crypto.randomUUID(),
    baseId: base.id,
    nome: formatItemName(base, afixos, afixDefsById, refino.nivel),
    icon: base.icon,
    slot: base.slot,
    weaponType: base.weaponType,
    rarity: rarityId,
    itemLevel,
    nivelRequerido: computeNivelRequerido(base, itemLevel),
    atributosBase,
    afixos,
    refino,
    bloqueado: false,
  };
}
