import { describe, it, expect } from 'vitest';
import { canEquip, equip, unequip, type Equipment } from './rules';
import { createRng } from '../rng';
import { generateItem } from '../items/generate';
import { rarities, refinement, itemDefs } from '../../data';

const espada = itemDefs.bases.find((b) => b.id === 'espada_ferro')!;
const asaArcanjo = itemDefs.bases.find((b) => b.id === 'asa_arcanjo')!; // nivelRequeridoBase = 50

function makeItem(itemLevel: number, base = espada) {
  return generateItem(createRng(1), {
    base,
    itemLevel,
    rarities,
    afixDefs: itemDefs.afixos,
    refineCap: refinement.cap,
    rarityOverride: 'rare',
  });
}

describe('canEquip', () => {
  it('permite quando o nível do personagem é suficiente', () => {
    const item = makeItem(10);
    expect(canEquip(item, 10)).toBe(true);
    expect(canEquip(item, 20)).toBe(true);
  });

  it('bloqueia quando o nível do personagem é insuficiente', () => {
    const item = makeItem(50, asaArcanjo);
    expect(canEquip(item, 10)).toBe(false);
  });
});

describe('equip / unequip', () => {
  it('equipa um item válido no seu slot', () => {
    const item = makeItem(10);
    const result = equip({}, item, 10);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.equipment.weapon).toBe(item.uid);
  });

  it('recusa equipar item acima do nível do personagem', () => {
    const item = makeItem(50, asaArcanjo);
    const result = equip({}, item, 10);
    expect(result).toEqual({ ok: false, reason: 'nivel_insuficiente' });
  });

  it('substitui o item anterior do mesmo slot', () => {
    const espadaA = makeItem(10);
    const espadaB = generateItem(createRng(2), {
      base: espada,
      itemLevel: 10,
      rarities,
      afixDefs: itemDefs.afixos,
      refineCap: refinement.cap,
      rarityOverride: 'rare',
    });

    const first = equip({}, espadaA, 10);
    expect(first.ok).toBe(true);
    if (!first.ok) return;

    const second = equip(first.equipment, espadaB, 10);
    expect(second.ok).toBe(true);
    if (second.ok) expect(second.equipment.weapon).toBe(espadaB.uid);
  });

  it('unequip remove o ponteiro do slot', () => {
    const item = makeItem(10);
    const equipment: Equipment = { weapon: item.uid };
    expect(unequip(equipment, 'weapon')).toEqual({});
  });

  it('unequip em slot vazio é no-op', () => {
    const equipment: Equipment = {};
    expect(unequip(equipment, 'weapon')).toBe(equipment);
  });
});
