import { describe, it, expect } from 'vitest';
import { parseRarities, parseRefinement, parseItems } from './load';
import { rarities, refinement, itemDefs } from '../../data';

describe('carregamento de dados', () => {
  it('valida rarities.json com 7 tiers', () => {
    expect(rarities).toHaveLength(7);
    expect(rarities[0].id).toBe('common');
    expect(rarities.at(-1)?.id).toBe('divine');
  });

  it('multiplicador de stats cresce monotonicamente com a raridade', () => {
    for (let i = 1; i < rarities.length; i++) {
      expect(rarities[i].multStats).toBeGreaterThan(rarities[i - 1].multStats);
    }
  });

  it('valida refinement.json (cap 11, tiers cobrindo 1..cap)', () => {
    expect(refinement.cap).toBe(11);
    const alvos = refinement.tiers.map((t) => t.nivelAlvo).sort((a, b) => a - b);
    expect(alvos).toEqual(Array.from({ length: refinement.cap }, (_, i) => i + 1));
  });

  it('valida items.sample.json (bases e afixos)', () => {
    expect(itemDefs.bases.length).toBeGreaterThan(0);
    expect(itemDefs.afixos.length).toBeGreaterThan(0);
    const asaArcanjo = itemDefs.bases.find((b) => b.id === 'asa_arcanjo');
    expect(asaArcanjo?.slot).toBe('wings');
  });

  it('rejeita dados malformados com erro legível', () => {
    expect(() => parseRarities({ rarities: [{ id: 'common' }] })).toThrow(/Dados inválidos/);
    expect(() => parseRefinement({})).toThrow(/Dados inválidos/);
    expect(() => parseItems({ bases: [] })).toThrow(/Dados inválidos/);
  });
});
