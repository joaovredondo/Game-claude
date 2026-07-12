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
import { resolveRefine, type ForjaResultado } from '../core/refine/refine';
import { createRng, randomSeed } from '../core/rng';
import { rarities, refinement } from '../data';

export type ActionError =
  | { ok: false; reason: 'nivel_insuficiente' | 'item_nao_encontrado' | 'item_bloqueado' | 'item_equipado' };
export type ActionResult = { ok: true } | ActionError;

export interface FuseSummary {
  fundidos: number;
  ignorados: number;
  recursoGanho: number;
}

export interface RefineAttemptOptions {
  stoneIds: string[];
  useSeal: boolean;
  forjaResultado: ForjaResultado;
}

export type RefineActionError =
  | { ok: false; reason: 'item_nao_encontrado' | 'item_bloqueado' | 'refino_maximo' | 'ouro_insuficiente' | 'pedra_insuficiente' | 'selo_insuficiente' };
export type RefineActionResult =
  | { ok: true; sucesso: boolean; destruido: boolean; chanceFinal: number }
  | RefineActionError;

export interface RefineLogEntry {
  id: string;
  itemNomeAntes: string;
  nivelAlvo: number;
  sucesso: boolean;
  destruido: boolean;
  chanceFinal: number;
  timestamp: number;
}

const MAX_LOG_ENTRIES = 50;

/**
 * Recursos iniciais só para permitir demonstrar/testar a Forja desde já.
 * A aquisição real (drops de Fratura, economia) chega nas Fases 4/5/8.
 */
const RECURSOS_INICIAIS: Record<string, number> = {
  ouro: 50_000,
  pedra_bruta: 20,
  pedra_polida: 10,
  pedra_arcana: 6,
  pedra_estelar: 3,
  selo_protecao: 3,
  po_forja: 0,
};

interface InventoryState {
  inventory: Item[];
  equipment: Equipment;
  /** Placeholder até a Fase 5 (Progressão) trazer o personagem/leveling de verdade. */
  characterLevel: number;
  recursos: Record<string, number>;
  refineLog: RefineLogEntry[];

  addItem: (item: Item) => void;
  equipItem: (uid: string) => ActionResult;
  unequipItem: (slot: Slot) => void;
  toggleLock: (uid: string) => void;
  discardItem: (uid: string) => ActionResult;
  fuseItems: (uids: string[]) => FuseSummary;
  setCharacterLevel: (level: number) => void;
  refineItem: (uid: string, options: RefineAttemptOptions) => RefineActionResult;
}

export const useInventoryStore = create<InventoryState>((set, get) => ({
  inventory: [],
  equipment: {},
  characterLevel: 1,
  recursos: { ...RECURSOS_INICIAIS },
  refineLog: [],

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

  refineItem: (uid, options) => {
    const { inventory, equipment, recursos } = get();
    const item = inventory.find((i) => i.uid === uid);
    if (!item) return { ok: false, reason: 'item_nao_encontrado' };
    if (item.bloqueado) return { ok: false, reason: 'item_bloqueado' };
    if (item.refino.nivel >= item.refino.cap) return { ok: false, reason: 'refino_maximo' };

    const nivelAlvo = item.refino.nivel + 1;
    const tier = refinement.tiers.find((t) => t.nivelAlvo === nivelAlvo);
    if (!tier) return { ok: false, reason: 'refino_maximo' };

    if ((recursos.ouro ?? 0) < tier.custoOuro) return { ok: false, reason: 'ouro_insuficiente' };

    const pedraContagem = new Map<string, number>();
    for (const id of options.stoneIds) pedraContagem.set(id, (pedraContagem.get(id) ?? 0) + 1);
    for (const [id, qtd] of pedraContagem) {
      if ((recursos[id] ?? 0) < qtd) return { ok: false, reason: 'pedra_insuficiente' };
    }
    if (options.useSeal && (recursos.selo_protecao ?? 0) < 1) {
      return { ok: false, reason: 'selo_insuficiente' };
    }

    const rng = createRng(randomSeed());
    const result = resolveRefine(rng, item, options, refinement);

    const novoRecursos = { ...recursos };
    novoRecursos.ouro = (novoRecursos.ouro ?? 0) - tier.custoOuro;
    for (const [id, qtd] of pedraContagem) novoRecursos[id] = (novoRecursos[id] ?? 0) - qtd;
    if (options.useSeal) novoRecursos.selo_protecao = (novoRecursos.selo_protecao ?? 0) - 1;

    let novoInventory: Item[];
    let novoEquipment = equipment;
    if (result.destruido) {
      novoInventory = inventory.filter((i) => i.uid !== uid);
      if (Object.values(equipment).includes(uid)) {
        novoEquipment = unequip(equipment, item.slot);
      }
    } else {
      novoInventory = inventory.map((i) => (i.uid === uid ? result.item! : i));
    }

    const logEntry: RefineLogEntry = {
      id: crypto.randomUUID(),
      itemNomeAntes: item.nome,
      nivelAlvo: result.nivelAlvo,
      sucesso: result.sucesso,
      destruido: result.destruido,
      chanceFinal: result.chanceFinal,
      timestamp: Date.now(),
    };

    set({
      inventory: novoInventory,
      equipment: novoEquipment,
      recursos: novoRecursos,
      refineLog: [logEntry, ...get().refineLog].slice(0, MAX_LOG_ENTRIES),
    });

    return { ok: true, sucesso: result.sucesso, destruido: result.destruido, chanceFinal: result.chanceFinal };
  },
}));
