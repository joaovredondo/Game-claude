import { describe, it, expect, beforeEach } from 'vitest';
import { useInventoryStore } from './inventoryStore';
import { createRng } from '../core/rng';
import { generateItem } from '../core/items/generate';
import { rarities, refinement, itemDefs } from '../data';

const espada = itemDefs.bases.find((b) => b.id === 'espada_ferro')!;
const asaArcanjo = itemDefs.bases.find((b) => b.id === 'asa_arcanjo')!; // nivelRequeridoBase 50

function makeItem(seed: number, itemLevel = 10, base = espada) {
  return generateItem(createRng(seed), {
    base,
    itemLevel,
    rarities,
    afixDefs: itemDefs.afixos,
    refineCap: refinement.cap,
    rarityOverride: 'rare',
  });
}

beforeEach(() => {
  useInventoryStore.setState({ inventory: [], equipment: {}, characterLevel: 1, recursos: {} });
});

describe('inventoryStore', () => {
  it('addItem adiciona ao inventário', () => {
    const item = makeItem(1);
    useInventoryStore.getState().addItem(item);
    expect(useInventoryStore.getState().inventory).toHaveLength(1);
    expect(useInventoryStore.getState().inventory[0].uid).toBe(item.uid);
  });

  it('equipItem equipa quando o nível é suficiente', () => {
    const item = makeItem(1, 5);
    useInventoryStore.getState().addItem(item);
    useInventoryStore.getState().setCharacterLevel(10);

    const result = useInventoryStore.getState().equipItem(item.uid);
    expect(result.ok).toBe(true);
    expect(useInventoryStore.getState().equipment.weapon).toBe(item.uid);
  });

  it('equipItem recusa quando o nível é insuficiente', () => {
    const item = makeItem(1, 50, asaArcanjo);
    useInventoryStore.getState().addItem(item);
    // characterLevel default = 1

    const result = useInventoryStore.getState().equipItem(item.uid);
    expect(result).toEqual({ ok: false, reason: 'nivel_insuficiente' });
    expect(useInventoryStore.getState().equipment.wings).toBeUndefined();
  });

  it('equipItem retorna erro para uid inexistente', () => {
    const result = useInventoryStore.getState().equipItem('uid-inexistente');
    expect(result).toEqual({ ok: false, reason: 'item_nao_encontrado' });
  });

  it('unequipItem libera o slot; item permanece no inventário', () => {
    const item = makeItem(1, 1);
    useInventoryStore.getState().addItem(item);
    useInventoryStore.getState().equipItem(item.uid);

    useInventoryStore.getState().unequipItem('weapon');
    expect(useInventoryStore.getState().equipment.weapon).toBeUndefined();
    expect(useInventoryStore.getState().inventory).toHaveLength(1);
  });

  it('discardItem remove um item destrancado e não equipado', () => {
    const item = makeItem(1);
    useInventoryStore.getState().addItem(item);

    const result = useInventoryStore.getState().discardItem(item.uid);
    expect(result).toEqual({ ok: true });
    expect(useInventoryStore.getState().inventory).toHaveLength(0);
  });

  it('discardItem recusa item trancado', () => {
    const item = makeItem(1);
    useInventoryStore.getState().addItem(item);
    useInventoryStore.getState().toggleLock(item.uid);

    const result = useInventoryStore.getState().discardItem(item.uid);
    expect(result).toEqual({ ok: false, reason: 'item_bloqueado' });
    expect(useInventoryStore.getState().inventory).toHaveLength(1);
  });

  it('discardItem recusa item equipado', () => {
    const item = makeItem(1, 1);
    useInventoryStore.getState().addItem(item);
    useInventoryStore.getState().equipItem(item.uid);

    const result = useInventoryStore.getState().discardItem(item.uid);
    expect(result).toEqual({ ok: false, reason: 'item_equipado' });
  });

  it('fuseItems converte itens elegíveis em recursos e ignora bloqueados/equipados', () => {
    const livre = makeItem(1, 1);
    const trancado = makeItem(2, 1);
    const equipado = makeItem(3, 1);

    const store = useInventoryStore.getState();
    store.addItem(livre);
    store.addItem(trancado);
    store.addItem(equipado);
    store.toggleLock(trancado.uid);
    store.equipItem(equipado.uid);

    const summary = useInventoryStore
      .getState()
      .fuseItems([livre.uid, trancado.uid, equipado.uid]);

    expect(summary.fundidos).toBe(1);
    expect(summary.ignorados).toBe(2);
    expect(summary.recursoGanho).toBeGreaterThan(0);

    const finalState = useInventoryStore.getState();
    expect(finalState.inventory.map((i) => i.uid).sort()).toEqual(
      [trancado.uid, equipado.uid].sort(),
    );
    expect(finalState.recursos.po_forja).toBe(summary.recursoGanho);
  });

  it('toggleLock alterna o estado bloqueado', () => {
    const item = makeItem(1);
    useInventoryStore.getState().addItem(item);

    useInventoryStore.getState().toggleLock(item.uid);
    expect(useInventoryStore.getState().inventory[0].bloqueado).toBe(true);

    useInventoryStore.getState().toggleLock(item.uid);
    expect(useInventoryStore.getState().inventory[0].bloqueado).toBe(false);
  });
});
