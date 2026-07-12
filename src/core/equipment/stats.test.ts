import { describe, it, expect } from 'vitest';
import { computeCharacterStats } from './stats';
import type { Item } from '../items/types';

function itemWith(atributosBase: Record<string, number>, afixos: Item['afixos'] = []): Item {
  return {
    uid: crypto.randomUUID(),
    baseId: 'x',
    nome: 'X',
    slot: 'weapon',
    rarity: 'common',
    itemLevel: 1,
    nivelRequerido: 1,
    atributosBase,
    afixos,
    refino: { nivel: 0, cap: 11 },
    bloqueado: false,
  };
}

describe('computeCharacterStats', () => {
  it('retorna vazio para nenhum item equipado', () => {
    expect(computeCharacterStats([])).toEqual({});
  });

  it('soma stats de múltiplos itens, mesclando chaves repetidas', () => {
    const arma = itemWith({ dano: 10 });
    const armadura = itemWith(
      { defesa: 5 },
      [{ affixId: 'a', tipo: 'prefixo', stat: 'dano', valor: 3 }],
    );
    const total = computeCharacterStats([arma, armadura]);
    expect(total).toEqual({ dano: 13, defesa: 5 });
  });
});
