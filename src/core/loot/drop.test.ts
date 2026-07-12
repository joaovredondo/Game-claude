import { describe, it, expect } from 'vitest';
import { createRng } from '../rng';
import { rollRarity } from './drop';
import { rarities } from '../../data';

describe('rollRarity', () => {
  it('bate a curva de pesos base em 100k sorteios (±1pp)', () => {
    const rng = createRng(2026);
    const counts: Record<string, number> = {};
    const N = 100_000;
    for (let i = 0; i < N; i++) {
      const id = rollRarity(rng, rarities);
      counts[id] = (counts[id] ?? 0) + 1;
    }
    const totalWeight = rarities.reduce((s, r) => s + r.pesoDropBase, 0);
    for (const r of rarities) {
      const esperado = r.pesoDropBase / totalWeight;
      const observado = (counts[r.id] ?? 0) / N;
      expect(observado).toBeCloseTo(esperado, 2);
    }
  });

  it('multiplicador zera efetivamente uma raridade', () => {
    const rng = createRng(1);
    for (let i = 0; i < 1000; i++) {
      const id = rollRarity(rng, rarities, { multiplicador: { common: 0 } });
      expect(id).not.toBe('common');
    }
  });

  it('bonusAditivo aumenta a frequência de uma raridade alta', () => {
    const rngBase = createRng(5);
    const rngBoosted = createRng(5);
    const N = 20_000;
    let baseCount = 0;
    let boostedCount = 0;
    for (let i = 0; i < N; i++) {
      if (rollRarity(rngBase, rarities) === 'divine') baseCount++;
      if (rollRarity(rngBoosted, rarities, { bonusAditivo: { divine: 5 } }) === 'divine')
        boostedCount++;
    }
    expect(boostedCount).toBeGreaterThan(baseCount);
  });
});
