import { describe, it, expect } from 'vitest';
import { createRng } from '../rng';
import { generateItem, formatItemName } from './generate';
import { computeItemStats } from './stats';
import { rarities, refinement, itemDefs } from '../../data';

const espada = itemDefs.bases.find((b) => b.id === 'espada_ferro')!;
const asaArcanjo = itemDefs.bases.find((b) => b.id === 'asa_arcanjo')!;

describe('generateItem', () => {
  it('gera um item com todos os campos do contrato', () => {
    const rng = createRng(1);
    const item = generateItem(rng, {
      base: espada,
      itemLevel: 10,
      rarities,
      afixDefs: itemDefs.afixos,
      refineCap: refinement.cap,
      rarityOverride: 'rare',
    });

    expect(item.uid).toBeTruthy();
    expect(item.baseId).toBe('espada_ferro');
    expect(item.slot).toBe('weapon');
    expect(item.weaponType).toBe('sword');
    expect(item.rarity).toBe('rare');
    expect(item.itemLevel).toBe(10);
    expect(item.refino).toEqual({ nivel: 0, cap: refinement.cap });
    expect(item.bloqueado).toBe(false);
    expect(Object.keys(item.atributosBase)).toEqual(Object.keys(espada.faixasBase));
  });

  it('é determinístico: mesma semente + mesmos inputs → mesmo item', () => {
    const make = () =>
      generateItem(createRng(777), {
        base: asaArcanjo,
        itemLevel: 50,
        rarities,
        afixDefs: itemDefs.afixos,
        refineCap: refinement.cap,
      });
    const a = make();
    const b = make();
    // uid é único por instância (crypto.randomUUID) — compara o resto.
    const { uid: uidA, ...restA } = a;
    const { uid: uidB, ...restB } = b;
    expect(uidA).not.toBe(uidB);
    expect(restA).toEqual(restB);
  });

  it('raridade Comum não recebe afixos; raridades altas recebem mais', () => {
    const rng = createRng(9);
    const comum = generateItem(rng, {
      base: espada,
      itemLevel: 5,
      rarities,
      afixDefs: itemDefs.afixos,
      refineCap: refinement.cap,
      rarityOverride: 'common',
    });
    expect(comum.afixos).toHaveLength(0);

    const epico = generateItem(rng, {
      base: espada,
      itemLevel: 5,
      rarities,
      afixDefs: itemDefs.afixos,
      refineCap: refinement.cap,
      rarityOverride: 'epic',
    });
    // pool de espada_ferro tem 2 prefixos + 2 sufixos = 4 disponíveis; epic pede 3.
    expect(epico.afixos.length).toBeGreaterThan(0);
    expect(epico.afixos.length).toBeLessThanOrEqual(4);
  });

  it('não gera afixos duplicados', () => {
    const rng = createRng(123);
    const item = generateItem(rng, {
      base: asaArcanjo,
      itemLevel: 50,
      rarities,
      afixDefs: itemDefs.afixos,
      refineCap: refinement.cap,
      rarityOverride: 'divine',
    });
    const ids = item.afixos.map((a) => a.affixId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('nivelRequerido nunca fica abaixo do mínimo da base', () => {
    const rng = createRng(4);
    const item = generateItem(rng, {
      base: asaArcanjo, // nivelRequeridoBase = 50
      itemLevel: 1,
      rarities,
      afixDefs: itemDefs.afixos,
      refineCap: refinement.cap,
      rarityOverride: 'common',
    });
    expect(item.nivelRequerido).toBeGreaterThanOrEqual(asaArcanjo.nivelRequeridoBase);
  });

  it('nome inclui prefixo/sufixo quando presentes e "+N" quando refinado', () => {
    const rng = createRng(55);
    const item = generateItem(rng, {
      base: espada,
      itemLevel: 20,
      rarities,
      afixDefs: itemDefs.afixos,
      refineCap: refinement.cap,
      rarityOverride: 'epic',
    });
    expect(item.nome).toContain(espada.nome);

    const afixDefsById = new Map(itemDefs.afixos.map((a) => [a.id, a]));
    const nomeRefinado = formatItemName(espada, item.afixos, afixDefsById, 7);
    expect(nomeRefinado.endsWith('+7')).toBe(true);
  });

  it('poder médio cresce com a raridade (mesma base/itemLevel, muitas amostras)', () => {
    const N = 500;
    const mediaPorRaridade = (rarityId: 'common' | 'rare' | 'divine') => {
      const rng = createRng(31);
      let soma = 0;
      for (let i = 0; i < N; i++) {
        const item = generateItem(rng, {
          base: espada,
          itemLevel: 30,
          rarities,
          afixDefs: itemDefs.afixos,
          refineCap: refinement.cap,
          rarityOverride: rarityId,
        });
        const stats = computeItemStats(item.atributosBase, item.afixos);
        soma += Object.values(stats).reduce((s, v) => s + v, 0);
      }
      return soma / N;
    };

    const mediaComum = mediaPorRaridade('common');
    const mediaRara = mediaPorRaridade('rare');
    const mediaDivina = mediaPorRaridade('divine');

    expect(mediaRara).toBeGreaterThan(mediaComum);
    expect(mediaDivina).toBeGreaterThan(mediaRara);
  });
});
