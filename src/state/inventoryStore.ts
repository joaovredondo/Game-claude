/**
 * Store de inventário/equipamento (Zustand) — ver docs/design/02, 12, 13.
 *
 * A store só orquestra: toda regra de negócio vive no `core/` (puro,
 * testável sem React). O inventário guarda TODOS os itens (equipados ou
 * não); `equipment` é apenas um ponteiro slot → uid.
 */
import { create } from 'zustand';
import type { Slot } from '../core/data/schema';
import type { Item } from '../core/items/types';
import { equip, unequip, type Equipment } from '../core/equipment/rules';
import { computeFuseYield } from '../core/items/fuse';
import { rarities } from '../data';

export type ActionError =
  | { ok: false; reason: 'nivel_insuficiente' | 'item_nao_encontrado' | 'item_bloqueado' | 'item_equipado' };
export type ActionResult = { ok: true } | ActionError;

export interface FuseSummary {
  fundidos: number;
  ignorados: number;
  recursoGanho: number;
}

interface InventoryState {
  inventory: Item[];
  equipment: Equipment;
  /** Placeholder até a Fase 5 (Progressão) trazer o personagem/leveling de verdade. */
  characterLevel: number;
  recursos: Record<string, number>;

  addItem: (item: Item) => void;
  equipItem: (uid: string) => ActionResult;
  unequipItem: (slot: Slot) => void;
  toggleLock: (uid: string) => void;
  discardItem: (uid: string) => ActionResult;
  fuseItems: (uids: string[]) => FuseSummary;
  setCharacterLevel: (level: number) => void;
}

export const useInventoryStore = create<InventoryState>((set, get) => ({
  inventory: [],
  equipment: {},
  characterLevel: 1,
  recursos: {},

  addItem: (item) => set((s) => ({ inventory: [...s.inventory, item] })),

  equipItem: (uid) => {
    const { inventory, equipment, characterLevel } = get();
    const item = inventory.find((i) => i.uid === uid);
    if (!item) return { ok: false, reason: 'item_nao_encontrado' };

    const result = equip(equipment, item, characterLevel);
    if (!result.ok) return result;

    set({ equipment: result.equipment });
    return { ok: true };
  },

  unequipItem: (slot) => set((s) => ({ equipment: unequip(s.equipment, slot) })),

  toggleLock: (uid) =>
    set((s) => ({
      inventory: s.inventory.map((i) => (i.uid === uid ? { ...i, bloqueado: !i.bloqueado } : i)),
    })),

  discardItem: (uid) => {
    const { inventory, equipment } = get();
    const item = inventory.find((i) => i.uid === uid);
    if (!item) return { ok: false, reason: 'item_nao_encontrado' };
    if (item.bloqueado) return { ok: false, reason: 'item_bloqueado' };
    if (Object.values(equipment).includes(uid)) return { ok: false, reason: 'item_equipado' };

    set({ inventory: inventory.filter((i) => i.uid !== uid) });
    return { ok: true };
  },

  fuseItems: (uids) => {
    const { inventory, equipment, recursos } = get();
    const equippedUids = new Set(Object.values(equipment));
    const uidSet = new Set(uids);

    let fundidos = 0;
    let ignorados = 0;
    let recursoGanho = 0;
    const proximoRecursos = { ...recursos };

    for (const uid of uidSet) {
      const item = inventory.find((i) => i.uid === uid);
      if (!item || item.bloqueado || equippedUids.has(uid)) {
        ignorados++;
        continue;
      }
      const yield_ = computeFuseYield(item, rarities);
      proximoRecursos[yield_.recurso] = (proximoRecursos[yield_.recurso] ?? 0) + yield_.quantidade;
      recursoGanho += yield_.quantidade;
      fundidos++;
    }

    if (fundidos > 0) {
      set({
        inventory: inventory.filter((i) => !uidSet.has(i.uid) || i.bloqueado || equippedUids.has(i.uid)),
        recursos: proximoRecursos,
      });
    }

    return { fundidos, ignorados, recursoGanho };
  },

  setCharacterLevel: (level) => set({ characterLevel: Math.max(1, Math.round(level)) }),
}));
