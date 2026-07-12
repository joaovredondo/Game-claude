/**
 * Regras de equipar/desequipar — ver docs/design/02.
 *
 * Funções puras que operam sobre o mapa `equipamento` (slot → uid). O
 * inventário nunca perde o item ao equipar: `equipamento` é só um ponteiro
 * (ver `SaveGame` em docs/design/13). Isso evita duplicar dados de item.
 */
import type { Slot } from '../data/schema';
import type { Item } from '../items/types';

export type Equipment = Partial<Record<Slot, string>>;

export type EquipResult =
  | { ok: true; equipment: Equipment }
  | { ok: false; reason: 'nivel_insuficiente' };

/** Verifica se o item pode ser equipado no nível atual do personagem. */
export function canEquip(item: Item, characterLevel: number): boolean {
  return item.nivelRequerido <= characterLevel;
}

/**
 * Equipa `item` no seu slot. Se o slot já tiver um item, ele é substituído
 * (o item antigo permanece no inventário — apenas deixa de estar apontado).
 */
export function equip(equipment: Equipment, item: Item, characterLevel: number): EquipResult {
  if (!canEquip(item, characterLevel)) return { ok: false, reason: 'nivel_insuficiente' };
  return { ok: true, equipment: { ...equipment, [item.slot]: item.uid } };
}

/** Remove o item apontado por `slot`, se houver. */
export function unequip(equipment: Equipment, slot: Slot): Equipment {
  if (!(slot in equipment)) return equipment;
  const next = { ...equipment };
  delete next[slot];
  return next;
}
