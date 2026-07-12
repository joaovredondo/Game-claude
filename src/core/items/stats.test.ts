import { describe, it, expect } from 'vitest';
import { createRng } from '../rng';
import { rollBaseAttributes, computeItemStats, computeNivelRequerido } from './stats';
import { rarities, itemDefs } from '../../data';

const espada = itemDefs.bases.find((b) => b.id === 'espada_ferro')!;
const common = rarities.find((r) => r.id === 'common')!;
const divine = rarities.find((r) => r.id === 'divine')!;

describe('rollBaseAttributes', () => {
  it('produz uma chave por atributo definido na base', () => {
    const rng = createRng(1);
    const atributos = rollBaseAttributes(rng, espada, common, 10);
    expect(Object.keys(atributos)).toEqual(Object.keys(espada.faixasBase));
  });

  it('multiplicador de raridade maior tende a valores maiores (mesma semente/base/nível)', () => {
    const N = 300;
    const somaFor = (rarity: typeof common) => {
      const rng = createRng(42);
      let soma = 0;
      for (let i = 0; i < N; i++) {
        const atributos = rollBaseAttributes(rng, espada, rarity, 10);
        soma += atributos.dano;
      }
      return soma;
    };
    expect(somaFor(divine)).toBeGreaterThan(somaFor(common));
  });

  it('itemLevel maior aumenta o valor esperado do atributo', () => {
    const N = 300;
    const somaFor = (itemLevel: number) => {
      const rng = createRng(7);
      let soma = 0;
      for (let i = 0; i < N; i++) {
        soma += rollBaseAttributes(rng, espada, common, itemLevel).dano;
      }
      return soma;
    };
    expect(somaFor(80)).toBeGreaterThan(somaFor(1));
  });
});

describe('computeItemStats', () => {
  it('soma os valores dos afixos aos atributos base, por stat', () => {
    const base = { dano: 10, defesa: 5 };
    const afixos = [
      { affixId: 'a', tipo: 'prefixo' as const, stat: 'dano', valor: 3 },
      { affixId: 'b', tipo: 'sufixo' as const, stat: 'critChance', valor: 2 },
    ];
    const total = computeItemStats(base, afixos);
    expect(total).toEqual({ dano: 13, defesa: 5, critChance: 2 });
  });

  it('não sofre efeito colateral no objeto de atributos base recebido', () => {
    const base = { dano: 10 };
    computeItemStats(base, [{ affixId: 'a', tipo: 'prefixo', stat: 'dano', valor: 5 }]);
    expect(base.dano).toBe(10);
  });
});

describe('computeNivelRequerido', () => {
  it('nunca fica abaixo do mínimo da base', () => {
    expect(computeNivelRequerido(espada, 0)).toBeGreaterThanOrEqual(espada.nivelRequeridoBase);
  });

  it('acompanha o itemLevel quando ele supera o mínimo da base', () => {
    expect(computeNivelRequerido(espada, 40)).toBe(40);
  });
});
