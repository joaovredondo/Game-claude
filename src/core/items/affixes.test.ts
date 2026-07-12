import { describe, it, expect } from 'vitest';
import { createRng } from '../rng';
import { pickAffixes } from './affixes';
import { itemDefs } from '../../data';

const espada = itemDefs.bases.find((b) => b.id === 'espada_ferro')!;
const afixDefsById = new Map(itemDefs.afixos.map((a) => [a.id, a]));

describe('pickAffixes', () => {
  it('retorna vazio quando numAfixos é 0', () => {
    expect(pickAffixes(createRng(1), espada, afixDefsById, 0, 10, 0.5)).toEqual([]);
  });

  it('respeita o teto do pool da base quando numAfixos excede o disponível', () => {
    // espada_ferro tem 2 prefixos + 2 sufixos = 4 no total.
    const rolls = pickAffixes(createRng(2), espada, afixDefsById, 6, 10, 0.5);
    expect(rolls.length).toBeLessThanOrEqual(4);
  });

  it('divide metade/metade entre prefixo e sufixo (prefixo arredonda pra cima)', () => {
    const rolls = pickAffixes(createRng(3), espada, afixDefsById, 3, 10, 0.5);
    const prefixos = rolls.filter((r) => r.tipo === 'prefixo');
    const sufixos = rolls.filter((r) => r.tipo === 'sufixo');
    expect(prefixos.length).toBe(2);
    expect(sufixos.length).toBe(1);
  });

  it('nunca repete o mesmo affixId', () => {
    const rolls = pickAffixes(createRng(4), espada, afixDefsById, 4, 10, 0.5);
    const ids = rolls.map((r) => r.affixId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('todo valor rolado é numérico e não-negativo (faixas da amostra são positivas)', () => {
    const rolls = pickAffixes(createRng(5), espada, afixDefsById, 4, 10, 0.5);
    for (const r of rolls) {
      expect(Number.isFinite(r.valor)).toBe(true);
      expect(r.valor).toBeGreaterThanOrEqual(0);
    }
  });
});
