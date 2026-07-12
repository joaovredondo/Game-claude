import { describe, it, expect } from 'vitest';
import { computeFuseYield } from './fuse';
import { rarities } from '../../data';
import type { Item } from './types';

function itemOfRarity(rarity: Item['rarity'], refinoNivel = 0): Item {
  return {
    uid: crypto.randomUUID(),
    baseId: 'x',
    nome: 'X',
    slot: 'weapon',
    rarity,
    itemLevel: 1,
    nivelRequerido: 1,
    atributosBase: {},
    afixos: [],
    refino: { nivel: refinoNivel, cap: 11 },
    bloqueado: false,
  };
}

describe('computeFuseYield', () => {
  it('rende mais Pó de Forja para raridades maiores', () => {
    const comum = computeFuseYield(itemOfRarity('common'), rarities);
    const divino = computeFuseYield(itemOfRarity('divine'), rarities);
    expect(divino.quantidade).toBeGreaterThan(comum.quantidade);
    expect(comum.recurso).toBe('po_forja');
  });

  it('refino mais alto rende um pouco mais', () => {
    const semRefino = computeFuseYield(itemOfRarity('rare', 0), rarities);
    const refinado = computeFuseYield(itemOfRarity('rare', 5), rarities);
    expect(refinado.quantidade).toBeGreaterThan(semRefino.quantidade);
  });
});
