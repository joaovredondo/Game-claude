import { describe, it, expect } from 'vitest';
import { computeItemGearScore, computeTotalGearScore } from './gearScore';
import { createRng } from '../rng';
import { generateItem } from './generate';
import { computeItemStats } from './stats';
import { rarities, refinement, itemDefs } from '../../data';

const espada = itemDefs.bases.find((b) => b.id === 'espada_ferro')!;

describe('computeItemGearScore', () => {
  it('usa o peso configurado por stat', () => {
    const score = computeItemGearScore({ dano: 10 }, { dano: 2 });
    expect(score).toBe(20);
  });

  it('usa o fallback para stats sem peso explícito', () => {
    const score = computeItemGearScore({ statDesconhecido: 7 }, { dano: 2 });
    expect(score).toBe(7);
  });

  it('é 0 para stats vazios', () => {
    expect(computeItemGearScore({})).toBe(0);
  });
});

describe('computeTotalGearScore', () => {
  it('cresce com a raridade (mesma base/itemLevel, amostra grande)', () => {
    const N = 300;
    const mediaScore = (rarityId: 'common' | 'legendary') => {
      const rng = createRng(11);
      let soma = 0;
      for (let i = 0; i < N; i++) {
        const item = generateItem(rng, {
          base: espada,
          itemLevel: 20,
          rarities,
          afixDefs: itemDefs.afixos,
          refineCap: refinement.cap,
          rarityOverride: rarityId,
        });
        soma += computeTotalGearScore([item]);
      }
      return soma / N;
    };
    expect(mediaScore('legendary')).toBeGreaterThan(mediaScore('common'));
  });

  it('soma o gear score de vários itens equipados', () => {
    const item1 = generateItem(createRng(1), {
      base: espada,
      itemLevel: 10,
      rarities,
      afixDefs: itemDefs.afixos,
      refineCap: refinement.cap,
      rarityOverride: 'rare',
    });
    const item2 = generateItem(createRng(2), {
      base: espada,
      itemLevel: 10,
      rarities,
      afixDefs: itemDefs.afixos,
      refineCap: refinement.cap,
      rarityOverride: 'rare',
    });
    const total = computeTotalGearScore([item1, item2]);
    const esperado =
      computeItemGearScore(computeItemStats(item1.atributosBase, item1.afixos)) +
      computeItemGearScore(computeItemStats(item2.atributosBase, item2.afixos));
    expect(total).toBe(esperado);
  });
});
