import { describe, it, expect } from 'vitest';
import { filterItems } from './filter';
import { rarities } from '../../data';
import type { Item } from './types';

function itemOf(overrides: Partial<Item>): Item {
  return {
    uid: crypto.randomUUID(),
    baseId: 'x',
    nome: 'X',
    icon: 'x',
    slot: 'weapon',
    weaponType: 'sword',
    rarity: 'common',
    itemLevel: 1,
    nivelRequerido: 1,
    atributosBase: {},
    afixos: [],
    refino: { nivel: 0, cap: 11 },
    bloqueado: false,
    ...overrides,
  };
}

describe('filterItems', () => {
  const items = [
    itemOf({ slot: 'weapon', weaponType: 'sword', rarity: 'common' }),
    itemOf({ slot: 'weapon', weaponType: 'bow', rarity: 'epic' }),
    itemOf({ slot: 'wings', rarity: 'divine', bloqueado: true }),
  ];

  it('sem critérios retorna tudo', () => {
    expect(filterItems(items, rarities, {})).toHaveLength(3);
  });

  it('filtra por slot', () => {
    const result = filterItems(items, rarities, { slot: 'wings' });
    expect(result).toHaveLength(1);
    expect(result[0].slot).toBe('wings');
  });

  it('filtra por weaponType', () => {
    const result = filterItems(items, rarities, { weaponType: 'bow' });
    expect(result).toHaveLength(1);
    expect(result[0].weaponType).toBe('bow');
  });

  it('filtra por raridade mínima', () => {
    const epicIndex = rarities.findIndex((r) => r.id === 'epic');
    const result = filterItems(items, rarities, { minRarityIndex: epicIndex });
    expect(result).toHaveLength(2);
    expect(result.every((i) => i.rarity === 'epic' || i.rarity === 'divine')).toBe(true);
  });

  it('exclui trancados quando somenteDesbloqueados', () => {
    const result = filterItems(items, rarities, { somenteDesbloqueados: true });
    expect(result.every((i) => !i.bloqueado)).toBe(true);
    expect(result).toHaveLength(2);
  });

  it('combina múltiplos critérios', () => {
    const result = filterItems(items, rarities, { slot: 'weapon', weaponType: 'sword' });
    expect(result).toHaveLength(1);
  });
});
