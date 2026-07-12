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
  useInventoryStore.setState({
    inventory: [],
    equipment: {},
    characterLevel: 1,
    recursos: {},
    refineLog: [],
  });
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

describe('inventoryStore.refineItem', () => {
  it('recusa item inexistente', () => {
    const result = useInventoryStore.getState().refineItem('uid-inexistente', {
      stoneIds: [],
      useSeal: false,
      forjaResultado: 'erro',
    });
    expect(result).toEqual({ ok: false, reason: 'item_nao_encontrado' });
  });

  it('recusa item trancado', () => {
    const item = makeItem(1);
    useInventoryStore.getState().addItem(item);
    useInventoryStore.getState().toggleLock(item.uid);

    const result = useInventoryStore
      .getState()
      .refineItem(item.uid, { stoneIds: [], useSeal: false, forjaResultado: 'erro' });
    expect(result).toEqual({ ok: false, reason: 'item_bloqueado' });
  });

  it('recusa item já no cap de refino', () => {
    const item = { ...makeItem(1), refino: { nivel: refinement.cap, cap: refinement.cap } };
    useInventoryStore.getState().addItem(item);

    const result = useInventoryStore
      .getState()
      .refineItem(item.uid, { stoneIds: [], useSeal: false, forjaResultado: 'erro' });
    expect(result).toEqual({ ok: false, reason: 'refino_maximo' });
  });

  it('recusa quando não há ouro suficiente', () => {
    const item = makeItem(1);
    useInventoryStore.getState().addItem(item);
    useInventoryStore.setState({ recursos: { ouro: 0 } });

    const result = useInventoryStore
      .getState()
      .refineItem(item.uid, { stoneIds: [], useSeal: false, forjaResultado: 'erro' });
    expect(result).toEqual({ ok: false, reason: 'ouro_insuficiente' });
  });

  it('recusa quando não há pedras suficientes', () => {
    const item = makeItem(1);
    useInventoryStore.getState().addItem(item);
    useInventoryStore.setState({ recursos: { ouro: 999_999 } });

    const result = useInventoryStore.getState().refineItem(item.uid, {
      stoneIds: ['pedra_estelar'],
      useSeal: false,
      forjaResultado: 'erro',
    });
    expect(result).toEqual({ ok: false, reason: 'pedra_insuficiente' });
  });

  it('recusa quando pede selo sem ter selo em estoque', () => {
    const item = { ...makeItem(1), refino: { nivel: 7, cap: refinement.cap } }; // próximo é +8 (perigoso)
    useInventoryStore.getState().addItem(item);
    useInventoryStore.setState({ recursos: { ouro: 999_999, selo_protecao: 0 } });

    const result = useInventoryStore
      .getState()
      .refineItem(item.uid, { stoneIds: [], useSeal: true, forjaResultado: 'erro' });
    expect(result).toEqual({ ok: false, reason: 'selo_insuficiente' });
  });

  it('sucesso garantido (chance 100%) sobe o nível, deduz recursos e registra o log', () => {
    const item = makeItem(1);
    useInventoryStore.getState().addItem(item);
    useInventoryStore.setState({
      recursos: { ouro: 999_999, pedra_estelar: 5 },
    });

    const stoneIds = Array(5).fill('pedra_estelar');
    const result = useInventoryStore
      .getState()
      .refineItem(item.uid, { stoneIds, useSeal: false, forjaResultado: 'perfeito' });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.chanceFinal).toBe(1); // clamp em 100% garante sucesso determinístico
    expect(result.sucesso).toBe(true);

    const state = useInventoryStore.getState();
    const atualizado = state.inventory.find((i) => i.uid === item.uid)!;
    expect(atualizado.refino.nivel).toBe(1);
    expect(atualizado.nome.endsWith('+1')).toBe(true);
    expect(state.recursos.ouro).toBe(999_999 - 100); // custo do tier +1
    expect(state.recursos.pedra_estelar).toBe(0);
    expect(state.refineLog).toHaveLength(1);
    expect(state.refineLog[0].sucesso).toBe(true);
  });

  it('mantém o ponteiro de equipamento intacto ao refinar com sucesso um item equipado', () => {
    // A destruição em si (e o desequipar automático correspondente) é
    // probabilística e já coberta deterministicamente em core/refine/refine.test.ts
    // via um Rng fixo; aqui garantimos que o caminho de sucesso não quebra
    // o ponteiro slot→uid do item que estava equipado.
    const item = makeItem(1, 1);
    useInventoryStore.getState().addItem(item);
    useInventoryStore.getState().equipItem(item.uid);
    useInventoryStore.setState({ recursos: { ouro: 999_999, pedra_estelar: 5 } });

    useInventoryStore.getState().refineItem(item.uid, {
      stoneIds: Array(5).fill('pedra_estelar'),
      useSeal: false,
      forjaResultado: 'perfeito',
    });

    const state = useInventoryStore.getState();
    expect(state.equipment.weapon).toBe(item.uid);
  });
});
